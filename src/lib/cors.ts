import { NextRequest, NextResponse } from "next/server";

/**
 * Configuración CORS para MotoHelp
 * Define qué orígenes pueden hacer requests a los endpoints de API
 */

const ALLOWED_ORIGINS = [
  "https://motohelp-iota.vercel.app",
  "https://motohelp.vercel.app",
  "http://localhost:3000", // Desarrollo local
  "http://localhost:3001", // Desarrollo local alternativo
];

/**
 * Verifica si el origen está permitido
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Permitir requests sin origen (Node.js clients, etc)
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Aplica headers CORS a una respuesta NextResponse
 */
export function setCORSHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  if (isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ].join(", ")
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 horas

  return response;
}

/**
 * Handler para preflight requests (OPTIONS)
 * Debe ser usado en todos los endpoints que aceptan requests CORS
 */
export async function handleCORSPreflight(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  const response = new NextResponse(null, { status: 200 });
  return setCORSHeaders(response, origin);
}

/**
 * Middleware helper para aplicar CORS a un endpoint POST/PUT/DELETE
 *
 * Uso en API routes:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   // Manejo de CORS preflight
 *   if (request.method === "OPTIONS") {
 *     return handleCORSPreflight(request);
 *   }
 *
 *   try {
 *     // Tu lógica aquí
 *     const response = NextResponse.json({ success: true });
 *     return setCORSHeaders(response, request.headers.get("origin"));
 *   } catch (error) {
 *     const response = NextResponse.json({ error: "..." }, { status: 500 });
 *     return setCORSHeaders(response, request.headers.get("origin"));
 *   }
 * }
 * ```
 */
export function corsMiddleware(handler: Function) {
  return async (request: NextRequest) => {
    const origin = request.headers.get("origin");

    // Manejo de preflight
    if (request.method === "OPTIONS") {
      return handleCORSPreflight(request);
    }

    // Ejecutar handler
    const response = await handler(request);

    // Aplicar headers CORS
    return setCORSHeaders(response, origin);
  };
}
