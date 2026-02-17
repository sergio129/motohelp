import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { NotificationService } from "@/services/notificationService";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = registerSchema.parse(payload);

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

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json({ message: "El email ya está registrado" }, { status: 409 });
    }

    return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
  }
}
