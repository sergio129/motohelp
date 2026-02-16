import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().max(30).optional(),
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  reference: z.string().max(120).optional(),
});

export const setPrimarySchema = z.object({
  id: z.string().min(1),
});

export type AddressInput = z.infer<typeof addressSchema>;
