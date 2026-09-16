"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectListItem {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  _count: { features: number; tasks: number };
}

// Projects list — top-level nav item (§9).
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          Turn an idea into a project from the{" "}
          <Link href="/ideas" className="text-accent transition-premium hover:opacity-75">
            Idea Vault
          </Link>
          .
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <StaggerItem key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-elevation-sm transition-premium hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-elevation-md"
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
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
