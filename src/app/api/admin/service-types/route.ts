import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serviceTypeService } from "@/services/serviceTypeService";
import { z } from "zod";

const serviceCategorySchema = z
  .string()
  .min(2)
  .max(60)
  .transform((value) =>
    value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/g, "")
  );

const createSchema = z.object({
  name: z.string().min(2),
  category: serviceCategorySchema,
  description: z.string().max(200).optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  category: serviceCategorySchema.optional(),
  description: z.string().max(200).optional().nullable(),
  active: z.boolean().optional(),
});

const deleteSchema = z.object({
  id: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ message: "No autorizado" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ message: "Solo administradores" }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const types = await serviceTypeService.listAll();
  return NextResponse.json(types);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const payload = await request.json();
    const data = createSchema.parse(payload);
    const created = await serviceTypeService.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ message: "No se pudo crear el tipo de servicio" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const payload = await request.json();
    const data = updateSchema.parse(payload);
    const updated = await serviceTypeService.update(data.id, {
      name: data.name,
      category: data.category,
      description: data.description ?? undefined,
      active: data.active,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "No se pudo actualizar el tipo de servicio" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const payload = await request.json();
    const data = deleteSchema.parse(payload);
    await serviceTypeService.remove(data.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "No se puede eliminar: el tipo de servicio está siendo usado por solicitudes o perfiles de mecánico" },
      { status: 400 }
    );
  }
}
