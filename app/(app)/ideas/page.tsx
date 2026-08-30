"use client";

import { useEffect, useState, useCallback } from "react";
import type { Idea } from "@prisma/client";
import { CreateIdeaDialog } from "@/components/ideas/create-idea-dialog";
import { IdeaFilters } from "@/components/ideas/idea-filters";
import { IdeaCard } from "@/components/ideas/idea-card";
import type { IdeaFilter } from "@/lib/services/idea.service";

// Idea Vault (§15). Client-rendered: filter/search state drives refetches
// against /api/ideas, which is simpler than server-side searchParams
// plumbing for a page this interactive and keeps favorite/archive/delete
// optimistic-feeling without a full page reload.
export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filter, setFilter] = useState<IdeaFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchIdeas = useCallback(async (f: IdeaFilter, s: string) => {
    setLoading(true);
    const params = new URLSearchParams({ filter: f });
    if (s.trim()) params.set("search", s.trim());
    const res = await fetch(`/api/ideas?${params.toString()}`);
    if (res.ok) {
      const { ideas } = await res.json();
      setIdeas(ideas);
    }
    setLoading(false);
  }, []);

  // Debounce search input (§64) so every keystroke doesn't hit the API.
  useEffect(() => {
    const timeout = setTimeout(() => fetchIdeas(filter, search), 300);
    return () => clearTimeout(timeout);
  }, [filter, search, fetchIdeas]);

  async function patchIdea(id: string, data: Partial<Idea>) {
    const res = await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { idea } = await res.json();
      setIdeas((prev) =>
        // An archived/unfavorited idea may no longer match the active
        // filter, so just drop it from the current view rather than
        // patch it in place.
        prev
          .map((i) => (i.id === id ? idea : i))
          .filter((i) => {
            if (filter === "active") return i.status !== "ARCHIVED";
            if (filter === "archived") return i.status === "ARCHIVED";
            if (filter === "favorites") return i.favorite;
            return true;
          })
      );
    }
  }

  async function handleDelete(idea: Idea) {
    if (!confirm(`Permanently delete "${idea.title}"? This can't be undone.`)) return;
    const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
    if (res.ok) setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Idea Vault</h1>
          <p className="text-sm text-muted-foreground">Your central idea library.</p>
        </div>
        <CreateIdeaDialog onCreated={(idea) => setIdeas((prev) => [idea, ...prev])} />
      </div>

      <IdeaFilters
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">Your next big idea starts here.</p>
          <CreateIdeaDialog onCreated={(idea) => setIdeas((prev) => [idea, ...prev])} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onToggleFavorite={(i) => patchIdea(i.id, { favorite: !i.favorite })}
              onToggleArchive={(i) =>
                patchIdea(i.id, { status: i.status === "ARCHIVED" ? "EXPLORING" : "ARCHIVED" } as Partial<Idea>)
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
