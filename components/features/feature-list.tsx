"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Feature } from "@prisma/client";
import { FEATURE_PRIORITIES, FEATURE_STATUSES } from "@/lib/validations/project";

const PRIORITY_LABEL: Record<string, string> = {
  MUST_HAVE: "Must Have",
  SHOULD_HAVE: "Should Have",
  COULD_HAVE: "Could Have",
  LATER: "Later",
};

const STATUS_LABEL: Record<string, string> = {
  IDEA: "Idea",
  PLANNED: "Planned",
  BUILDING: "Building",
  COMPLETED: "Completed",
};

interface FeatureListProps {
  projectId: string;
  initialFeatures: Feature[];
}

// §22 — feature management. Ordering uses swap-based up/down buttons
// rather than a drag-and-drop library, to keep Phase 3 dependency-light;
// true drag-and-drop can replace this later without changing the API
// (order is already a plain integer column).
export function FeatureList({ projectId, initialFeatures }: FeatureListProps) {
  const [features, setFeatures] = useState(initialFeatures);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/projects/${projectId}/features`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setAdding(false);
    if (res.ok) {
      const { feature } = await res.json();
      setFeatures((prev) => [...prev, feature]);
      setName("");
    }
  }

  async function patchFeature(id: string, data: Partial<Feature>) {
    const res = await fetch(`/api/features/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { feature } = await res.json();
      setFeatures((prev) => prev.map((f) => (f.id === id ? feature : f)));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/features/${id}`, { method: "DELETE" });
    if (res.ok) setFeatures((prev) => prev.filter((f) => f.id !== id));
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= features.length) return;

    const a = features[index];
    const b = features[target];

    const next = [...features];
    next[index] = { ...b, order: a.order };
    next[target] = { ...a, order: b.order };
    next.sort((x, y) => x.order - y.order);
    setFeatures(next);

    await Promise.all([
      patchFeature(a.id, { order: b.order }),
      patchFeature(b.id, { order: a.order }),
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Add a feature..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" disabled={adding || !name.trim()}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </form>

      {features.length === 0 ? (
        <p className="text-sm text-muted-foreground">No features yet — add the first one above.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {features.map((f, i) => (
            <div key={f.id} className="flex items-center gap-3 p-3">
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === features.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">{f.name}</p>
                {f.description && (
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                )}
              </div>

              <select
                value={f.priority}
                onChange={(e) => patchFeature(f.id, { priority: e.target.value as Feature["priority"] })}
                className="h-8 rounded-md border border-border bg-transparent px-2 text-xs"
              >
                {FEATURE_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>

              <select
                value={f.status}
                onChange={(e) => patchFeature(f.id, { status: e.target.value as Feature["status"] })}
                className="h-8 rounded-md border border-border bg-transparent px-2 text-xs"
              >
                {FEATURE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>

              <Badge variant={f.priority === "MUST_HAVE" ? "accent" : "default"}>
                {PRIORITY_LABEL[f.priority]}
              </Badge>

              <button
                onClick={() => handleDelete(f.id)}
                className="text-muted-foreground hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
