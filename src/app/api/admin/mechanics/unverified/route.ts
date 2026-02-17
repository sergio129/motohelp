import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mechanicProfileService } from "@/services/mechanicProfileService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Solo administradores" }, { status: 403 });
  }

  // Obtener todos los mecánicos
  const allMechanics = await mechanicProfileService.listWithUsers();
  
  // Filtrar solo los sin verificar
  const unverified = allMechanics.filter(m => !m.verified);
  
  return NextResponse.json(unverified);
}
