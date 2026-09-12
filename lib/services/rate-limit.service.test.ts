import { describe, it, expect, vi, beforeEach } from "vitest";

// In-memory fake standing in for the RateLimitAttempt table — enough to
// exercise the counting/window logic without a real database.
let rows: { key: string; createdAt: Date }[] = [];

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    rateLimitAttempt: {
      deleteMany: vi.fn(({ where }: { where: { key: string; createdAt: { lt: Date } } }) => {
        rows = rows.filter((r) => !(r.key === where.key && r.createdAt < where.createdAt.lt));
        return Promise.resolve({ count: 0 });
      }),
      count: vi.fn(({ where }: { where: { key: string; createdAt: { gte: Date } } }) => {
        return Promise.resolve(
          rows.filter((r) => r.key === where.key && r.createdAt >= where.createdAt.gte).length
        );
      }),
      create: vi.fn(({ data }: { data: { key: string } }) => {
        rows.push({ key: data.key, createdAt: new Date() });
        return Promise.resolve(data);
      }),
    },
  },
}));

import { checkRateLimit, getClientIp } from "./rate-limit.service";

describe("checkRateLimit", () => {
  beforeEach(() => {
    rows = [];
  });

  it("allows requests under the limit", async () => {
    expect(await checkRateLimit("test:key", 3, 60_000)).toBe(true);
    expect(await checkRateLimit("test:key", 3, 60_000)).toBe(true);
    expect(await checkRateLimit("test:key", 3, 60_000)).toBe(true);
  });

  it("blocks once the limit is reached within the window", async () => {
    await checkRateLimit("test:key", 2, 60_000);
    await checkRateLimit("test:key", 2, 60_000);
    expect(await checkRateLimit("test:key", 2, 60_000)).toBe(false);
  });

  it("tracks each key independently", async () => {
    await checkRateLimit("test:a", 1, 60_000);
    // key "a" is now at its limit, but "b" hasn't been touched
    expect(await checkRateLimit("test:a", 1, 60_000)).toBe(false);
    expect(await checkRateLimit("test:b", 1, 60_000)).toBe(true);
  });
});

describe("getClientIp", () => {
  it("reads the first address from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const req = new Request("http://localhost", { headers: { "x-real-ip": "9.9.9.9" } });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' when neither header is present", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});
