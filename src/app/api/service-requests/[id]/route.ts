import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateServiceStatusSchema } from "@/lib/validations/serviceRequest";
import { mechanicProfileService } from "@/services/mechanicProfileService";
import { serviceRequestService } from "@/services/serviceRequestService";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  const payload = await request.json();

  if (payload.action === "assign" && session.user.role === "MECHANIC") {
    const profile = await mechanicProfileService.getByUserId(session.user.id);
    if (!profile?.verified) {
      return NextResponse.json({ message: "Mecánico no verificado" }, { status: 403 });
    }

    try {
      const updated = await serviceRequestService.assignMechanic(id, session.user.id);
      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
      }
      if (error instanceof Error && error.message === "INVALID_STATUS") {
        return NextResponse.json({ message: "Solicitud no disponible" }, { status: 400 });
      }
      return NextResponse.json({ message: "Error al asignar" }, { status: 500 });
    }
  }

  const data = updateServiceStatusSchema.parse(payload);

  try {
    const updated = await serviceRequestService.updateStatusForRole({
      id,
      status: data.status,
      role: session.user.role as "CLIENT" | "MECHANIC" | "ADMIN",
      userId: session.user.id,
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "INVALID_STATUS") {
      return NextResponse.json({ message: "Transición no permitida" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}
