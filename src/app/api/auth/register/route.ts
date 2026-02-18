import { NextResponse, NextRequest } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { NotificationService } from "@/services/notificationService";
import { checkRateLimit } from "@/lib/rateLimit";
import { setCORSHeaders, handleCORSPreflight } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCORSPreflight(request);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 5 intentos de registro por hora
  const rateLimitCheck = checkRateLimit(request, 5, 60 * 60 * 1000);
  if (!rateLimitCheck.allowed && rateLimitCheck.response) {
    return rateLimitCheck.response;
  }

  try {
    const payload = await request.json();
    const data = registerSchema.parse(payload);

    // Si no viene un rol específico (signup pública), default a CLIENT
    if (!data.role || data.role === "CLIENT") {
      data.role = "CLIENT";
    }
    // Si viene MECHANIC, se permite (para admin panel)

    const user = await authService.registerUser(data);
    
    // Enviar email de bienvenida (en background)
    NotificationService.sendWelcomeEmail({
      userEmail: user.email,
      userName: user.name,
      userRole: user.role as "CLIENT" | "MECHANIC",
    }).catch(err => console.error("Error sending welcome email:", err));
    
    // Si es mecánico, notificar al admin (en background)
    if (user.role === "MECHANIC") {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@motohelp.local";
      NotificationService.notifyNewMechanicPending({
        adminEmail,
        mechanicName: user.name,
        mechanicEmail: user.email,
        specialty: "Por definir",
        experienceYears: 0,
        mechanicId: user.id,
      }).catch(err => console.error("Error sending admin notification:", err));
    }

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return setCORSHeaders(response, request.headers.get("origin"));
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      const response = NextResponse.json({ message: "El email ya está registrado" }, { status: 409 });
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    const response = NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }
}
