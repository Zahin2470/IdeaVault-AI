"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { MILESTONE_STATUSES } from "@/lib/validations/roadmap";

interface MilestoneWithTasks {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: string;
  tasks: { id: string; status: string }[];
}

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETE: "Complete",
};

interface MilestoneListProps {
  projectId: string;
  initialMilestones: MilestoneWithTasks[];
}

// §26 — Roadmap: an ordered list of milestones, each showing basic task
// progress once tasks reference it (Phase 5 also adds tasks, so this can
// show real numbers immediately).
export function MilestoneList({ projectId, initialMilestones }: MilestoneListProps) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      }),
    });
    setAdding(false);
    if (res.ok) {
      const { milestone } = await res.json();
      setMilestones((prev) => [...prev, { ...milestone, tasks: [] }]);
      setTitle("");
      setTargetDate("");
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this milestone? Linked tasks will become unassigned.")) return;
    const res = await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    if (res.ok) setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <Input
          placeholder="Milestone title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <Input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-40"
        />
        <Button type="submit" disabled={adding || !title.trim()}>
          <Plus className="mr-1 h-4 w-4" /> Add Milestone
        </Button>
      </form>

      {milestones.length === 0 ? (
        <p className="text-sm text-muted-foreground">No milestones yet — add the first one above.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {milestones.map((m) => {
            const done = m.tasks.filter((t) => t.status === "DONE").length;
            return (
              <div key={m.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{m.title}</h3>
                    {m.targetDate && (
                      <p className="text-xs text-muted-foreground">
                        Target: {new Date(m.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={m.status}
                      onChange={(e) => updateStatus(m.id, e.target.value)}
                      className="h-8 rounded-md border border-border bg-transparent px-2 text-xs"
                    >
                      {MILESTONE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-muted-foreground hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {m.tasks.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="default">
                      {done}/{m.tasks.length} tasks done
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
