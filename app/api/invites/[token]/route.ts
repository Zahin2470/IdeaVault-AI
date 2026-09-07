import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getInviteDetails } from "@/lib/services/member.service";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invite = await getInviteDetails(params.token);
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

  return NextResponse.json({ invite });
}
