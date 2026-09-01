import { z } from "zod";

// §29 — Notes
export const createNoteSchema = z.object({
  title: z.string().max(150).optional(),
  content: z.string().min(1, "Note can't be empty").max(5000),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export const updateNoteSchema = z.object({
  title: z.string().max(150).optional(),
  content: z.string().min(1).max(5000).optional(),
  pinned: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});
