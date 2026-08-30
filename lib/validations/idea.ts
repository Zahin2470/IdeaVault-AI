import { z } from "zod";

// Categories from §16 — kept as a const so the create form and API
// validation share one source of truth.
export const IDEA_CATEGORIES = [
  "SaaS",
  "Mobile",
  "Web",
  "Marketplace",
  "AI",
  "Education",
  "Finance",
  "Health",
  "Productivity",
  "Social",
  "Other",
] as const;

export const IDEA_STATUSES = [
  "INBOX",
  "EXPLORING",
  "PLANNED",
  "BUILDING",
  "ARCHIVED",
] as const;

export const createIdeaSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(2000).optional(),
  category: z.enum(IDEA_CATEGORIES).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;

// Everything is optional on update — this backs both "edit details" and
// single-field actions like toggling favorite or changing status.
export const updateIdeaSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  category: z.enum(IDEA_CATEGORIES).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  status: z.enum(IDEA_STATUSES).optional(),
  favorite: z.boolean().optional(),
});

export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
