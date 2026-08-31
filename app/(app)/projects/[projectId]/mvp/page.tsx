"use client";

import { useEffect, useState } from "react";
import { EditableSection } from "@/components/projects/editable-section";
import { MVPFeatureSelect } from "@/components/projects/mvp-feature-select";
import type { Feature } from "@prisma/client";

interface MVPProjectData {
  features: Feature[];
  mvpPlan: {
    goal: string | null;
    coreUsers: string | null;
    coreProblem: string | null;
    successCriteria: string[];
    mvpFeatures: { featureId: string }[];
  } | null;
}

// §23-24 — MVP Planner: goal/core users/problem/success criteria, plus
// which features make the v1 cut.
export default function MVPPage({ params }: { params: { projectId: string } }) {
  const [data, setData] = useState<MVPProjectData | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}`)
      .then((r) => r.json())
      .then(({ project }) => setData(project));
  }, [params.projectId]);

  async function handleSavePlan(v: Record<string, string>) {
    const res = await fetch(`/api/projects/${params.projectId}/mvp`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal: v.goal,
        coreUsers: v.coreUsers,
        coreProblem: v.coreProblem,
        successCriteria: v.successCriteria.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    return res.ok;
  }

  if (!data) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const planValues = {
    goal: data.mvpPlan?.goal ?? "",
    coreUsers: data.mvpPlan?.coreUsers ?? "",
    coreProblem: data.mvpPlan?.coreProblem ?? "",
    successCriteria: (data.mvpPlan?.successCriteria ?? []).join("\n"),
  };

  return (
    <div className="flex flex-col gap-8">
      <EditableSection
        title="MVP Plan"
        initialValues={planValues}
        onSave={handleSavePlan}
        fields={[
          { key: "goal", label: "MVP Goal", placeholder: "What must v1 prove?" },
          { key: "coreUsers", label: "Core Users", placeholder: "Who is v1 built for, specifically?" },
          { key: "coreProblem", label: "Core Problem v1 Solves", placeholder: "The one problem v1 must solve" },
          {
            key: "successCriteria",
            label: "Success Criteria (one per line)",
            placeholder: "How will you know v1 worked?",
          },
        ]}
      />

      <MVPFeatureSelect
        projectId={params.projectId}
        features={data.features}
        initialSelectedIds={(data.mvpPlan?.mvpFeatures ?? []).map((mf) => mf.featureId)}
      />
    </div>
  );
}
