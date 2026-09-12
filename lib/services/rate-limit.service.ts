import { prisma } from "@/lib/db/prisma";

// Fixed-window counter keyed by an arbitrary string (e.g. "login:email:x"
// or "register:ip:x"). Returns false once the limit is hit within the
// window — callers decide what "blocked" looks like to the client (a
// generic auth failure, a silent no-op, etc.), this only answers yes/no.
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);

  // Opportunistic cleanup — only for this key, only on this check, so
  // the table never accumulates rows for keys nobody hits anymore.
  await prisma.rateLimitAttempt.deleteMany({ where: { key, createdAt: { lt: windowStart } } });

  const count = await prisma.rateLimitAttempt.count({ where: { key, createdAt: { gte: windowStart } } });
  if (count >= limit) return false;

  await prisma.rateLimitAttempt.create({ data: { key } });
  return true;
}

// Best-effort client IP from standard proxy headers — correct behind
// Vercel/most reverse proxies, but spoofable if the app is ever exposed
// directly without a trusted proxy in front of it.
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
