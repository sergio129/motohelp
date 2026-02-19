import { z } from "zod";
import { sanitizeString } from "@/lib/sanitization";

function parseScheduledAtWithBogotaFallback(value: unknown): unknown {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const raw = value.trim();
  if (!raw) {
    return value;
  }

  // Si no trae zona horaria explícita, asumir Colombia (America/Bogota, UTC-5)
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(raw);
  const normalized = hasTimezone ? raw : `${raw}-05:00`;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}

export const createServiceRequestSchema = z.object({
  serviceTypeId: z.string().min(1, "Selecciona un tipo de servicio"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .transform(sanitizeString),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .transform(sanitizeString),
  scheduledAt: z.preprocess(
    parseScheduledAtWithBogotaFallback,
    z.coerce.date()
  ),
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
