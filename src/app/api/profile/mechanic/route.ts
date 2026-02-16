import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mechanicPersonalSchema } from "@/lib/validations/mechanicPersonal";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, documentId: true },
  });

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  
  if (session.user.role !== "MECHANIC") {
    return NextResponse.json({ message: "Solo mecánicos pueden acceder" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const data = mechanicPersonalSchema.parse(payload);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone ?? null,
        documentId: data.documentId ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ message: "No se pudo guardar" }, { status: 500 });
  }
}
