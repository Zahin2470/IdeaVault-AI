import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { markAllRead } from "@/lib/services/notification.service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await markAllRead(user.id);
  return NextResponse.json({ success: true });
}
