import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientProfileSchema } from "@/lib/validations/clientProfile";
import { clientProfileService } from "@/services/clientProfileService";
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
  const profile = await clientProfileService.getByUserId(session.user.id);

  return NextResponse.json({ user, profile });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const data = clientProfileSchema.parse(payload);
    const profile = await clientProfileService.upsert(session.user.id, data);
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ message: "No se pudo guardar" }, { status: 500 });
  }
}
