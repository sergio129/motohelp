import { NextRequest, NextResponse } from "next/server";

// Almacenar IPs y sus request counts en memoria
// Nota: En producción, usar Redis para persistence entre deploys
const requestCounts = new Map<
  string,
  { count: number; resetTime: number }
>();

/**
 * Rate limiter por IP
 * @param request - NextRequest
 * @param maxRequests - Máximo de requests permitidos
 * @param windowMs - Ventana de tiempo en milisegundos (default: 15 minutos)
 */
export function rateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutos
): { allowed: boolean; remaining: number; retryAfter: number } {
  const ip = getClientIp(request);
  const now = Date.now();

  let data = requestCounts.get(ip);

  // Crear nueva entrada o resetear si expiró la ventana
  if (!data || now > data.resetTime) {
    data = {
      count: 1,
      resetTime: now + windowMs,
    };
    requestCounts.set(ip, data);
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  // Incrementar contador
  data.count++;

  if (data.count > maxRequests) {
    const retryAfter = Math.ceil((data.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - data.count,
    retryAfter: 0,
  };
}

/**
 * Extraer IP del cliente de la request
 */
function getClientIp(request: NextRequest): string {
  // Intentar obtener IP de headers de proxy
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Fallback a header de Vercel
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Último recurso: usar información del socket (no disponible en NextRequest)
  // NextRequest no expone la IP directamente, usar "unknown" como fallback
  return "unknown";
}

/**
 * Middleware para proteger endpoints con rate limiting
 * Uso en route.ts:
 * 
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = checkRateLimit(request, 10, 60000);
 *   if (!rateLimitResult.allowed) {
 *     return NextResponse.json(
 *       { error: "Demasiadas requests. Intenta más tarde." },
 *       { 
 *         status: 429,
 *         headers: {
 *           "Retry-After": rateLimitResult.retryAfter.toString(),
 *         }
 *       }
 *     );
 *   }
 *   // ... tu lógica
 * }
 */
export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
): {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  response?: NextResponse;
} {
  const result = rateLimit(request, maxRequests, windowMs);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: "Demasiadas requests. Por favor, intenta más tarde.",
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": result.retryAfter.toString(),
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
    return { ...result, response };
  }

  return {
    allowed: true,
    remaining: result.remaining,
    retryAfter: 0,
  };
}
