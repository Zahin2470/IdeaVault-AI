import type { ChatMessage } from "@/lib/ai/ai.types";
import { chatWithGemini } from "@/lib/ai/providers/gemini.provider";

// Provider-agnostic entry point (§35). Only Gemini is wired up for now
// per the free-tier requirement; OPENAI/XAI adapters can be added here
// later behind the same chat() signature without touching call sites.
export async function chat(messages: ChatMessage[]): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? "gemini";

  switch (provider) {
    case "gemini":
      return chatWithGemini(messages);
    default:
      throw new Error(`Unsupported AI_PROVIDER "${provider}". Only "gemini" is wired up so far.`);
  }
}
