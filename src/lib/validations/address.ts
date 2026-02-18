import { z } from "zod";
import { sanitizeString } from "@/lib/sanitization";

export const addressSchema = z.object({
  label: z.string().max(30).optional().transform((v) => v ? sanitizeString(v) : v),
  street: z.string().min(3).transform(sanitizeString),
  city: z.string().min(2).transform(sanitizeString),
  state: z.string().min(2).transform(sanitizeString),
  postalCode: z.string().min(3).transform(sanitizeString),
  country: z.string().min(2).transform(sanitizeString),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  reference: z.string().max(120).optional().transform((v) => v ? sanitizeString(v) : v),
});

export const setPrimarySchema = z.object({
  id: z.string().min(1),
});

export type AddressInput = z.infer<typeof addressSchema>;
