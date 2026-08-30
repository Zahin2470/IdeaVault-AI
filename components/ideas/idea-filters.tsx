"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import type { IdeaFilter } from "@/lib/services/idea.service";

const FILTERS: { value: IdeaFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "favorites", label: "Favorites" },
  { value: "archived", label: "Archived" },
];

interface IdeaFiltersProps {
  filter: IdeaFilter;
  onFilterChange: (f: IdeaFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

// Filter tabs + search, per §15.
export function IdeaFilters({ filter, onFilterChange, search, onSearchChange }: IdeaFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-1 rounded-md border border-border p-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={cn(
              "rounded px-3 py-1.5 text-sm transition-colors",
              filter === f.value
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
