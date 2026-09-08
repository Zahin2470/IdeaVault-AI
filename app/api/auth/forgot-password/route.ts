import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/password-reset";
import { requestPasswordReset } from "@/lib/services/password-reset.service";

// Always returns the same success response whether or not the email
// exists — this is the anti-enumeration guarantee, so the response
// itself must never branch on lookup result.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await requestPasswordReset(parsed.data.email);
  return NextResponse.json({ success: true });
}
