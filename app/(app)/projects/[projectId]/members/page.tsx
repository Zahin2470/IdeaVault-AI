import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/services/project.service";
import { MembersPanel } from "@/components/projects/members-panel";

export default async function MembersPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, params.projectId);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight">Members</h2>
      <MembersPanel projectId={project.id} />
    </div>
  );
}
