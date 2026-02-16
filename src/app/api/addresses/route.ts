import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addressSchema, setPrimarySchema } from "@/lib/validations/address";
import { addressRepository } from "@/repositories/addressRepository";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const addresses = await addressRepository.listByUser(session.user.id);
  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const data = addressSchema.parse(payload);
    const created = await addressRepository.create(session.user.id, data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ message: "No se pudo guardar" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const data = setPrimarySchema.parse(payload);
    await addressRepository.setPrimary(session.user.id, data.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ message: "No se pudo actualizar" }, { status: 500 });
  }
}
