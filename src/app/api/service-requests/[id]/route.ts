import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateServiceStatusSchema } from "@/lib/validations/serviceRequest";
import { mechanicProfileService } from "@/services/mechanicProfileService";
import { serviceRequestService } from "@/services/serviceRequestService";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const service = await serviceRequestService.findById(id);
    if (!service) {
      return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
    }

    // Validar autorización: solo cliente, mecánico asignado o admin
    const isAuthorized =
      session.user.role === "ADMIN" ||
      service.clientId === session.user.id ||
      service.mechanicId === session.user.id;

    if (!isAuthorized) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener solicitud" }, { status: 500 });
  }
}

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
    } catch (error: any) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
      }
      if (error.message === "INVALID_STATUS") {
        return NextResponse.json({ message: "Solicitud no disponible" }, { status: 400 });
      }
      if (
        error.message === "El mecánico ya tiene un servicio en progreso" ||
        error.message.includes("servicio en progreso")
      ) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return NextResponse.json({ message: "Error al asignar" }, { status: 500 });
    }
  }

  if (payload.notes !== undefined && session.user.role === "MECHANIC") {
    try {
      await serviceRequestService.updateNotes(id, payload.notes, session.user.id);
      return NextResponse.json({ message: "Notas actualizadas" });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ message: "No autorizado" }, { status: 403 });
      }
      return NextResponse.json({ message: "Error al actualizar notas" }, { status: 500 });
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
  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
    }
    if (error.message === "INVALID_STATUS") {
      return NextResponse.json({ message: "Transición no permitida" }, { status: 400 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}
