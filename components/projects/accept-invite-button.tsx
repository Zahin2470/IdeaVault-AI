"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AcceptInviteButton({ token, projectId }: { token: string; projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't accept the invite. Please try again.");
      return;
    }

    router.push(`/projects/${projectId}`);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleAccept} disabled={loading} className="w-fit">
        {loading ? "Joining..." : "Accept & Join Project"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
