"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TASK_PRIORITIES } from "@/lib/validations/roadmap";
import type { Task, Feature } from "@prisma/client";
import { Plus } from "lucide-react";

interface CreateTaskDialogProps {
  projectId: string;
  features: Feature[];
  milestones: { id: string; title: string }[];
  onCreated: (task: Task) => void;
}

// §27 — task creation, optionally linked to a feature and/or milestone.
export function CreateTaskDialog({ projectId, features, milestones, onCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [featureId, setFeatureId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setFeatureId("");
    setMilestoneId("");
    setDueDate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        priority,
        featureId: featureId || undefined,
        milestoneId: milestoneId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }),
    });

    setLoading(false);
    if (res.ok) {
      const { task } = await res.json();
      onCreated(task);
      reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()} priority
              </option>
            ))}
          </select>
          {features.length > 0 && (
            <select
              value={featureId}
              onChange={(e) => setFeatureId(e.target.value)}
              className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
            >
              <option value="">Link to feature (optional)</option>
              {features.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
          {milestones.length > 0 && (
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
            >
              <option value="">Link to milestone (optional)</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          )}
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? "Adding..." : "Add Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
