import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { inviteSchema } from "@/lib/validations/member";
import { createInvite } from "@/lib/services/member.service";

// Returns the invite link directly (no email service is wired up) —
// the owner copies and shares it themselves. Free-tier-friendly, same
// spirit as the Gemini AI provider choice.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const invite = await createInvite(user.id, params.id, parsed.data.email, parsed.data.role);
  if (!invite) {
    return NextResponse.json({ error: "Only the project owner can invite people" }, { status: 403 });
  }

  return NextResponse.json({ invite }, { status: 201 });
}
