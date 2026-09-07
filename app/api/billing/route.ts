import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getSubscription } from "@/lib/services/billing.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await getSubscription(user.id);
  return NextResponse.json({ subscription });
}
