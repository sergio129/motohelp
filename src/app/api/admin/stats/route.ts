import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    // Total de servicios por estado
    const servicesByStatus = await prisma.serviceRequest.groupBy({
      by: ["status"],
      _count: true,
    });

    // Servicios completados
    const completedCount = servicesByStatus.find((s) => s.status === "FINALIZADO")?._count || 0;

    // Promedio de calificaciones
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
      _count: true,
    });

    // Total de mecánicos verificados
    const verifiedMechanicsCount = await prisma.mechanicProfile.count({
      where: { verified: true },
    });

    // Servicios pendientes
    const pendingCount = servicesByStatus.find((s) => s.status === "PENDIENTE")?._count || 0;

    // Total de servicios
    const totalServices = servicesByStatus.reduce((sum, s) => sum + s._count, 0);

    return NextResponse.json({
      totalServices,
      completedServices: completedCount,
      pendingServices: pendingCount,
      canceledServices: servicesByStatus.find((s) => s.status === "CANCELADO")?._count || 0,
      averageRating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(2)) : 0,
      totalReviews: avgRating._count,
      verifiedMechanics: verifiedMechanicsCount,
      servicesByStatus: servicesByStatus.map((s) => ({ status: s.status, count: s._count })),
    });
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener estadísticas" }, { status: 500 });
  }
}
