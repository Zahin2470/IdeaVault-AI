import { z } from "zod";

export const GENERATE_OPERATIONS = [
  "improve_problem",
  "improve_audience",
  "improve_solution",
  "generate_mvp",
] as const;

export const generateRequestSchema = z.object({
  projectId: z.string().min(1),
  operation: z.enum(GENERATE_OPERATIONS),
});

// One response schema per operation — the AI's JSON output is validated
// against these before anything reaches the client (§34). Field names
// intentionally match the corresponding PATCH schema exactly, so Approve
// can send the proposal straight through without remapping.
export const problemProposalSchema = z.object({
  problem: z.string(),
  alternatives: z.string(),
  whyItMatters: z.string(),
});

export const audienceProposalSchema = z.object({
  primaryAudience: z.string(),
  secondaryAudience: z.string(),
  painPoints: z.array(z.string()).min(1),
});

export const solutionProposalSchema = z.object({
  description: z.string(),
  valueProp: z.string(),
  keyBenefits: z.array(z.string()).min(1),
  differentiators: z.array(z.string()).min(1),
});

export const mvpProposalSchema = z.object({
  goal: z.string(),
  coreUsers: z.string(),
  coreProblem: z.string(),
  successCriteria: z.array(z.string()).min(1),
});

export const PROPOSAL_SCHEMAS = {
  improve_problem: problemProposalSchema,
  improve_audience: audienceProposalSchema,
  improve_solution: solutionProposalSchema,
  generate_mvp: mvpProposalSchema,
} as const;
