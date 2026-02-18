import { z } from "zod";

/**
 * Sanitización de strings para prevenir XSS
 * Remove caracteres especiales HTML peligrosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";

  return (
    input
      // Remover tags HTML
      .replace(/<[^>]*>/g, "")
      // Remover scripts
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remover event handlers
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
      // Trim whitespace
      .trim()
  );
}

/**
 * Sanitización de emails
 */
export function sanitizeEmail(input: string): string {
  const sanitized = sanitizeString(input);
  // Validar que sea un email válido mediante regex básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized.toLowerCase() : "";
}

/**
 * Sanitización de URLs
 */
export function sanitizeUrl(input: string): string {
  const sanitized = sanitizeString(input);
  try {
    const url = new URL(sanitized);
    // Solo permitir http y https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

/**
 * Sanitización de números
 */
export function sanitizeNumber(input: any): number {
  const num = Number(input);
  return isNaN(num) ? 0 : num;
}

/**
 * Sanitización de booleanos
 */
export function sanitizeBoolean(input: any): boolean {
  return input === true || input === "true" || input === 1 || input === "1";
}

/**
 * Sanitización de teléfonos (formato básico)
 */
export function sanitizePhone(input: string): string {
  return sanitizeString(input)
    .replace(/[^\d+\-\s()]/g, "")
    .trim();
}

/**
 * Zod schemas personalizados con sanitización automática
 */

export const SanitizedStringSchema = z
  .string()
  .transform((val) => sanitizeString(val))
  .pipe(
    z.string().refine((val) => val.length > 0, {
      message: "El string no puede estar vacío después de sanitización",
    })
  );

export const SanitizedNameSchema = z
  .string()
  .transform((val) => sanitizeString(val))
  .pipe(
    z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .refine((val) => /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(val), {
        message: "El nombre solo puede contener letras y espacios",
      })
  );

export const SanitizedEmailSchema = z
  .string()
  .email("Email inválido")
  .transform((val) => sanitizeEmail(val))
  .pipe(
    z.string().refine((val) => val.length > 0, {
      message: "Email no válido",
    })
  );

export const SanitizedPasswordSchema = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .max(128, "La contraseña no puede exceder 128 caracteres")
  .refine(
    (val) => {
      // Debe contener al menos una mayúscula, una minúscula, un número
      return (
        /[a-z]/.test(val) &&
        /[A-Z]/.test(val) &&
        /[0-9]/.test(val)
      );
    },
    {
      message:
        "La contraseña debe contener mayúsculas, minúsculas y números",
    }
  );

export const SanitizedPhoneSchema = z
  .string()
  .transform((val) => sanitizePhone(val))
  .pipe(
    z.string().refine((val) => val.length >= 7, {
      message: "Teléfono inválido",
    })
  );

export const SanitizedUrlSchema = z
  .string()
  .transform((val) => sanitizeUrl(val))
  .pipe(
    z.string().refine((val) => val.length > 0, {
      message: "URL inválida",
    })
  );

export const SanitizedNumberSchema = z
  .number()
  .or(z.string().transform((val) => sanitizeNumber(val)))
  .refine((val) => typeof val === "number" && !isNaN(val), {
    message: "Debe ser un número válido",
  });

/**
 * Middleware para aplicar sanitización automática a payloads JSON
 * Uso en API routes:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const payload = await sanitizePayload(request.json());
 *   // payload está automáticamente limpio
 * }
 * ```
 */
export async function sanitizePayload(
  data: Record<string, any>
): Promise<Record<string, any>> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "number") {
      sanitized[key] = sanitizeNumber(value);
    } else if (typeof value === "boolean") {
      sanitized[key] = sanitizeBoolean(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      );
    } else if (value !== null && typeof value === "object") {
      sanitized[key] = await sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
