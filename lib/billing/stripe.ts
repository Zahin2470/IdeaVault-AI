import Stripe from "stripe";

// Lazily constructed so the app doesn't crash on import when
// STRIPE_SECRET_KEY isn't set (e.g. running the rest of the app without
// billing configured yet) — only billing routes ever touch this.
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured. Get test keys at https://dashboard.stripe.com/test/apikeys");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}
