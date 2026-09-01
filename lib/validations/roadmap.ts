import { z } from "zod";

// §26 — Milestones
export const MILESTONE_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETE"] as const;

export const createMilestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(1000).optional(),
  targetDate: z.string().datetime().optional().or(z.literal("")),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
  targetDate: z.string().datetime().optional().or(z.literal("")),
  status: z.enum(MILESTONE_STATUSES).optional(),
  order: z.number().int().optional(),
});

// §27-28 — Tasks
export const TASK_STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().max(1000).optional(),
  priority: z.enum(TASK_PRIORITIES).default("MEDIUM"),
  milestoneId: z.string().optional().nullable(),
  featureId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().or(z.literal("")),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  milestoneId: z.string().optional().nullable(),
  featureId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().or(z.literal("")),
});
