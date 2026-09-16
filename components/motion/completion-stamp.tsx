"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface CompletionStampProps {
  show: boolean;
  label: string;
}

// The signature moment: an ink-stamp "slam" rather than generic confetti
// — on-brand with the blueprint/drafting concept from marketing instead
// of a celebration cliché that could belong to any app. A radial "impact"
// flash plus a double-bordered rotated stamp, both spring-driven for a
// punchy, physical feel. Fully respects prefers-reduced-motion via the
// app-wide MotionConfig — reduces to a simple fade under that setting.
export function CompletionStamp({ show, label }: CompletionStampProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0.6, scale: 0 }}
            animate={{ opacity: 0, scale: 3.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute h-40 w-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--accent) / 0.35), transparent 70%)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 1.8, rotate: -16 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="relative flex items-center gap-2.5 rounded-md border-[3px] border-accent bg-background/95 px-6 py-3 shadow-elevation-lg backdrop-blur-sm"
          >
            <span className="absolute inset-[3px] rounded-[4px] border border-accent/40" aria-hidden="true" />
            <CheckCircle2 className="h-6 w-6 text-accent" />
            <span className="font-display text-xl font-bold uppercase tracking-widest text-accent">
              {label}
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
