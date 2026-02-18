import { z } from "zod";
import { sanitizeString, sanitizePhone } from "@/lib/sanitization";

export const mechanicPersonalSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre es obligatorio")
    .transform(sanitizeString),
  phone: z
    .string()
    .min(7)
    .transform(sanitizePhone)
    .optional(),
  documentId: z
    .string()
    .min(4)
    .transform(sanitizeString)
    .optional(),
});

export type MechanicPersonalInput = z.infer<typeof mechanicPersonalSchema>;
