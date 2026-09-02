import { prisma } from "@/lib/db/prisma";
import { getUsageToday } from "@/lib/services/ai-conversation.service";

// §14 — single aggregate query set for the dashboard. Kept as one
// function (rather than several small ones the page calls separately)
// so the page does one round trip instead of five.
export async function getDashboardData(userId: string) {
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const [
    activeProjects,
    favoriteIdeas,
    upcomingTasks,
    totalIdeas,
    totalProjects,
    tasksDueThisWeek,
    aiUsageToday,
  ] = await Promise.all([
    prisma.project.findMany({
      where: { userId, status: { not: "COMPLETED" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { features: true, tasks: true } }, tasks: { select: { status: true } } },
    }),
    prisma.idea.findMany({
      where: { userId, favorite: true, status: { not: "ARCHIVED" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: { project: { userId }, dueDate: { not: null }, status: { not: "DONE" } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.idea.count({ where: { userId, status: { not: "ARCHIVED" } } }),
    prisma.project.count({ where: { userId } }),
    prisma.task.count({
      where: {
        project: { userId },
        status: { not: "DONE" },
        dueDate: { gte: new Date(), lte: weekFromNow },
      },
    }),
    getUsageToday(userId),
  ]);

  return {
    activeProjects: activeProjects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      featureCount: p._count.features,
      taskCount: p._count.tasks,
      tasksDone: p.tasks.filter((t) => t.status === "DONE").length,
    })),
    favoriteIdeas,
    upcomingTasks,
    stats: { totalIdeas, totalProjects, tasksDueThisWeek, aiUsageToday },
  };
}
