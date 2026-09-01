import type { ChatMessage } from "@/lib/ai/ai.types";

// Free-tier provider (§35): Google's Gemini API has a no-cost tier, so
// it's the default rather than a paid provider. Swapping providers means
// adding another file in this folder with the same chat() signature and
// switching AI_PROVIDER — ai.service.ts never changes.
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function chatWithGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured. Get a free key at https://aistudio.google.com/apikey");
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${errBody || res.statusText}`);
  }

  const data = await res.json();
  const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error("Gemini returned no content — the message may have been blocked by safety filters.");
  }

  return reply;
}
