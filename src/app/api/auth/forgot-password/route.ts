import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { setCORSHeaders, handleCORSPreflight } from "@/lib/cors";
import crypto from "crypto";

export async function OPTIONS(request: NextRequest) {
  return handleCORSPreflight(request);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 3 solicitudes de recuperación por hora
  const rateLimitCheck = checkRateLimit(request, 3, 60 * 60 * 1000);
  if (!rateLimitCheck.allowed && rateLimitCheck.response) {
    return rateLimitCheck.response;
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // No revelar si el email existe o no por seguridad
      return NextResponse.json(
        { message: "Si el email existe, recibirás instrucciones" },
        { status: 200 }
      );
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar el token en la BD
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Construir la URL de reset
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password/${token}`;

    // Enviar email
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    const response = NextResponse.json(
      { message: "Si el email existe, recibirás instrucciones" },
      { status: 200 }
    );
    return setCORSHeaders(response, request.headers.get("origin"));
  } catch (error) {
    console.error("Error en forgot-password:", error);
    const response = NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
    return setCORSHeaders(response, request.headers.get("origin"));
  }
}
