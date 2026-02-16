import { z } from "zod";

export const mechanicProfileSchema = z.object({
  experienceYears: z.coerce.number().int().min(0).max(60),
  specialty: z.string().min(2, "La especialidad es obligatoria"),
  serviceTypeIds: z.array(z.string().min(1)).min(1, "Selecciona al menos un servicio"),
});

export type MechanicProfileInput = z.infer<typeof mechanicProfileSchema>;
