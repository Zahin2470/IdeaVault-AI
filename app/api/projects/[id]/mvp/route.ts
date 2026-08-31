import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { mvpPlanSchema } from "@/lib/validations/mvp";
import { upsertMVPPlan } from "@/lib/services/mvp.service";

// Plan fields only (goal/coreUsers/coreProblem/successCriteria). Full
// plan + feature scope for display comes from GET /api/projects/:id.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = mvpPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const plan = await upsertMVPPlan(user.id, params.id, parsed.data);
  if (!plan) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ mvpPlan: plan });
}
