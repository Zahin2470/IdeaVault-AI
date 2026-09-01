import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createMilestoneSchema } from "@/lib/validations/roadmap";
import { listMilestones, createMilestone } from "@/lib/services/milestone.service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const milestones = await listMilestones(user.id, params.id);
  if (milestones === null) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ milestones });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const milestone = await createMilestone(user.id, params.id, parsed.data);
  if (!milestone) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ milestone }, { status: 201 });
}
