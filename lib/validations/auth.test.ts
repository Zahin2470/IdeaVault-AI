import { describe, it, expect } from "vitest";
import { registerSchema } from "./auth";

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Alex Morgan",
      email: "alex@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password under 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Alex Morgan",
      email: "alex@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Alex Morgan",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "alex@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});
