"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

interface ChatMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

interface ChatPanelProps {
  projectId?: string;
  emptyStateText: string;
}

// §35-36 — the copilot UI itself. Used both globally (/ai) and scoped
// to a project workspace (/projects/:id/ai); projectId is the only thing
// that differs between the two call sites.
export function ChatPanel({ projectId, emptyStateText }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = projectId ? `?projectId=${projectId}` : "";
    fetch(`/api/ai/conversation${params}`)
      .then((r) => r.json())
      .then(({ conversation }) => {
        if (conversation?.messages) setMessages(conversation.messages);
        setLoadingHistory(false);
      });
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "USER", content: text }]);
    setInput("");
    setSending(true);
    setError(null);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, projectId }),
    });

    setSending(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      return;
    }

    const { reply } = await res.json();
    setMessages((prev) => [...prev, { role: "ASSISTANT", content: reply }]);
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col rounded-lg border border-border bg-card">
      <div className="flex-1 overflow-y-auto p-4">
        {loadingHistory ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyStateText}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "USER"
                    ? "ml-auto bg-accent text-accent-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {m.content}
              </div>
            ))}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI copilot..."
          className="min-h-10 flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <Button type="submit" disabled={sending || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
