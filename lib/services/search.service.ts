import { prisma } from "@/lib/db/prisma";

// §39 — one query fan-out across the four searchable entity types.
// Ideas stay owner-only (never shared); projects/tasks/notes are scoped
// to owned OR member-accessible projects, so a collaborator can find
// what they've been given access to.
const RESULT_LIMIT = 5;

export async function searchAll(userId: string, query: string) {
  const q = query.trim();
  if (!q) return { ideas: [], projects: [], tasks: [], notes: [] };

  const accessibleProject = { OR: [{ userId }, { members: { some: { userId } } }] };

  const [ideas, projects, tasks, notes] = await Promise.all([
    prisma.idea.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: RESULT_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: { ...accessibleProject, name: { contains: q, mode: "insensitive" } },
      take: RESULT_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: {
        project: accessibleProject,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: RESULT_LIMIT,
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.note.findMany({
      where: {
        project: accessibleProject,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      take: RESULT_LIMIT,
      orderBy: { updatedAt: "desc" },
      include: { project: { select: { id: true, name: true } } },
    }),
  ]);

  return { ideas, projects, tasks, notes };
}
