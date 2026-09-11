import { describe, it, expect } from "vitest";
import { buildPrompt } from "./generate";

const baseContext = {
  name: "Campus Eats",
  ideaDescription: "A food delivery app for university campuses",
  problem: null,
  audience: null,
  solution: null,
  featureNames: [] as string[],
};

describe("buildPrompt", () => {
  it("always instructs the model to return JSON only, no markdown fences", () => {
    for (const op of ["improve_problem", "improve_audience", "improve_solution", "generate_mvp"] as const) {
      const prompt = buildPrompt(op, baseContext);
      expect(prompt).toContain("ONLY valid JSON");
      expect(prompt).toContain("no markdown code fences");
    }
  });

  it("includes the project name and idea description in the context", () => {
    const prompt = buildPrompt("improve_problem", baseContext);
    expect(prompt).toContain("Campus Eats");
    expect(prompt).toContain("A food delivery app for university campuses");
  });

  it("falls back to 'not defined yet' for missing fields rather than empty strings", () => {
    const prompt = buildPrompt("improve_audience", baseContext);
    expect(prompt).toContain("not defined yet");
  });

  it("lists feature names when present, or says none yet", () => {
    const withFeatures = buildPrompt("improve_solution", { ...baseContext, featureNames: ["Live map", "Group orders"] });
    expect(withFeatures).toContain("Live map, Group orders");

    const withoutFeatures = buildPrompt("improve_solution", baseContext);
    expect(withoutFeatures).toContain("none yet");
  });

  it("each operation's expected JSON shape appears in its own prompt", () => {
    expect(buildPrompt("improve_problem", baseContext)).toContain('"whyItMatters"');
    expect(buildPrompt("improve_audience", baseContext)).toContain('"painPoints"');
    expect(buildPrompt("improve_solution", baseContext)).toContain('"differentiators"');
    expect(buildPrompt("generate_mvp", baseContext)).toContain('"successCriteria"');
  });
});
