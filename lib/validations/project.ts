import { z } from "zod";

export const createProjectSchema = z.object({
  ideaId: z.string().min(1, "ideaId is required"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  status: z.enum(["EXPLORING", "PLANNED", "BUILDING", "COMPLETED"]).optional(),
});

// §19 — Problem Definition
export const problemSchema = z.object({
  problem: z.string().max(2000).optional(),
  alternatives: z.string().max(2000).optional(),
  whyItMatters: z.string().max(2000).optional(),
});

// §20 — Target Audience. isAiAssumption is set by AI-generated suggestions
// only (Phase 6) — user-entered audience data is never auto-flagged.
export const audienceSchema = z.object({
  primaryAudience: z.string().max(1000).optional(),
  secondaryAudience: z.string().max(1000).optional(),
  painPoints: z.array(z.string().max(300)).max(20).optional(),
});

// §21 — Solution
export const solutionSchema = z.object({
  description: z.string().max(2000).optional(),
  valueProp: z.string().max(1000).optional(),
  keyBenefits: z.array(z.string().max(300)).max(20).optional(),
  differentiators: z.array(z.string().max(300)).max(20).optional(),
});

// §22 — Feature List
export const FEATURE_PRIORITIES = ["MUST_HAVE", "SHOULD_HAVE", "COULD_HAVE", "LATER"] as const;
export const FEATURE_STATUSES = ["IDEA", "PLANNED", "BUILDING", "COMPLETED"] as const;

export const createFeatureSchema = z.object({
  name: z.string().min(1, "Feature name is required").max(120),
  description: z.string().max(1000).optional(),
  priority: z.enum(FEATURE_PRIORITIES).default("SHOULD_HAVE"),
});

export const updateFeatureSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(FEATURE_PRIORITIES).optional(),
  status: z.enum(FEATURE_STATUSES).optional(),
  order: z.number().int().optional(),
});
