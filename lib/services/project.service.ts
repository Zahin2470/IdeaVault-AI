import { prisma } from "@/lib/db/prisma";
import type {
  UpdateProjectInput,
  ProblemInput,
  AudienceInput,
  SolutionInput,
} from "@/lib/services/project.types";

// Full workspace read — everything the Overview page (§18) and sub-nav
// need in one round trip.
export async function getProject(userId: string, id: string) {
  return prisma.project.findFirst({
    where: { id, userId },
    include: {
      idea: true,
      problem: true,
      audience: true,
      solution: true,
      features: { orderBy: { order: "asc" } },
      _count: { select: { tasks: true } },
    },
  });
}

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: { _count: { select: { features: true, tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

// §57 — Idea → Project conversion. Preserves title; guides the user into
// Problem/Audience/Solution/Features/MVP next. One idea can only become
// one project (Idea.project is a unique back-relation).
export async function createProjectFromIdea(userId: string, ideaId: string) {
  const idea = await prisma.idea.findFirst({ where: { id: ideaId, userId } });
  if (!idea) return null;

  const existing = await prisma.project.findUnique({ where: { ideaId } });
  if (existing) return existing;

  return prisma.project.create({
    data: {
      userId,
      ideaId,
      name: idea.title,
    },
  });
}

export async function updateProject(userId: string, id: string, data: UpdateProjectInput) {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(userId: string, id: string) {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) return null;

  await prisma.project.delete({ where: { id } });
  return true;
}

async function assertOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  return !!project;
}

// §19-21 — Problem/Audience/Solution are upserted, never created via a
// separate "add section" step; the section simply starts empty.
export async function upsertProblem(userId: string, projectId: string, data: ProblemInput) {
  if (!(await assertOwnership(userId, projectId))) return null;

  return prisma.projectProblem.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
}

export async function upsertAudience(userId: string, projectId: string, data: AudienceInput) {
  if (!(await assertOwnership(userId, projectId))) return null;

  return prisma.projectAudience.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
}

export async function upsertSolution(userId: string, projectId: string, data: SolutionInput) {
  if (!(await assertOwnership(userId, projectId))) return null;

  return prisma.projectSolution.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
}
