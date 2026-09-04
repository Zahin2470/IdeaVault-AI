"use client";

import { useEffect, useState } from "react";
import { EditableSection } from "@/components/projects/editable-section";
import { AISuggestButton } from "@/components/ai/ai-suggest-button";

interface SolutionProposal {
  description: string;
  valueProp: string;
  keyBenefits: string[];
  differentiators: string[];
}

export default function SolutionPage({ params }: { params: { projectId: string } }) {
  const [values, setValues] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}`)
      .then((r) => r.json())
      .then(({ project }) =>
        setValues({
          description: project.solution?.description ?? "",
          valueProp: project.solution?.valueProp ?? "",
          keyBenefits: (project.solution?.keyBenefits ?? []).join("\n"),
          differentiators: (project.solution?.differentiators ?? []).join("\n"),
        })
      );
  }, [params.projectId]);

  async function handleSave(v: Record<string, string>) {
    const res = await fetch(`/api/projects/${params.projectId}/solution`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: v.description,
        valueProp: v.valueProp,
        keyBenefits: v.keyBenefits.split("\n").map((s) => s.trim()).filter(Boolean),
        differentiators: v.differentiators.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    return res.ok;
  }

  async function handleApprove(proposal: SolutionProposal) {
    const joined = {
      description: proposal.description,
      valueProp: proposal.valueProp,
      keyBenefits: proposal.keyBenefits.join("\n"),
      differentiators: proposal.differentiators.join("\n"),
    };
    setValues(joined);
    await handleSave(joined);
  }

  if (!values) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AISuggestButton<SolutionProposal>
          projectId={params.projectId}
          operation="improve_solution"
          label="Improve with AI"
          onApprove={handleApprove}
        />
      </div>
      <EditableSection
        key={JSON.stringify(values)}
        title="Solution"
        initialValues={values}
        onSave={handleSave}
        fields={[
          { key: "description", label: "Solution Description", placeholder: "What are you proposing?" },
          { key: "valueProp", label: "Core Value Proposition", placeholder: "Why should someone care?" },
          { key: "keyBenefits", label: "Key Benefits (one per line)", placeholder: "One benefit per line" },
          { key: "differentiators", label: "Differentiators (one per line)", placeholder: "One differentiator per line" },
        ]}
      />
    </div>
  );
}
