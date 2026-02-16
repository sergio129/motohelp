import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { authService } from "@/services/authService";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = registerSchema.parse(payload);

    const user = await authService.registerUser(data);

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
