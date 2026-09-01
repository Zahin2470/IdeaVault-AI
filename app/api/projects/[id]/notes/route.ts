import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createNoteSchema } from "@/lib/validations/note";
import { listNotes, createNote } from "@/lib/services/note.service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await listNotes(user.id, params.id);
  if (notes === null) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ notes });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const note = await createNote(user.id, params.id, parsed.data);
  if (!note) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ note }, { status: 201 });
}
