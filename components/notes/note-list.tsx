"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@prisma/client";

interface NoteListProps {
  projectId: string;
  initialNotes: Note[];
}

// §29 — freeform notes, pinnable, newest/pinned first.
export function NoteList({ projectId, initialNotes }: NoteListProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setAdding(false);
    if (res.ok) {
      const { note } = await res.json();
      setNotes((prev) => [note, ...prev]);
      setContent("");
    }
  }

  async function togglePin(note: Note) {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !note.pinned }),
    });
    if (res.ok) {
      const { note: updated } = await res.json();
      setNotes((prev) =>
        [...prev.map((n) => (n.id === note.id ? updated : n))].sort(
          (a, b) => Number(b.pinned) - Number(a.pinned)
        )
      );
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <Textarea
          placeholder="Jot something down..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" disabled={adding || !content.trim()} className="w-fit">
          {adding ? "Saving..." : "Add Note"}
        </Button>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "flex flex-col gap-2 rounded-lg border bg-card p-3",
                note.pinned ? "border-accent/50" : "border-border"
              )}
            >
              <p className="whitespace-pre-wrap text-sm">{note.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePin(note)} className="hover:text-foreground">
                    {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="hover:text-danger">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
