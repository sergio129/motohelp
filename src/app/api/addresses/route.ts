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
  
  if (session.user.role !== "CLIENT" && session.user.role !== "MECHANIC") {
    return NextResponse.json({ message: "Solo clientes y mecánicos pueden crear direcciones" }, { status: 403 });
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

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  
  if (session.user.role !== "CLIENT" && session.user.role !== "MECHANIC") {
    return NextResponse.json({ message: "Solo clientes y mecánicos pueden modificar direcciones" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const { id, ...data } = payload;
    
    if (!id) {
      return NextResponse.json({ message: "ID de dirección requerido" }, { status: 400 });
    }

    const updated = await addressRepository.update(session.user.id, id, data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ message: "No se pudo actualizar" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  
  if (session.user.role !== "CLIENT" && session.user.role !== "MECHANIC") {
    return NextResponse.json({ message: "Solo clientes y mecánicos pueden modificar direcciones" }, { status: 403 });
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

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  
  if (session.user.role !== "CLIENT" && session.user.role !== "MECHANIC") {
    return NextResponse.json({ message: "Solo clientes y mecánicos pueden eliminar direcciones" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const { id } = payload;
    
    if (!id) {
      return NextResponse.json({ message: "ID de dirección requerido" }, { status: 400 });
    }

    await addressRepository.delete(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: "No se pudo eliminar" }, { status: 500 });
  }
}

