import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { markRead } from "@/lib/services/notification.service";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notification = await markRead(user.id, params.id);
  if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

  return NextResponse.json({ notification });
}
