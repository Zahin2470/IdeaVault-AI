import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateMilestoneSchema } from "@/lib/validations/roadmap";
import { updateMilestone, deleteMilestone } from "@/lib/services/milestone.service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const milestone = await updateMilestone(user.id, params.id, parsed.data);
  if (!milestone) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });

  return NextResponse.json({ milestone });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await deleteMilestone(user.id, params.id);
  if (!ok) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
