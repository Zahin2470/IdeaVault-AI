"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AISuggestButtonProps<T extends Record<string, string | string[]>> {
  projectId: string;
  operation: string;
  label: string;
  onApprove: (proposal: T) => Promise<void>;
}

function labelize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

// Generic preview: every proposal here is a flat object of strings and
// string arrays, so one renderer covers Problem/Audience/Solution/MVP
// without four bespoke preview components.
function ProposalPreview({ proposal }: { proposal: Record<string, string | string[]> }) {
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(proposal).map(([key, value]) => (
        <div key={key}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {labelize(key)}
          </p>
          {Array.isArray(value) ? (
            <ul className="mt-1 list-disc pl-4 text-sm">
              {value.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm">{value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// §25, §74 — every AI action in the app goes through this same
// propose → review → approve flow. Nothing is written until the user
// clicks Approve; Discard just closes the dialog and touches nothing.
export function AISuggestButton<T extends Record<string, string | string[]>>({
  projectId,
  operation,
  label,
  onApprove,
}: AISuggestButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setProposal(null);

    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, operation }),
    });

    setLoading(false);
    setOpen(true);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "The AI couldn't generate a suggestion. Please try again.");
      return;
    }

    const { proposal } = await res.json();
    setProposal(proposal);
  }

  async function handleApprove() {
    if (!proposal) return;
    setApplying(true);
    await onApprove(proposal);
    setApplying(false);
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        {loading ? "Thinking..." : label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Suggestion</DialogTitle>
          </DialogHeader>

          {error && <p className="text-sm text-danger">{error}</p>}

          {proposal && (
            <div className="flex flex-col gap-4">
              <div className="max-h-80 overflow-y-auto rounded-md border border-border p-3">
                <ProposalPreview proposal={proposal} />
              </div>
              <p className="text-xs text-muted-foreground">
                Nothing is saved until you approve — review before applying.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleApprove} disabled={applying}>
                  {applying ? "Applying..." : "Approve & Apply"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Discard
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
