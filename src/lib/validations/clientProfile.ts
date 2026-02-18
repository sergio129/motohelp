import { z } from "zod";
import { sanitizeString, sanitizePhone } from "@/lib/sanitization";

export const clientProfileSchema = z.object({
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
  motoBrand: z
    .string()
    .min(2)
    .transform(sanitizeString)
    .optional(),
  motoModel: z
    .string()
    .min(1)
    .transform(sanitizeString)
    .optional(),
  motoYear: z.coerce.number().int().min(1900).max(2100).optional(),
  motoPlate: z
    .string()
    .min(3)
    .transform(sanitizeString)
    .optional(),
  motoColor: z
    .string()
    .min(2)
    .transform(sanitizeString)
    .optional(),
});

export type ClientProfileInput = z.infer<typeof clientProfileSchema>;
