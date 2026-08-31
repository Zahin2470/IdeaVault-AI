import { z } from "zod";

// §23-24 — MVP goal, core users/problem, and measurable success criteria.
export const mvpPlanSchema = z.object({
  goal: z.string().max(1000).optional(),
  coreUsers: z.string().max(500).optional(),
  coreProblem: z.string().max(1000).optional(),
  successCriteria: z.array(z.string().max(300)).max(10).optional(),
});

export type MVPPlanInput = z.infer<typeof mvpPlanSchema>;

// Set of Feature ids that are in-scope for v1 — replaces the full
// selection each time, simpler than incremental add/remove endpoints.
export const mvpFeaturesSchema = z.object({
  featureIds: z.array(z.string()).max(200),
});

export type MVPFeaturesInput = z.infer<typeof mvpFeaturesSchema>;
