import { prisma } from "@/lib/db/prisma";

export type ProjectRole = "OWNER" | "EDITOR" | "VIEWER";

// The single source of truth for "who can do what" on a project.
// OWNER always comes from Project.userId, never from a ProjectMember
// row — a ProjectMember only ever represents someone invited in later.
export async function getProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  if (!project) return null;
  if (project.userId === userId) return "OWNER";

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return membership?.role ?? null;
}

// VIEWER and above can see everything in the workspace.
export async function canViewProject(userId: string, projectId: string) {
  return (await getProjectRole(userId, projectId)) !== null;
}

// EDITOR and OWNER can create/update/delete content inside the project.
// VIEWER is read-only everywhere.
export async function canEditProject(userId: string, projectId: string) {
  const role = await getProjectRole(userId, projectId);
  return role === "OWNER" || role === "EDITOR";
}

// Only the true owner can manage membership, invites, or delete/rename
// the project itself.
export async function isProjectOwner(userId: string, projectId: string) {
  return (await getProjectRole(userId, projectId)) === "OWNER";
}
