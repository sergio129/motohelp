import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/[0-9]/, "Debe incluir un número"),
  role: z.enum(["CLIENT", "MECHANIC", "ADMIN"]).optional(),
  phone: z
    .string()
    .min(7)
    .regex(/^[0-9+\-() ]+$/, "Teléfono inválido")
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
