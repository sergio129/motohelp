import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServiceRequestSchema } from "@/lib/validations/serviceRequest";
import { serviceTypeRepository } from "@/repositories/serviceTypeRepository";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";
import { mechanicProfileService } from "@/services/mechanicProfileService";
import { serviceRequestService } from "@/services/serviceRequestService";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const scope = new URL(request.url).searchParams.get("scope");

  if (session.user.role === "MECHANIC") {
    // Verificar que el mecánico esté verificado
    const profile = await mechanicProfileService.getByUserId(session.user.id);
    if (!profile) {
      return NextResponse.json([]);
    }

    if (!profile.verified) {
      // Retornar array vacío si no está verificado
      // El dashboard mostrará un mensaje apropiado
      return NextResponse.json([]);
    }

    if (scope === "assigned") {
      const requests = await serviceRequestService.listAssignedToMechanic(session.user.id);
      return NextResponse.json(requests);
    }

    const allowedServiceIds = profile?.services?.map((service) => service.serviceTypeId) ?? [];
    if (!allowedServiceIds.length) {
      return NextResponse.json([]);
    }
    const requests = await serviceRequestService.listAvailable(allowedServiceIds);
    return NextResponse.json(requests);
  }

  if (session.user.role === "ADMIN") {
    const requests = await serviceRequestService.listAll();
    return NextResponse.json(requests);
  }

  const requests = await serviceRequestService.listByClient(session.user.id);
  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 20 solicitudes de servicio por hora
  const rateLimitCheck = checkRateLimit(request, 20, 60 * 60 * 1000);
  if (!rateLimitCheck.allowed && rateLimitCheck.response) {
    return rateLimitCheck.response;
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ message: "Solo clientes pueden crear solicitudes" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const data = createServiceRequestSchema.parse(payload);

    const serviceType = await serviceTypeRepository.listActive();
    const isValidType = serviceType.some((type) => type.id === data.serviceTypeId);
    if (!isValidType) {
      return NextResponse.json({ message: "Tipo de servicio inválido" }, { status: 400 });
    }

    const created = await serviceRequestService.create({
      clientId: session.user.id,
      serviceTypeId: data.serviceTypeId,
      description: data.description,
      address: data.address,
      scheduledAt: data.scheduledAt,
      price: data.price,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const first = error.issues[0];
      return NextResponse.json({ message: first?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ message: "Error al crear solicitud" }, { status: 500 });
  }
}
