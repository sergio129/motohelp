import { z } from "zod";
import { sanitizeString } from "@/lib/sanitization";

export const createReviewSchema = z.object({
  serviceId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .max(500)
    .transform(sanitizeString)
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
