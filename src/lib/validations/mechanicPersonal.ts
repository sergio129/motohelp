import { z } from "zod";

export const mechanicPersonalSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7).optional(),
  documentId: z.string().min(4).optional(),
});

export type MechanicPersonalInput = z.infer<typeof mechanicPersonalSchema>;
