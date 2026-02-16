import { prisma } from "@/lib/prisma";

export const reviewRepository = {
  create(serviceId: string, rating: number, comment?: string) {
    return prisma.review.create({
      data: {
        serviceId,
        rating,
        comment: comment || undefined,
      },
    });
  },

  findByService(serviceId: string) {
    return prisma.review.findUnique({
      where: { serviceId },
    });
  },

  getMechanicAverageRating(mechanicId: string) {
    return prisma.review.aggregate({
      where: {
        service: {
          mechanicId,
          status: "FINALIZADO",
        },
      },
      _avg: { rating: true },
      _count: true,
    });
  },

  getMechanicReviews(mechanicId: string) {
    return prisma.review.findMany({
      where: {
        service: {
          mechanicId,
          status: "FINALIZADO",
        },
      },
      include: {
        service: {
          include: {
            client: {
              select: { name: true },
            },
            serviceType: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
