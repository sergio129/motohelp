import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Total de solicitudes completadas
    const totalRequests = await prisma.serviceRequest.count({
      where: { status: "FINALIZADO" },
    });

    // Total de mecánicos verificados
    const totalMechanics = await prisma.mechanicProfile.count({
      where: { verified: true },
    });

    // Rating promedio de todas las reseñas
    const reviews = await prisma.review.findMany({
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "4.8";

    // Los 3 testimonios más recientes con reseñas
    const testimonials = await prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        service: {
          include: {
            client: true,
            mechanic: true,
            serviceType: true,
          },
        },
      },
    });

    const formattedTestimonials = testimonials.map((review) => ({
      name: review.service?.client?.name || "Cliente Anónimo",
      role: "Cliente",
      comment: review.comment,
      rating: review.rating,
      service: review.service?.serviceType?.name || "Servicio de motos",
    }));

    return NextResponse.json({
      totalRequests,
      totalMechanics,
      averageRating,
      testimonials: formattedTestimonials,
    });
  } catch (error) {
    console.error("Error fetching landing stats:", error);
    return NextResponse.json(
      {
        totalRequests: 0,
        totalMechanics: 0,
        averageRating: "4.8",
        testimonials: [],
      },
      { status: 200 }
    );
  }
}
