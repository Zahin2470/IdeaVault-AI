"use client";

import { Star, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Idea } from "@prisma/client";

const STATUS_LABEL: Record<string, string> = {
  INBOX: "Inbox",
  EXPLORING: "Exploring",
  PLANNED: "Planned",
  BUILDING: "Building",
  ARCHIVED: "Archived",
};

interface IdeaCardProps {
  idea: Idea;
  onToggleFavorite: (idea: Idea) => void;
  onToggleArchive: (idea: Idea) => void;
  onDelete: (idea: Idea) => void;
}

// Card layout per §15: title, short description, category, status, tags,
// last updated, favorite. Archive/restore/delete map to §41.
export function IdeaCard({ idea, onToggleFavorite, onToggleArchive, onDelete }: IdeaCardProps) {
  const isArchived = idea.status === "ARCHIVED";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent/40">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-snug">{idea.title}</h3>
        <button
          onClick={() => onToggleFavorite(idea)}
          aria-label={idea.favorite ? "Unfavorite" : "Favorite"}
          className="shrink-0 text-muted-foreground hover:text-warning"
        >
          <Star
            className={cn("h-4 w-4", idea.favorite && "fill-warning text-warning")}
          />
        </button>
      </div>

      {idea.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{idea.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {idea.category && <Badge variant="outline">{idea.category}</Badge>}
        <Badge variant={isArchived ? "default" : "accent"}>
          {STATUS_LABEL[idea.status] ?? idea.status}
        </Badge>
        {idea.tags.map((tag) => (
          <Badge key={tag} variant="default">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Updated {new Date(idea.updatedAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-2">
          {isArchived ? (
            <button
              onClick={() => onToggleArchive(idea)}
              className="flex items-center gap-1 hover:text-foreground"
            >
              <ArchiveRestore className="h-3.5 w-3.5" /> Restore
            </button>
          ) : (
            <button
              onClick={() => onToggleArchive(idea)}
              className="flex items-center gap-1 hover:text-foreground"
            >
              <Archive className="h-3.5 w-3.5" /> Archive
            </button>
          )}
          {isArchived && (
            <button
              onClick={() => onDelete(idea)}
              className="flex items-center gap-1 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
