import type { z } from "zod";
import type {
  updateProjectSchema,
  problemSchema,
  audienceSchema,
  solutionSchema,
} from "@/lib/validations/project";

// Small type-only file so project.service.ts and feature.service.ts don't
// have to import Zod schemas just for their inferred types.
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProblemInput = z.infer<typeof problemSchema>;
export type AudienceInput = z.infer<typeof audienceSchema>;
export type SolutionInput = z.infer<typeof solutionSchema>;
