import { getResend, EMAIL_FROM } from "@/lib/email/resend";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Minimal inline HTML — no template engine needed for two short
// transactional emails. Both degrade gracefully: if RESEND_API_KEY isn't
// set, the caller catches the thrown error and logs the link to the
// server console instead, so local dev works without an email account.
export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${appUrl()}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Reset your IdeaVault AI password",
    html: `
      <p>Someone requested a password reset for this email address.</p>
      <p><a href="${link}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${appUrl()}/verify-email?token=${token}`;

  await getResend().emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Verify your IdeaVault AI email",
    html: `
      <p>Welcome to IdeaVault AI — confirm this is your email address:</p>
      <p><a href="${link}">Verify your email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}
