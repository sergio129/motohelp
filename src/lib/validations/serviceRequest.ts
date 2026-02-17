import { z } from "zod";

export const createServiceRequestSchema = z.object({
  serviceTypeId: z.string().min(1, "Selecciona un tipo de servicio"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  scheduledAt: z.coerce.date(),
  price: z.coerce.number().positive().optional(),
}).refine((data) => data.scheduledAt.getTime() > Date.now(), {
  message: "La fecha programada debe ser futura. Por favor selecciona una fecha y hora posteriores a este momento",
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
