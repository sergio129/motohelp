import { z } from "zod";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/sanitization";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre es obligatorio")
    .transform(sanitizeString)
    .refine((val) => val.length > 0, "El nombre no puede estar vacío"),
  email: z
    .string()
    .email("Email inválido")
    .transform(sanitizeEmail)
    .refine((val) => val.length > 0, "Email no válido"),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(128, "Máximo 128 caracteres")
    .refine(
      (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
      "Debe contener mayúsculas, minúsculas y números"
    ),
  role: z.enum(["CLIENT", "MECHANIC"]).optional(),
  phone: z
    .string()
    .min(7)
    .transform(sanitizePhone)
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
