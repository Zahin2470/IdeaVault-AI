import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ChatPanel } from "@/components/ai/chat-panel";

export default async function GlobalAIPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">AI Copilot</h1>
      <ChatPanel emptyStateText="Ask about idea validation, prioritization, or anything else on your mind." />
    </div>
  );
}
