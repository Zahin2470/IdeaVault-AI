"use client";

import { useCallback, useState } from "react";

// Small shared hook so every consumer (Task Board, Milestones, ...)
// doesn't reimplement the same show-then-auto-hide timer.
export function useCompletionStamp(duration = 1400) {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("");

  const trigger = useCallback(
    (text: string) => {
      setLabel(text);
      setVisible(true);
      window.setTimeout(() => setVisible(false), duration);
    },
    [duration]
  );

  return { visible, label, trigger };
}
