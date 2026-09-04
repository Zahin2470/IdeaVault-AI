"use client";

import { useEffect, useState } from "react";
import { EditableSection } from "@/components/projects/editable-section";
import { MVPFeatureSelect } from "@/components/projects/mvp-feature-select";
import { AISuggestButton } from "@/components/ai/ai-suggest-button";
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

interface MVPProposal {
  goal: string;
  coreUsers: string;
  coreProblem: string;
  successCriteria: string[];
}

// §23-24 — MVP Planner: goal/core users/problem/success criteria, plus
// which features make the v1 cut.
export default function MVPPage({ params }: { params: { projectId: string } }) {
  const [data, setData] = useState<MVPProjectData | null>(null);
  const [planValues, setPlanValues] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}`)
      .then((r) => r.json())
      .then(({ project }) => {
        setData(project);
        setPlanValues({
          goal: project.mvpPlan?.goal ?? "",
          coreUsers: project.mvpPlan?.coreUsers ?? "",
          coreProblem: project.mvpPlan?.coreProblem ?? "",
          successCriteria: (project.mvpPlan?.successCriteria ?? []).join("\n"),
        });
      });
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

  async function handleApprove(proposal: MVPProposal) {
    const joined = {
      goal: proposal.goal,
      coreUsers: proposal.coreUsers,
      coreProblem: proposal.coreProblem,
      successCriteria: proposal.successCriteria.join("\n"),
    };
    setPlanValues(joined);
    await handleSavePlan(joined);
  }

  if (!data || !planValues) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <AISuggestButton<MVPProposal>
            projectId={params.projectId}
            operation="generate_mvp"
            label="Generate MVP with AI"
            onApprove={handleApprove}
          />
        </div>
        <EditableSection
          key={JSON.stringify(planValues)}
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
      </div>

      <MVPFeatureSelect
        projectId={params.projectId}
        features={data.features}
        initialSelectedIds={(data.mvpPlan?.mvpFeatures ?? []).map((mf) => mf.featureId)}
      />
    </div>
  );
}
