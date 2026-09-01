import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { chatSchema } from "@/lib/validations/ai";
import { chat } from "@/lib/ai/ai.service";
import {
  checkAndLogUsage,
  getOrCreateConversation,
  addMessage,
  toChatHistory,
} from "@/lib/services/ai-conversation.service";
import { prisma } from "@/lib/db/prisma";

// §35-36, §50 — the one endpoint both the global and per-project copilot
// call. projectId is optional; when present, ownership is checked before
// anything else touches the DB or the provider.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { message, projectId } = parsed.data;

  if (projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const allowed = await checkAndLogUsage(user.id, "chat");
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached today's AI usage limit. Try again tomorrow." },
      { status: 429 }
    );
  }

  const conversation = await getOrCreateConversation(user.id, projectId ?? null);
  await addMessage(conversation.id, "USER", message);

  const history = toChatHistory([
    ...conversation.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: "USER", content: message },
  ]);

  let reply: string;
  try {
    reply = await chat(history);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "The AI copilot is unavailable right now." },
      { status: 502 }
    );
  }

  await addMessage(conversation.id, "ASSISTANT", reply);

  return NextResponse.json({ conversationId: conversation.id, reply });
}
