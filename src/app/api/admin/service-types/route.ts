import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serviceTypeService } from "@/services/serviceTypeService";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().max(200).optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  description: z.string().max(200).optional().nullable(),
  active: z.boolean().optional(),
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

  const payload = await request.json();
  const data = createSchema.parse(payload);
  const created = await serviceTypeService.create(data);
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const payload = await request.json();
  const data = updateSchema.parse(payload);
  const updated = await serviceTypeService.update(data.id, {
    name: data.name,
    description: data.description ?? undefined,
    active: data.active,
  });
  return NextResponse.json(updated);
}
