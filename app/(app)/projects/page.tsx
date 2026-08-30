"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProjectListItem {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  _count: { features: number; tasks: number };
}

// Projects list — top-level nav item (§9). Kept intentionally plain;
// richer cards (progress, next task) arrive with Tasks in Phase 5.
export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(({ projects }) => setProjects(projects));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Turn an idea into a project when you&apos;re ready.
        </p>
      </div>

      {!projects ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          Turn an idea into a project from the{" "}
          <Link href="/ideas" className="text-accent">
            Idea Vault
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 hover:border-accent/40"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{p.name}</h3>
                <Badge variant="accent">{p.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {p._count.features} feature{p._count.features === 1 ? "" : "s"} ·{" "}
                {p._count.tasks} task{p._count.tasks === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
