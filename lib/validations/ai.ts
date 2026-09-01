import { z } from "zod";

export const chatSchema = z.object({
  message: z.string().min(1, "Message can't be empty").max(4000),
  projectId: z.string().optional(),
});
