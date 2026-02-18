import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations/review";
import { reviewService } from "@/services/reviewService";
import { checkRateLimit } from "@/lib/rateLimit";
import { setCORSHeaders, handleCORSPreflight } from "@/lib/cors";
import { NotificationService } from "@/services/notificationService";
import { serviceRequestService } from "@/services/serviceRequestService";

export async function OPTIONS(request: NextRequest) {
  return handleCORSPreflight(request);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 10 reseñas por hora
  const rateLimitCheck = checkRateLimit(request, 10, 60 * 60 * 1000);
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
    const response = NextResponse.json({ message: "Solo clientes pueden calificar" }, { status: 403 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }

  try {
    const payload = await request.json();
    const { serviceId, rating, comment } = createReviewSchema.parse(payload);

    const review = await reviewService.create(serviceId, rating, comment);
    
    // Obtener información del servicio para notificar al mecánico
    const service = await serviceRequestService.findById(serviceId);
    if (service?.mechanic?.email && service.serviceType && session.user.name) {
      NotificationService.notifyRatingReceived({
        mechanicEmail: service.mechanic.email,
        mechanicName: service.mechanic.name,
        clientName: session.user.name,
        rating,
        comment: comment || undefined,
        serviceName: service.serviceType.name,
      }).catch(err => console.error("Error sending rating notification:", err));
    }

    const successResponse = NextResponse.json(review, { status: 201 });
    return setCORSHeaders(successResponse, request.headers.get("origin"));
  } catch (error: any) {
    if (error.message === "Servicio no encontrado") {
      const response = NextResponse.json({ message: error.message }, { status: 404 });
      return setCORSHeaders(response, request.headers.get("origin"));
    }
    if (error.message === "Solo puedes calificar servicios finalizados") {
      const response = NextResponse.json({ message: error.message }, { status: 400 });
      return setCORSHeaders(response, request.headers.get("origin"));
    }
    if (error.message === "Este servicio ya tiene una calificación") {
      const response = NextResponse.json({ message: error.message }, { status: 409 });
      return setCORSHeaders(response, request.headers.get("origin"));
    }
    const response = NextResponse.json({ message: "Error al crear calificación" }, { status: 500 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const response = NextResponse.json({ message: "No autorizado" }, { status: 401 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const mechanicId = searchParams.get("mechanicId");

  try {
    if (serviceId) {
      const review = await reviewService.findByService(serviceId);
      const response = NextResponse.json(review);
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    if (mechanicId) {
      const reviews = await reviewService.getMechanicReviews(mechanicId);
      const stats = await reviewService.getMechanicStats(mechanicId);
      const response = NextResponse.json({ reviews, stats });
      return setCORSHeaders(response, request.headers.get("origin"));
    }

    const response = NextResponse.json({ message: "Parámetros requeridos" }, { status: 400 });
    return setCORSHeaders(response, request.headers.get("origin"));
  } catch (error) {
    const response = NextResponse.json({ message: "Error al obtener reseñas" }, { status: 500 });
    return setCORSHeaders(response, request.headers.get("origin"));
  }
}
