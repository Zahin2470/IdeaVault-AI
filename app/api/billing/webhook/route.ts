import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { syncSubscriptionFromStripe } from "@/lib/services/billing.service";

// Must run on the Node runtime (not Edge) — the Stripe SDK isn't
// Edge-compatible, and signature verification needs the exact raw
// request body, which is why this reads req.text() instead of req.json().
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    // Fires once at checkout completion — fetch the full subscription
    // object rather than trusting the checkout session's partial data.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(session.subscription as string);
        await syncSubscriptionFromStripe(subscription);
      }
      break;
    }

    // Covers renewals, upgrades/downgrades, cancellation (status flips
    // to canceled here rather than the object disappearing).
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
