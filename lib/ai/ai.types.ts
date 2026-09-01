// Shared chat message shape used across the provider layer and services,
// independent of Prisma's AIRole enum or any single provider's wire format.
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
