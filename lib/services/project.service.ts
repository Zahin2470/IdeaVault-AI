import { prisma } from "@/lib/db/prisma";
import type {
  UpdateProjectInput,
  ProblemInput,
  AudienceInput,
  SolutionInput,
} from "@/lib/services/project.types";
import { canViewProject, canEditProject, isProjectOwner } from "@/lib/services/access.service";

// Any project member (owner, editor, or viewer) can read the full
// workspace — collaboration means shared visibility, not shared
// ownership.
export async function getProject(userId: string, id: string) {
  if (!(await canViewProject(userId, id))) return null;

  return prisma.project.findUnique({
    where: { id },
    include: {
      idea: true,
      problem: true,
      audience: true,
      solution: true,
      features: { orderBy: { order: "asc" } },
      mvpPlan: { include: { mvpFeatures: true } },
      tasks: { select: { status: true } },
      _count: { select: { tasks: true } },
    },
  });
}

// Includes projects the user owns AND projects they've been added to as
// a member, so a shared project shows up in the collaborator's list too.
export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { OR: [{ userId }, { members: { some: { userId } } }] },
    include: { _count: { select: { features: true, tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

// §57 — Idea → Project conversion. Always creates the caller as owner;
// converting someone else's idea isn't possible since ideas themselves
// stay personal (never shared).
export async function createProjectFromIdea(userId: string, ideaId: string) {
  const idea = await prisma.idea.findFirst({ where: { id: ideaId, userId } });
  if (!idea) return null;

  const existing = await prisma.project.findUnique({ where: { ideaId } });
  if (existing) return existing;

  return prisma.project.create({
    data: { userId, ideaId, name: idea.title },
  });
}

// Renaming/status changes and deletion are owner-only — editors can
// change everything inside the project, but not the project itself.
export async function updateProject(userId: string, id: string, data: UpdateProjectInput) {
  if (!(await isProjectOwner(userId, id))) return null;
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(userId: string, id: string) {
  if (!(await isProjectOwner(userId, id))) return null;
  await prisma.project.delete({ where: { id } });
  return true;
}

export async function upsertProblem(userId: string, projectId: string, data: ProblemInput) {
  if (!(await canEditProject(userId, projectId))) return null;
  return prisma.projectProblem.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
}

export async function upsertAudience(userId: string, projectId: string, data: AudienceInput) {
  if (!(await canEditProject(userId, projectId))) return null;
  return prisma.projectAudience.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
}

export async function upsertSolution(userId: string, projectId: string, data: SolutionInput) {
  if (!(await canEditProject(userId, projectId))) return null;
  return prisma.projectSolution.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
}
