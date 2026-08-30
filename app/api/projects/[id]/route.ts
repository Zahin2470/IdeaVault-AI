import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateProjectSchema } from "@/lib/validations/project";
import { getProject, updateProject, deleteProject } from "@/lib/services/project.service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await getProject(user.id, params.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ project });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const project = await updateProject(user.id, params.id, parsed.data);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ project });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await deleteProject(user.id, params.id);
  if (!ok) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
