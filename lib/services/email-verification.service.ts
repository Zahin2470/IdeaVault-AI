import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmail } from "@/lib/email/send";

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const VERIFY_PREFIX = "verify:";

export async function sendVerificationEmailFor(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.emailVerified) return;

  const token = randomBytes(32).toString("hex");
  const identifier = `${VERIFY_PREFIX}${user.email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + VERIFY_TOKEN_TTL_MS) },
  });

  try {
    await sendVerificationEmail(user.email, token);
  } catch (err) {
    console.log(`[email-verification] RESEND_API_KEY not configured — verify link for ${user.email}:`);
    console.log(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verify-email?token=${token}`);
  }
}

export type VerifyEmailResult = { ok: true } | { ok: false; error: "invalid_or_expired" };

export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || !record.identifier.startsWith(VERIFY_PREFIX) || record.expires < new Date()) {
    return { ok: false, error: "invalid_or_expired" };
  }

  const email = record.identifier.slice(VERIFY_PREFIX.length);

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { ok: true };
}
