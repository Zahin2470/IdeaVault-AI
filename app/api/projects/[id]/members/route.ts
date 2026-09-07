import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listMembersAndInvites } from "@/lib/services/member.service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await listMembersAndInvites(user.id, params.id);
  if (!result) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json(result);
}
