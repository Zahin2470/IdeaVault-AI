import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createTaskSchema } from "@/lib/validations/roadmap";
import { listTasks, createTask } from "@/lib/services/task.service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await listTasks(user.id, params.id);
  if (tasks === null) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ tasks });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const task = await createTask(user.id, params.id, parsed.data);
  if (!task) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ task }, { status: 201 });
}
