import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/password-reset";
import { resetPassword } from "@/lib/services/password-reset.service";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const result = await resetPassword(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
