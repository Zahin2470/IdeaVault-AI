import { describe, it, expect } from "vitest";
import { createIdeaSchema, updateIdeaSchema } from "./idea";

describe("createIdeaSchema", () => {
  it("accepts just a title — everything else is optional", () => {
    const result = createIdeaSchema.safeParse({ title: "A campus food delivery app" });
    expect(result.success).toBe(true);
    if (result.success) {
      // tags defaults to [] when omitted
      expect(result.data.tags).toEqual([]);
    }
  });

  it("rejects an empty title", () => {
    const result = createIdeaSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a category outside the fixed list", () => {
    const result = createIdeaSchema.safeParse({ title: "Idea", category: "Crypto" });
    expect(result.success).toBe(false);
  });

  it("rejects more than 10 tags", () => {
    const result = createIdeaSchema.safeParse({
      title: "Idea",
      tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateIdeaSchema", () => {
  it("accepts a partial update with just favorite", () => {
    const result = updateIdeaSchema.safeParse({ favorite: true });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    const result = updateIdeaSchema.safeParse({ status: "DONE" });
    expect(result.success).toBe(false);
  });
});
