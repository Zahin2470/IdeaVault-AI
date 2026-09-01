import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateTaskSchema } from "@/lib/validations/roadmap";
import { updateTask, deleteTask } from "@/lib/services/task.service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const task = await updateTask(user.id, params.id, parsed.data);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  return NextResponse.json({ task });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await deleteTask(user.id, params.id);
  if (!ok) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
