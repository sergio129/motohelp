import { z } from "zod";
import { sanitizeString } from "@/lib/sanitization";

export const addressSchema = z.object({
  label: z.string().max(30).optional().transform((v) => v ? sanitizeString(v) : v),
  street: z.string().min(3).transform(sanitizeString),
  city: z.string().min(2).transform(sanitizeString),
  state: z.string().min(2).transform(sanitizeString),
  postalCode: z.string().min(3).transform(sanitizeString),
  country: z.string().min(2).transform(sanitizeString),
  reference: z.string().max(120).optional().transform((v) => v ? sanitizeString(v) : v),
});

export const setPrimarySchema = z.object({
  id: z.string().min(1),
});

export type AddressInput = z.infer<typeof addressSchema>;
