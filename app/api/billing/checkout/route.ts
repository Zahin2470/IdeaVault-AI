import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createCheckoutUrl } from "@/lib/services/billing.service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.email) return NextResponse.json({ error: "Account has no email on file" }, { status: 400 });

  try {
    const url = await createCheckoutUrl(user.id, user.email);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't start checkout." },
      { status: 502 }
    );
  }
}
