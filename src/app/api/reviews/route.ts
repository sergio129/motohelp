import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations/review";
import { reviewService } from "@/services/reviewService";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  
  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ message: "Solo clientes pueden calificar" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const { serviceId, rating, comment } = createReviewSchema.parse(payload);

    const review = await reviewService.create(serviceId, rating, comment);

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    if (error.message === "Servicio no encontrado") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error.message === "Solo puedes calificar servicios finalizados") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error.message === "Este servicio ya tiene una calificación") {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Error al crear calificación" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const mechanicId = searchParams.get("mechanicId");

  try {
    if (serviceId) {
      const review = await reviewService.findByService(serviceId);
      return NextResponse.json(review);
    }

    if (mechanicId) {
      const reviews = await reviewService.getMechanicReviews(mechanicId);
      const stats = await reviewService.getMechanicStats(mechanicId);
      return NextResponse.json({ reviews, stats });
    }

    return NextResponse.json({ message: "Parámetros requeridos" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener reseñas" }, { status: 500 });
  }
}
