"use client";

import { useEffect, useState } from "react";
import { EditableSection } from "@/components/projects/editable-section";
import { AISuggestButton } from "@/components/ai/ai-suggest-button";

interface AudienceProposal {
  primaryAudience: string;
  secondaryAudience: string;
  painPoints: string[];
}

// painPoints is stored as a string[] in the DB; the textarea here uses
// one line per pain point and we split/join at the boundary.
export default function AudiencePage({ params }: { params: { projectId: string } }) {
  const [values, setValues] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.projectId}`)
      .then((r) => r.json())
      .then(({ project }) =>
        setValues({
          primaryAudience: project.audience?.primaryAudience ?? "",
          secondaryAudience: project.audience?.secondaryAudience ?? "",
          painPoints: (project.audience?.painPoints ?? []).join("\n"),
        })
      );
  }, [params.projectId]);

  async function handleSave(v: Record<string, string>) {
    const res = await fetch(`/api/projects/${params.projectId}/audience`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryAudience: v.primaryAudience,
        secondaryAudience: v.secondaryAudience,
        painPoints: v.painPoints.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    return res.ok;
  }

  async function handleApprove(proposal: AudienceProposal) {
    const joined = {
      primaryAudience: proposal.primaryAudience,
      secondaryAudience: proposal.secondaryAudience,
      painPoints: proposal.painPoints.join("\n"),
    };
    setValues(joined);
    await handleSave(joined);
  }

  if (!values) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AISuggestButton<AudienceProposal>
          projectId={params.projectId}
          operation="improve_audience"
          label="Improve with AI"
          onApprove={handleApprove}
        />
      </div>
      <EditableSection
        key={JSON.stringify(values)}
        title="Target Audience"
        initialValues={values}
        onSave={handleSave}
        fields={[
          { key: "primaryAudience", label: "Primary Audience", placeholder: "e.g. University students living on campus" },
          { key: "secondaryAudience", label: "Secondary Audience", placeholder: "e.g. Parents, administrators, restaurants" },
          { key: "painPoints", label: "User Pain Points (one per line)", placeholder: "One pain point per line" },
        ]}
      />
    </div>
  );
}
