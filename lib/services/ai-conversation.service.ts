import { prisma } from "@/lib/db/prisma";
import type { ChatMessage } from "@/lib/ai/ai.types";

// §50 — per-user daily cap on AI calls, enforced before the provider is
// ever called (cost/abuse control). Not configurable per-user yet; a
// single constant is enough until usage patterns say otherwise.
const DAILY_AI_LIMIT = 50;

export async function checkAndLogUsage(userId: string, operation: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.aIUsageLog.count({
    where: { userId, date: { gte: startOfDay } },
  });

  if (count >= DAILY_AI_LIMIT) return false;

  await prisma.aIUsageLog.create({ data: { userId, operation } });
  return true;
}

// One conversation per (user, project) pair, and one per (user, null)
// for the global copilot — simplest model that still gives each project
// its own AI context, per §36.
export async function getConversation(userId: string, projectId: string | null) {
  return prisma.aIConversation.findFirst({
    where: { userId, projectId },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getOrCreateConversation(userId: string, projectId: string | null) {
  const existing = await getConversation(userId, projectId);
  if (existing) return existing;

  return prisma.aIConversation.create({
    data: { userId, projectId: projectId ?? undefined },
    include: { messages: true },
  });
}

export async function addMessage(conversationId: string, role: "USER" | "ASSISTANT", content: string) {
  return prisma.aIMessage.create({ data: { conversationId, role, content } });
}

// Keeps the request to the provider bounded regardless of how long a
// conversation has grown — last 20 turns is enough context for a
// planning copilot without ballooning token usage.
export function toChatHistory(messages: { role: string; content: string }[]): ChatMessage[] {
  return messages.slice(-20).map((m) => ({
    role: m.role === "ASSISTANT" ? "assistant" : "user",
    content: m.content,
  }));
}
