import type { ReactNode } from "react";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/services/project.service";
import { ProjectSidebar } from "@/components/projects/project-sidebar";

// Workspace shell (§17, §58): header with project name/status, sub-nav,
// content area. Ownership is re-checked here (not just in the API
// routes) so a signed-in user can never even render another user's
// project shell.
export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { projectId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, params.projectId);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        {project.idea?.description && (
          <p className="text-sm text-muted-foreground">{project.idea.description}</p>
        )}
      </div>
      <div className="flex gap-6">
        <ProjectSidebar projectId={project.id} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
