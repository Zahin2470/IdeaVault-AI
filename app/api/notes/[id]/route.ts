import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateNoteSchema } from "@/lib/validations/note";
import { updateNote, deleteNote } from "@/lib/services/note.service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const note = await updateNote(user.id, params.id, parsed.data);
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  return NextResponse.json({ note });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await deleteNote(user.id, params.id);
  if (!ok) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
