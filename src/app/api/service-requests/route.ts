import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServiceRequestSchema } from "@/lib/validations/serviceRequest";
import { serviceTypeRepository } from "@/repositories/serviceTypeRepository";
import { checkRateLimit } from "@/lib/rateLimit";
import { setCORSHeaders, handleCORSPreflight } from "@/lib/cors";
import { z } from "zod";
import { mechanicProfileService } from "@/services/mechanicProfileService";
import { serviceRequestService } from "@/services/serviceRequestService";
import { NotificationService } from "@/services/notificationService";

export async function OPTIONS(request: NextRequest) {
  return handleCORSPreflight(request);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const response = NextResponse.json({ message: "No autorizado" }, { status: 401 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }

  const scope = new URL(request.url).searchParams.get("scope");

  if (session.user.role === "MECHANIC") {
    // Verificar que el mecánico esté verificado
    const profile = await mechanicProfileService.getByUserId(session.user.id);
    if (!profile) {
      const response = NextResponse.json([]);
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    if (!profile.verified) {
      // Retornar array vacío si no está verificado
      // El dashboard mostrará un mensaje apropiado
      const response = NextResponse.json([]);
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    if (scope === "assigned") {
      const requests = await serviceRequestService.listAssignedToMechanic(session.user.id);
      const response = NextResponse.json(requests);
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    const allowedServiceIds = profile?.services?.map((service) => service.serviceTypeId) ?? [];
    if (!allowedServiceIds.length) {
      const response = NextResponse.json([]);
      return setCORSHeaders(response, request.headers.get("origin"));
    }
    const requests = await serviceRequestService.listAvailable(allowedServiceIds);
    const response = NextResponse.json(requests);
    return setCORSHeaders(response, request.headers.get("origin"));
  }

  if (session.user.role === "ADMIN") {
    const requests = await serviceRequestService.listAll();
    const response = NextResponse.json(requests);
    return setCORSHeaders(response, request.headers.get("origin"));
  }

  const requests = await serviceRequestService.listByClient(session.user.id);
  const response = NextResponse.json(requests);
  return setCORSHeaders(response, request.headers.get("origin"));
}

export async function POST(request: NextRequest) {
  // Rate limiting: 20 solicitudes de servicio por hora
  const rateLimitCheck = checkRateLimit(request, 20, 60 * 60 * 1000);
  if (!rateLimitCheck.allowed && rateLimitCheck.response) {
    const response = setCORSHeaders(rateLimitCheck.response, request.headers.get("origin"));
    return response;
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const response = NextResponse.json({ message: "No autorizado" }, { status: 401 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }

  if (session.user.role !== "CLIENT") {
    const response = NextResponse.json({ message: "Solo clientes pueden crear solicitudes" }, { status: 403 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }

  try {
    const payload = await request.json();
    const data = createServiceRequestSchema.parse(payload);

    const serviceType = await serviceTypeRepository.listActive();
    const isValidType = serviceType.some((type) => type.id === data.serviceTypeId);
    if (!isValidType) {
      const response = NextResponse.json({ message: "Tipo de servicio inválido" }, { status: 400 });
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    const created = await serviceRequestService.create({
      clientId: session.user.id,
      serviceTypeId: data.serviceTypeId,
      description: data.description,
      address: data.address,
      scheduledAt: data.scheduledAt,
      price: data.price,
    });

    if (created.client?.email && created.serviceType?.name && created.caseNumber) {
      NotificationService.notifyServiceCreated({
        clientEmail: created.client.email,
        clientName: created.client.name,
        serviceName: created.serviceType.name,
        address: created.address,
        scheduledAt: created.scheduledAt.toLocaleString("es-CO", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "America/Bogota",
        }),
        caseNumber: created.caseNumber,
      }).catch((err) => console.error("Error sending service created notification:", err));
    }

    const response = NextResponse.json(created, { status: 201 });
    return setCORSHeaders(response, request.headers.get("origin"));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const first = error.issues[0];
      const response = NextResponse.json({ message: first?.message ?? "Datos inválidos" }, { status: 400 });
      return setCORSHeaders(response, request.headers.get("origin"));
    }
    const response = NextResponse.json({ message: "Error al crear solicitud" }, { status: 500 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }
}
