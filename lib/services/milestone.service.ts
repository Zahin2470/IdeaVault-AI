import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createMilestoneSchema, updateMilestoneSchema } from "@/lib/validations/roadmap";
import { createNotificationOnce } from "@/lib/services/notification.service";

type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  return !!project;
}

async function getOwnedMilestone(userId: string, milestoneId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });
  if (!milestone || milestone.project.userId !== userId) return null;
  return milestone;
}

export async function listMilestones(userId: string, projectId: string) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;
  return prisma.milestone.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: { tasks: { select: { id: true, status: true } } },
  });
}

export async function createMilestone(userId: string, projectId: string, data: CreateMilestoneInput) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;

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

  // §29-style delivery: only fires on the transition into COMPLETE, and
  // only if the user hasn't turned project notifications off.
  if (data.status === "COMPLETE" && milestone.status !== "COMPLETE") {
    const prefs = await prisma.userPreference.findUnique({ where: { userId } });
    if (prefs?.notifyProject !== false) {
      await createNotificationOnce(
        userId,
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

  // Tasks linked to this milestone are unassigned, not deleted (§27) —
  // the schema's onDelete for Task.milestoneId is a nullable FK, not cascade.
  await prisma.milestone.delete({ where: { id: milestoneId } });
  return true;
}
