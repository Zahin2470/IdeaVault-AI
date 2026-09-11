import { describe, it, expect } from "vitest";
import { inviteSchema } from "./member";

describe("inviteSchema", () => {
  it("defaults role to VIEWER when omitted", () => {
    const result = inviteSchema.safeParse({ email: "friend@example.com" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe("VIEWER");
  });

  it("accepts EDITOR explicitly", () => {
    const result = inviteSchema.safeParse({ email: "friend@example.com", role: "EDITOR" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = inviteSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a role outside EDITOR/VIEWER (OWNER is never assignable via invite)", () => {
    const result = inviteSchema.safeParse({ email: "friend@example.com", role: "OWNER" });
    expect(result.success).toBe(false);
  });
});
