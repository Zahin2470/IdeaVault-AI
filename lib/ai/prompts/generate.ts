import type { GENERATE_OPERATIONS } from "@/lib/validations/ai-generate";

type Operation = (typeof GENERATE_OPERATIONS)[number];

// Minimal context object built from whatever the project already has —
// the AI works with what's defined so far, not the whole DB row shape.
interface ProjectContext {
  name: string;
  ideaDescription?: string | null;
  problem?: string | null;
  audience?: string | null;
  solution?: string | null;
  featureNames: string[];
}

function contextBlock(ctx: ProjectContext) {
  return [
    `Project: ${ctx.name}`,
    ctx.ideaDescription && `Original idea: ${ctx.ideaDescription}`,
    `Current problem: ${ctx.problem || "not defined yet"}`,
    `Current audience: ${ctx.audience || "not defined yet"}`,
    `Current solution: ${ctx.solution || "not defined yet"}`,
    `Features so far: ${ctx.featureNames.join(", ") || "none yet"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// Every prompt ends with the same hard constraint: valid JSON only, no
// markdown fences, no commentary — this is what makes generate.service.ts
// able to JSON.parse() the raw response directly.
const JSON_ONLY = "Return ONLY valid JSON, no markdown code fences, no commentary before or after.";

export function buildPrompt(operation: Operation, ctx: ProjectContext): string {
  const context = contextBlock(ctx);

  switch (operation) {
    case "improve_problem":
      return `You are a sharp, concise startup advisor. Based on this project, write a clearer problem definition.\n\n${context}\n\n${JSON_ONLY}\nShape: {"problem": string, "alternatives": string, "whyItMatters": string}`;

    case "improve_audience":
      return `You are a sharp, concise startup advisor. Based on this project, define the target audience clearly.\n\n${context}\n\n${JSON_ONLY}\nShape: {"primaryAudience": string, "secondaryAudience": string, "painPoints": string[]} (3-5 painPoints)`;

    case "improve_solution":
      return `You are a sharp, concise startup advisor. Based on this project, sharpen the proposed solution.\n\n${context}\n\n${JSON_ONLY}\nShape: {"description": string, "valueProp": string, "keyBenefits": string[], "differentiators": string[]} (3-5 items each array)`;

    case "generate_mvp":
      return `You are a sharp, concise startup advisor. Based on this project, define a focused MVP plan.\n\n${context}\n\n${JSON_ONLY}\nShape: {"goal": string, "coreUsers": string, "coreProblem": string, "successCriteria": string[]} (3-5 successCriteria, each measurable)`;
  }
}
