import { prisma } from "@/lib/db/prisma";
import { chat } from "@/lib/ai/ai.service";
import { buildPrompt } from "@/lib/ai/prompts/generate";
import { checkAndLogUsage } from "@/lib/services/ai-conversation.service";
import { PROPOSAL_SCHEMAS } from "@/lib/validations/ai-generate";
import type { GENERATE_OPERATIONS } from "@/lib/validations/ai-generate";

type Operation = (typeof GENERATE_OPERATIONS)[number];

export type GenerateResult =
  | { ok: true; proposal: unknown }
  | { ok: false; status: number; error: string };

// §25, §34, §74 — AI never writes directly. This always returns a
// proposal for the caller to show the user; only an explicit Approve
// (handled by the existing PATCH routes) persists anything.
export async function generateProposal(
  userId: string,
  projectId: string,
  operation: Operation
): Promise<GenerateResult> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { idea: true, problem: true, audience: true, solution: true, features: true },
  });
  if (!project) return { ok: false, status: 404, error: "Project not found" };

  const allowed = await checkAndLogUsage(userId, operation);
  if (!allowed) {
    return { ok: false, status: 429, error: "You've reached today's AI usage limit. Try again tomorrow." };
  }

  const prompt = buildPrompt(operation, {
    name: project.name,
    ideaDescription: project.idea?.description,
    problem: project.problem?.problem,
    audience: project.audience?.primaryAudience,
    solution: project.solution?.description,
    featureNames: project.features.map((f) => f.name),
  });

  let raw: string;
  try {
    raw = await chat([{ role: "user", content: prompt }]);
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : "The AI copilot is unavailable right now.",
    };
  }

  // Models occasionally wrap JSON in ```json fences despite instructions —
  // strip them before parsing rather than treating that as a hard failure.
  const cleaned = raw.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch {
    return { ok: false, status: 502, error: "The AI's response wasn't valid — please try again." };
  }

  const schema = PROPOSAL_SCHEMAS[operation];
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, status: 502, error: "The AI's response didn't match the expected format — please try again." };
  }

  return { ok: true, proposal: parsed.data };
}
