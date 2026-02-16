import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations/review";
import { serviceRequestRepository } from "@/repositories/serviceRequestRepository";
import { reviewService } from "@/services/reviewService";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json();
  const data = createReviewSchema.parse(payload);

  const service = await serviceRequestRepository.findById(data.serviceId);
  if (!service) {
    return NextResponse.json({ message: "Servicio no encontrado" }, { status: 404 });
  }
  if (service.clientId !== session.user.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }
  if (service.status !== "FINALIZADO") {
    return NextResponse.json({ message: "Solo puedes calificar servicios finalizados" }, { status: 400 });
  }
  if (service.review) {
    return NextResponse.json({ message: "El servicio ya fue calificado" }, { status: 409 });
  }

  const review = await reviewService.create(data);

  return NextResponse.json(review, { status: 201 });
}
