import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { sendVerificationEmailFor } from "@/lib/services/email-verification.service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await sendVerificationEmailFor(user.id);
  return NextResponse.json({ success: true });
}
