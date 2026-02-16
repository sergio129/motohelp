import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mechanicProfileService } from "@/services/mechanicProfileService";
import { z } from "zod";

const verifySchema = z.object({
  userId: z.string().min(1),
  verified: z.coerce.boolean(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Solo administradores" }, { status: 403 });
  }

  const mechanics = await mechanicProfileService.listWithUsers();
  return NextResponse.json(mechanics);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Solo administradores" }, { status: 403 });
  }

  const payload = await request.json();
  const data = verifySchema.parse(payload);
  const updated = await mechanicProfileService.verify(data.userId, data.verified);
  return NextResponse.json(updated);
}
