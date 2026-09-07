import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createMilestoneSchema, updateMilestoneSchema } from "@/lib/validations/roadmap";
import { createNotificationOnce } from "@/lib/services/notification.service";
import { canViewProject, canEditProject } from "@/lib/services/access.service";

type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

async function getOwnedMilestone(userId: string, milestoneId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });
  if (!milestone || !(await canEditProject(userId, milestone.projectId))) return null;
  return milestone;
}

export async function listMilestones(userId: string, projectId: string) {
  if (!(await canViewProject(userId, projectId))) return null;
  return prisma.milestone.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: { tasks: { select: { id: true, status: true } } },
  });
}

export async function createMilestone(userId: string, projectId: string, data: CreateMilestoneInput) {
  if (!(await canEditProject(userId, projectId))) return null;

  const count = await prisma.milestone.count({ where: { projectId } });
  return prisma.milestone.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      order: count,
    },
  });
}

export async function updateMilestone(userId: string, milestoneId: string, data: UpdateMilestoneInput) {
  const milestone = await getOwnedMilestone(userId, milestoneId);
  if (!milestone) return null;

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      ...data,
      targetDate: data.targetDate ? new Date(data.targetDate) : data.targetDate === "" ? null : undefined,
    },
  });

  // Notify the project owner specifically (not whichever collaborator
  // completed it) — they're the one who set notification preferences
  // for this project's activity.
  if (data.status === "COMPLETE" && milestone.status !== "COMPLETE") {
    const prefs = await prisma.userPreference.findUnique({ where: { userId: milestone.project.userId } });
    if (prefs?.notifyProject !== false) {
      await createNotificationOnce(
        milestone.project.userId,
        "milestone_complete",
        `Milestone "${updated.title}" completed in ${milestone.project.name}.`,
        milestone.id
      );
    }
  }

  return updated;
}

export async function deleteMilestone(userId: string, milestoneId: string) {
  const milestone = await getOwnedMilestone(userId, milestoneId);
  if (!milestone) return null;

  await prisma.milestone.delete({ where: { id: milestoneId } });
  return true;
}
