import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/password-reset";
import { requestPasswordReset } from "@/lib/services/password-reset.service";
import { checkRateLimit, getClientIp } from "@/lib/services/rate-limit.service";

// Always returns the same success response whether or not the email
// exists — this is the anti-enumeration guarantee, so the response
// itself must never branch on lookup result, including when rate
// limited: if either limit is hit, this silently skips sending but
// still returns the identical success message.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  const [ipAllowed, emailAllowed] = await Promise.all([
    checkRateLimit(`forgot-password:ip:${ip}`, 5, 60 * 60 * 1000), // 5/hour/IP
    checkRateLimit(`forgot-password:email:${parsed.data.email.toLowerCase()}`, 3, 60 * 60 * 1000), // 3/hour/email
  ]);

  if (ipAllowed && emailAllowed) {
    await requestPasswordReset(parsed.data.email);
  }

  return NextResponse.json({ success: true });
}
