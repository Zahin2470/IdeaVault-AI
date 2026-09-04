"use client";

import { useEffect, useState } from "react";
import { EditableSection } from "@/components/projects/editable-section";
import { AISuggestButton } from "@/components/ai/ai-suggest-button";

interface ProblemProposal {
  problem: string;
  alternatives: string;
  whyItMatters: string;
}

export default function ProblemPage({ params }: { params: { projectId: string } }) {
  const [values, setValues] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}`)
      .then((r) => r.json())
      .then(({ project }) =>
        setValues({
          problem: project.problem?.problem ?? "",
          alternatives: project.problem?.alternatives ?? "",
          whyItMatters: project.problem?.whyItMatters ?? "",
        })
      );
  }, [params.projectId]);

  async function handleSave(v: Record<string, string>) {
    const res = await fetch(`/api/projects/${params.projectId}/problem`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    return res.ok;
  }

  // Approving an AI proposal both updates the visible form (via the
  // EditableSection remount below, keyed on `values`) and persists it —
  // the same PATCH the manual Save button uses.
  async function handleApprove(proposal: ProblemProposal) {
    setValues(proposal);
    await handleSave(proposal);
  }

  if (!values) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AISuggestButton<ProblemProposal>
          projectId={params.projectId}
          operation="improve_problem"
          label="Improve with AI"
          onApprove={handleApprove}
        />
      </div>
      <EditableSection
        key={JSON.stringify(values)}
        title="Problem"
        initialValues={values}
        onSave={handleSave}
        fields={[
          { key: "problem", label: "What problem does this project solve?", placeholder: "Describe the problem..." },
          { key: "alternatives", label: "Existing Alternatives", placeholder: "What do users currently do?" },
          { key: "whyItMatters", label: "Why It Matters", placeholder: "Why is this worth solving?" },
        ]}
      />
    </div>
  );
}
