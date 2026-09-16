"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

// Shared list-entrance choreography — one item fading/sliding in after
// the next, rather than the whole grid popping in at once. Used for the
// Idea Vault grid, Projects grid, Dashboard's active-projects grid, and
// the Features list. Reduced-motion handling is global (MotionConfig in
// the root layout), not per-component.
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={container} initial="hidden" animate="show">
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </motion.div>
  );
}

// Pass a React `key` when using this in a .map() — e.g.
// <StaggerItem key={idea.id}>...</StaggerItem> — that key is what
// AnimatePresence (in the parent StaggerList) uses to detect an item's
// removal and play its exit animation, not any prop on StaggerItem itself.
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item} exit="exit" layout>
      {children}
    </motion.div>
  );
}
