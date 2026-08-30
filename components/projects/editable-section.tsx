"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Field {
  key: string;
  label: string;
  placeholder: string;
}

interface EditableSectionProps {
  title: string;
  fields: Field[];
  initialValues: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<boolean>;
}

// Shared shape for Problem/Audience/Solution (§19-21): a few labeled
// textareas, an explicit Save, and the original content always stays
// visible/editable — nothing here is silently overwritten by AI (that
// gate is enforced server-side once "Improve with AI" lands in Phase 6).
export function EditableSection({ title, fields, initialValues, onSave }: EditableSectionProps) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave() {
    setSaving(true);
    const ok = await onSave(values);
    setSaving(false);
    if (ok) setSavedAt(Date.now());
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{f.label}</label>
          <Textarea
            placeholder={f.placeholder}
            value={values[f.key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            className="min-h-28"
          />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="w-fit">
          {saving ? "Saving..." : "Save"}
        </Button>
        {savedAt && <span className="text-xs text-muted-foreground">Saved</span>}
      </div>
    </div>
  );
}
