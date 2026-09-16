"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionData {
  status: string;
  currentPeriodEnd: string;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Pro",
  TRIALING: "Pro (trial)",
  PAST_DUE: "Past due",
  CANCELED: "Canceled",
  INCOMPLETE: "Incomplete",
};

// Phase 13 — Stripe billing. Free plan has no Subscription row at all;
// anything else means the user has been through checkout at least once.
export function BillingSection() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => r.json())
      .then(({ subscription }) => {
        setSubscription(subscription);
        setLoading(false);
      });
  }, []);

  async function handleUpgrade() {
    setRedirecting(true);
    setError(null);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    setRedirecting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't start checkout.");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  async function handleManage() {
    setRedirecting(true);
    setError(null);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    setRedirecting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't open the billing portal.");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  const isPro = subscription?.status === "ACTIVE" || subscription?.status === "TRIALING";

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">Plan & Billing</h2>

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {subscription ? STATUS_LABEL[subscription.status] : "Free"} plan
              </p>
              {subscription && isPro && (
                <p className="text-xs text-muted-foreground">
                  Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
              {!isPro && (
                <p className="text-xs text-muted-foreground">50 AI calls/day. Pro gets 500/day.</p>
              )}
            </div>
            {subscription && <Badge variant={isPro ? "accent" : "default"}>{STATUS_LABEL[subscription.status]}</Badge>}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2">
            {!isPro && (
              <Button onClick={handleUpgrade} disabled={redirecting} className="w-fit">
                {redirecting ? "Redirecting..." : "Upgrade to Pro"}
              </Button>
            )}
            {subscription && (
              <Button variant="outline" onClick={handleManage} disabled={redirecting} className="w-fit">
                Manage Billing
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
