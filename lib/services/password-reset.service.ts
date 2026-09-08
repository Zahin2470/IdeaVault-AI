import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/email/send";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESET_PREFIX = "reset:";

// Always succeeds from the caller's perspective, whether or not the
// email exists — the route never reveals which, to avoid leaking which
// addresses have accounts. Logs the link to the server console when
// RESEND_API_KEY isn't configured, so this is testable without email set up.
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) return; // OAuth-only accounts have nothing to reset

  const token = randomBytes(32).toString("hex");
  const identifier = `${RESET_PREFIX}${user.email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (err) {
    console.log(`[password-reset] RESEND_API_KEY not configured — reset link for ${user.email}:`);
    console.log(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`);
  }
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: "invalid_or_expired" };

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || !record.identifier.startsWith(RESET_PREFIX) || record.expires < new Date()) {
    return { ok: false, error: "invalid_or_expired" };
  }

  const email = record.identifier.slice(RESET_PREFIX.length);
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { passwordHash } }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { ok: true };
}
