import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createProjectSchema } from "@/lib/validations/project";
import { createProjectFromIdea, listProjects } from "@/lib/services/project.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await listProjects(user.id);
  return NextResponse.json({ projects });
}

// §57 — creates a project from an existing idea (idea → project conversion).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const project = await createProjectFromIdea(user.id, parsed.data.ideaId);
  if (!project) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  return NextResponse.json({ project }, { status: 201 });
}
