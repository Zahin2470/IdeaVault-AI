import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listNotifications, countUnread } from "@/lib/services/notification.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(user.id),
    countUnread(user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
