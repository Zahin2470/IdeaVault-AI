import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/billing/stripe";

export async function getSubscription(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

// True Pro access — used by feature gating (e.g. the AI daily limit),
// not just "has a Subscription row", since a canceled/past_due row still
// exists but shouldn't grant anything.
export async function hasActiveSubscription(userId: string) {
  const sub = await getSubscription(userId);
  return sub?.status === "ACTIVE" || sub?.status === "TRIALING";
}

// Reuses the existing Stripe customer if the user already has one
// (e.g. re-subscribing after a cancellation) instead of creating a
// duplicate. subscription_data.metadata carries userId onto the
// resulting Subscription object, so the webhook never has to look up a
// customer → user mapping.
export async function createCheckoutUrl(userId: string, email: string) {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_PRICE_ID is not configured.");

  const existing = await getSubscription(userId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existing?.stripeCustomerId,
    customer_email: existing ? undefined : email,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { userId } },
    success_url: `${appUrl}/settings?billing=success`,
    cancel_url: `${appUrl}/settings?billing=canceled`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

// Stripe's hosted billing portal — cancel, update card, view invoices —
// so none of that needs to be built here.
export async function createPortalUrl(userId: string) {
  const sub = await getSubscription(userId);
  if (!sub) return null;

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return session.url;
}

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
      return "ACTIVE" as const;
    case "trialing":
      return "TRIALING" as const;
    case "past_due":
      return "PAST_DUE" as const;
    case "canceled":
    case "unpaid":
      return "CANCELED" as const;
    default:
      return "INCOMPLETE" as const;
  }
}

// Called from the webhook for checkout.session.completed and every
// customer.subscription.* event — same upsert regardless of which
// event triggered it, since a Stripe Subscription object is always the
// full current state, not a diff.
export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const data = {
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id ?? "",
    status: mapStripeStatus(subscription.status),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  };

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
