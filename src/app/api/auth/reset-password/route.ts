import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { setCORSHeaders, handleCORSPreflight } from "@/lib/cors";
import bcrypt from "bcryptjs";

export async function OPTIONS(request: NextRequest) {
  return handleCORSPreflight(request);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 5 intentos de reseteo por hora
  const rateLimitCheck = checkRateLimit(request, 5, 60 * 60 * 1000);
  if (!rateLimitCheck.allowed && rateLimitCheck.response) {
    return rateLimitCheck.response;
  }

  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      const response = NextResponse.json(
        { error: "Token y contraseña son requeridos" },
        { status: 400 }
      );
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      const response = NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    // Buscar el token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      const response = NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      );
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    // Verificar si el token ha expirado
    if (new Date() > resetToken.expiresAt) {
      const response = NextResponse.json(
        { error: "Token expirado" },
        { status: 400 }
      );
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    // Verificar si el token ya fue usado
    if (resetToken.used) {
      const response = NextResponse.json(
        { error: "Este token ya fue utilizado" },
        { status: 400 }
      );
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Marcar el token como utilizado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    const successResponse = NextResponse.json(
      { message: "Contraseña actualizada exitosamente" },
      { status: 200 }
    );
    return setCORSHeaders(successResponse, request.headers.get("origin"));
  } catch (error) {
    console.error("Error en reset-password:", error);
    const response = NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
    return setCORSHeaders(response, request.headers.get("origin"));
  }
}
