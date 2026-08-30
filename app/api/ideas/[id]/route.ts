import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateIdeaSchema } from "@/lib/validations/idea";
import { getIdea, updateIdea, deleteIdea } from "@/lib/services/idea.service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idea = await getIdea(user.id, params.id);
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  return NextResponse.json({ idea });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateIdeaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const idea = await updateIdea(user.id, params.id, parsed.data);
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  return NextResponse.json({ idea });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await deleteIdea(user.id, params.id);
  if (!ok) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
