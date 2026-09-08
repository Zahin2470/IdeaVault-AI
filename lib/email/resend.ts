import { Resend } from "resend";

// Same lazy-init pattern as the Stripe client — don't crash on import
// when RESEND_API_KEY isn't set yet, only actually sending an email
// requires it configured.
let client: Resend | null = null;

export function getResend(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not configured. Get a free key at https://resend.com/api-keys");
    }
    client = new Resend(key);
  }
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "IdeaVault AI <onboarding@resend.dev>";
