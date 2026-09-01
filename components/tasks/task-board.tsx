"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import type { Task, Feature } from "@prisma/client";
import { TASK_STATUSES } from "@/lib/validations/roadmap";

const COLUMN_LABEL: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const PRIORITY_VARIANT: Record<string, "default" | "warning" | "accent"> = {
  LOW: "default",
  MEDIUM: "default",
  HIGH: "warning",
};

interface TaskBoardProps {
  projectId: string;
  initialTasks: Task[];
  features: Feature[];
  milestones: { id: string; title: string }[];
}

// §27-28 — task board. Columns are fixed status buckets; moving a task
// uses prev/next arrows rather than drag-and-drop, matching the
// no-heavy-dnd-library approach from the Features list (Phase 3).
export function TaskBoard({ projectId, initialTasks, features, milestones }: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);

  async function moveTask(task: Task, direction: -1 | 1) {
    const idx = TASK_STATUSES.indexOf(task.status as (typeof TASK_STATUSES)[number]);
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= TASK_STATUSES.length) return;

    const nextStatus = TASK_STATUSES[nextIdx];
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      const { task: updated } = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateTaskDialog
          projectId={projectId}
          features={features}
          milestones={milestones}
          onCreated={(task) => setTasks((prev) => [...prev, task])}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TASK_STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium">{COLUMN_LABEL[status]}</h3>
                <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2 min-h-24">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-2 rounded-md border border-border bg-card p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="shrink-0 text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {task.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => moveTask(task, -1)}
                        disabled={status === TASK_STATUSES[0]}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => moveTask(task, 1)}
                        disabled={status === TASK_STATUSES[TASK_STATUSES.length - 1]}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
