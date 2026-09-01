import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createTaskSchema, updateTaskSchema } from "@/lib/validations/roadmap";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  return !!project;
}

async function getOwnedTask(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });
  if (!task || task.project.userId !== userId) return null;
  return task;
}

export async function listTasks(userId: string, projectId: string) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTask(userId: string, projectId: string, data: CreateTaskInput) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;

  return prisma.task.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      milestoneId: data.milestoneId || undefined,
      featureId: data.featureId || undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });
}

// §28 — moving a task to DONE stamps completedAt; moving it back out of
// DONE clears it, so "% complete" (§37, later phases) stays accurate
// regardless of how many times a task bounces between columns.
export async function updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
  const task = await getOwnedTask(userId, taskId);
  if (!task) return null;

  const statusChanging = data.status && data.status !== task.status;

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      milestoneId: data.milestoneId === "" ? null : data.milestoneId,
      featureId: data.featureId === "" ? null : data.featureId,
      dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === "" ? null : undefined,
      completedAt: statusChanging
        ? data.status === "DONE"
          ? new Date()
          : null
        : undefined,
    },
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await getOwnedTask(userId, taskId);
  if (!task) return null;

  await prisma.task.delete({ where: { id: taskId } });
  return true;
}
