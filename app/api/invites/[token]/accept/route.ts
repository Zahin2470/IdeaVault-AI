import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { acceptInvite } from "@/lib/services/member.service";

const ERROR_MESSAGES: Record<string, string> = {
  not_found: "This invite link is invalid or has already been used.",
  expired: "This invite has expired — ask the project owner to send a new one.",
  email_mismatch: "This invite was sent to a different email address than the one you're signed in with.",
};

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await acceptInvite(user.id, user.email ?? "", params.token);
  if (!result.ok) {
    const status = result.error === "email_mismatch" ? 403 : 404;
    return NextResponse.json({ error: ERROR_MESSAGES[result.error] }, { status });
  }

  return NextResponse.json({ projectId: result.projectId });
}
