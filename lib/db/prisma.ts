import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton so hot reload doesn't exhaust
// Postgres connections with a fresh PrismaClient on every reload.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
