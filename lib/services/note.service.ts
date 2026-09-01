import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createNoteSchema, updateNoteSchema } from "@/lib/validations/note";

type CreateNoteInput = z.infer<typeof createNoteSchema>;
type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  return !!project;
}

async function getOwnedNote(userId: string, noteId: string) {
  const note = await prisma.note.findUnique({ where: { id: noteId }, include: { project: true } });
  if (!note || note.project.userId !== userId) return null;
  return note;
}

export async function listNotes(userId: string, projectId: string) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;
  return prisma.note.findMany({
    where: { projectId },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
}

export async function createNote(userId: string, projectId: string, data: CreateNoteInput) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;
  return prisma.note.create({ data: { projectId, ...data } });
}

export async function updateNote(userId: string, noteId: string, data: UpdateNoteInput) {
  const note = await getOwnedNote(userId, noteId);
  if (!note) return null;
  return prisma.note.update({ where: { id: noteId }, data });
}

export async function deleteNote(userId: string, noteId: string) {
  const note = await getOwnedNote(userId, noteId);
  if (!note) return null;
  await prisma.note.delete({ where: { id: noteId } });
  return true;
}
