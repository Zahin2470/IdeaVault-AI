import { NextResponse } from "next/server";
import { verifyEmailSchema } from "@/lib/validations/password-reset";
import { verifyEmail } from "@/lib/services/email-verification.service";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const result = await verifyEmail(parsed.data.token);
  if (!result.ok) {
    return NextResponse.json(
      { error: "This verification link is invalid or has expired." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
