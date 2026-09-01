import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getConversation } from "@/lib/services/ai-conversation.service";
import { prisma } from "@/lib/db/prisma";

// Loads existing history so the copilot doesn't reset on every page
// visit. Returns { conversation: null } rather than 404 — no history yet
// is a normal, expected state, not an error.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const conversation = await getConversation(user.id, projectId);
  return NextResponse.json({ conversation });
}
