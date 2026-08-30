import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { problemSchema } from "@/lib/validations/project";
import { upsertProblem } from "@/lib/services/project.service";

// §19-21 — editable section, always available for the user to update
// directly; AI ("Improve with AI") only ever proposes changes here
// starting in Phase 6, never writes directly.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = problemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const result = await upsertProblem(user.id, params.id, parsed.data);
  if (!result) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ problem: result });
}
