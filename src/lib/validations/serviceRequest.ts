import { z } from "zod";

export const createServiceRequestSchema = z.object({
  serviceTypeId: z.string().min(1),
  description: z.string().min(10),
  address: z.string().min(5),
  scheduledAt: z.coerce.date(),
  price: z.coerce.number().positive().optional(),
}).refine((data) => data.scheduledAt.getTime() > Date.now(), {
  message: "La fecha debe ser futura",
  path: ["scheduledAt"],
});

export const updateServiceStatusSchema = z.object({
  status: z.enum([
    "PENDIENTE",
    "ACEPTADO",
    "EN_CAMINO",
    "EN_PROCESO",
    "FINALIZADO",
    "CANCELADO",
  ]),
});

export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
