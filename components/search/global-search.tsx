"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Lightbulb, FolderKanban, CheckSquare, StickyNote } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SearchResults {
  ideas: { id: string; title: string }[];
  projects: { id: string; name: string }[];
  tasks: { id: string; title: string; project: { id: string; name: string } }[];
  notes: { id: string; title: string | null; content: string; project: { id: string; name: string } }[];
}

const EMPTY: SearchResults = { ideas: [], projects: [], tasks: [], notes: [] };

// §39 — command-palette style global search. Cmd/Ctrl+K opens it from
// anywhere in the authenticated shell; each result group routes to
// wherever that item actually lives (idea → Idea Vault, task/note →
// their project's Tasks/Notes tab).
export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const hasResults =
    results.ideas.length || results.projects.length || results.tasks.length || results.notes.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:border-accent/40"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-24 translate-y-0 p-0">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search ideas, projects, tasks, notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 px-0 focus-visible:ring-0"
            />
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {loading && <p className="p-3 text-sm text-muted-foreground">Searching...</p>}

            {!loading && query.trim() && !hasResults && (
              <p className="p-3 text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;.</p>
            )}

            {results.ideas.length > 0 && (
              <ResultGroup icon={<Lightbulb className="h-3.5 w-3.5" />} label="Ideas">
                {results.ideas.map((idea) => (
                  <ResultItem key={idea.id} label={idea.title} onClick={() => go("/ideas")} />
                ))}
              </ResultGroup>
            )}

            {results.projects.length > 0 && (
              <ResultGroup icon={<FolderKanban className="h-3.5 w-3.5" />} label="Projects">
                {results.projects.map((p) => (
                  <ResultItem key={p.id} label={p.name} onClick={() => go(`/projects/${p.id}`)} />
                ))}
              </ResultGroup>
            )}

            {results.tasks.length > 0 && (
              <ResultGroup icon={<CheckSquare className="h-3.5 w-3.5" />} label="Tasks">
                {results.tasks.map((t) => (
                  <ResultItem
                    key={t.id}
                    label={t.title}
                    sublabel={t.project.name}
                    onClick={() => go(`/projects/${t.project.id}/tasks`)}
                  />
                ))}
              </ResultGroup>
            )}

            {results.notes.length > 0 && (
              <ResultGroup icon={<StickyNote className="h-3.5 w-3.5" />} label="Notes">
                {results.notes.map((n) => (
                  <ResultItem
                    key={n.id}
                    label={n.title || n.content.slice(0, 60)}
                    sublabel={n.project.name}
                    onClick={() => go(`/projects/${n.project.id}/notes`)}
                  />
                ))}
              </ResultGroup>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResultGroup({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

function ResultItem({ label, sublabel, onClick }: { label: string; sublabel?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col items-start rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
    >
      <span className="line-clamp-1">{label}</span>
      {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
    </button>
  );
}
