import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Only getDemoCredentials/isDemoEmail are under test here (pure
// functions), but importing the module also pulls in resetDemoData's
// `@/lib/db/prisma` import, which instantiates a real PrismaClient at
// load time — mocked the same way as access.service.test.ts so that
// import doesn't crash outside a real DB environment.
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import { getDemoCredentials, isDemoEmail } from "./demo.service";

const ORIGINAL_ENV = { ...process.env };

describe("getDemoCredentials", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("falls back to the default seeded credentials when env vars are unset", () => {
    delete process.env.NEXT_PUBLIC_DEMO_EMAIL;
    delete process.env.NEXT_PUBLIC_DEMO_PASSWORD;
    expect(getDemoCredentials()).toEqual({ email: "alex@example.com", password: "password123" });
  });

  it("uses env vars when configured, so a deployer can change the demo login", () => {
    process.env.NEXT_PUBLIC_DEMO_EMAIL = "demo@custom.example";
    process.env.NEXT_PUBLIC_DEMO_PASSWORD = "custom-pass";
    expect(getDemoCredentials()).toEqual({ email: "demo@custom.example", password: "custom-pass" });
  });
});

describe("isDemoEmail", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEMO_EMAIL = "alex@example.com";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  // This is the guard that exempts the shared demo account from the
  // login rate limit and blocks password-reset hijacking — it has to be
  // case-insensitive, since email addresses are compared that way
  // everywhere else in the app (registration, login).
  it("matches regardless of case", () => {
    expect(isDemoEmail("ALEX@EXAMPLE.COM")).toBe(true);
    expect(isDemoEmail("Alex@Example.com")).toBe(true);
  });

  it("is false for any other email, including close look-alikes", () => {
    expect(isDemoEmail("alex@example.co")).toBe(false);
    expect(isDemoEmail("notalex@example.com")).toBe(false);
    expect(isDemoEmail("attacker@example.com")).toBe(false);
  });
});
