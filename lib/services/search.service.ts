import { prisma } from "@/lib/db/prisma";

// §39 — one query fan-out across the four searchable entity types, each
// scoped to the current user (ideas/projects directly, tasks/notes via
// their parent project). Capped at 5 per type — this is a quick-jump
// palette, not a full search-results page.
const RESULT_LIMIT = 5;

export async function searchAll(userId: string, query: string) {
  const q = query.trim();
  if (!q) return { ideas: [], projects: [], tasks: [], notes: [] };

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
      where: { userId, name: { contains: q, mode: "insensitive" } },
      take: RESULT_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: {
        project: { userId },
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
        project: { userId },
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
