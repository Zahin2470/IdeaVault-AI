import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { removeMember } from "@/lib/services/member.service";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; userId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await removeMember(user.id, params.id, params.userId);
  if (!ok) return NextResponse.json({ error: "Not found, or you're not the project owner" }, { status: 404 });

  return NextResponse.json({ success: true });
}
