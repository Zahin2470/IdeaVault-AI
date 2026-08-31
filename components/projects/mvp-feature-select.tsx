"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Feature } from "@prisma/client";

const PRIORITY_LABEL: Record<string, string> = {
  MUST_HAVE: "Must Have",
  SHOULD_HAVE: "Should Have",
  COULD_HAVE: "Could Have",
  LATER: "Later",
};

interface MVPFeatureSelectProps {
  projectId: string;
  features: Feature[];
  initialSelectedIds: string[];
}

// §24 — checklist of every feature; checked = in scope for v1. Saves the
// full selection on each toggle rather than requiring a separate Save,
// since this list is usually short and toggling is the whole interaction.
export function MVPFeatureSelect({ projectId, features, initialSelectedIds }: MVPFeatureSelectProps) {
  const [selected, setSelected] = useState(new Set(initialSelectedIds));
  const [saving, setSaving] = useState(false);

  async function toggle(featureId: string) {
    const next = new Set(selected);
    if (next.has(featureId)) next.delete(featureId);
    else next.add(featureId);
    setSelected(next);

    setSaving(true);
    await fetch(`/api/projects/${projectId}/mvp/features`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureIds: Array.from(next) }),
    });
    setSaving(false);
  }

  if (features.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No features yet — add some on the Features tab first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Features in scope for v1</h3>
        {saving && <span className="text-xs text-muted-foreground">Saving...</span>}
      </div>
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {features.map((f) => (
          <label
            key={f.id}
            className="flex cursor-pointer items-center gap-3 p-3 text-sm"
          >
            <input
              type="checkbox"
              checked={selected.has(f.id)}
              onChange={() => toggle(f.id)}
              className="h-4 w-4 accent-accent"
            />
            <span className="flex-1">{f.name}</span>
            <Badge variant={f.priority === "MUST_HAVE" ? "accent" : "default"}>
              {PRIORITY_LABEL[f.priority]}
            </Badge>
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {selected.size} of {features.length} features selected for v1.
      </p>
    </div>
  );
}
