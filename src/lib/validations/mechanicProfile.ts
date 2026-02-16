import { z } from "zod";

export const mechanicProfileSchema = z.object({
  experienceYears: z.coerce.number().int().min(0).max(60),
  specialty: z.string().min(2, "La especialidad es obligatoria"),
});

export type MechanicProfileInput = z.infer<typeof mechanicProfileSchema>;
