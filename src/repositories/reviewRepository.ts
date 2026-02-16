import { prisma } from "@/lib/prisma";

export const reviewRepository = {
  create(data: { serviceId: string; rating: number; comment?: string }) {
    return prisma.review.create({ data });
  },
  listByService(serviceId: string) {
    return prisma.review.findMany({ where: { serviceId } });
  },
};
