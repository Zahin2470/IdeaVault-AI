import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/services/project.service";
import { listNotes } from "@/lib/services/note.service";
import { NoteList } from "@/components/notes/note-list";

export default async function NotesPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, params.projectId);
  if (!project) notFound();

  const notes = (await listNotes(user.id, params.projectId)) ?? [];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight">Notes</h2>
      <NoteList projectId={project.id} initialNotes={notes} />
    </div>
  );
}
