import { z } from "zod";

export const clientProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7).optional(),
  documentId: z.string().min(4).optional(),
  motoBrand: z.string().min(2).optional(),
  motoModel: z.string().min(1).optional(),
  motoYear: z.coerce.number().int().min(1900).max(2100).optional(),
  motoPlate: z.string().min(3).optional(),
  motoColor: z.string().min(2).optional(),
});

export type ClientProfileInput = z.infer<typeof clientProfileSchema>;
