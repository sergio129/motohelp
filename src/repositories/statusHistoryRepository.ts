import { prisma } from "@/lib/prisma";
import { ServiceStatus } from "@prisma/client";

export const statusHistoryRepository = {
  create(serviceId: string, previousStatus: ServiceStatus, newStatus: ServiceStatus) {
    return prisma.statusHistory.create({
      data: {
        serviceId,
        previousStatus,
        newStatus,
      },
    });
  },

  getHistory(serviceId: string) {
    return prisma.statusHistory.findMany({
      where: { serviceId },
      orderBy: { changedAt: "asc" },
    });
  },
};
