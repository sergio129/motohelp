import { prisma } from "@/lib/prisma";

type ServiceStatus =
  | "PENDIENTE"
  | "ACEPTADO"
  | "EN_CAMINO"
  | "EN_PROCESO"
  | "FINALIZADO"
  | "CANCELADO";

export const serviceRequestRepository = {
  listByClient(clientId: string) {
    return prisma.serviceRequest.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: { mechanic: true, review: true, serviceType: true },
    });
  },

  listAvailable(serviceTypeIds?: string[]) {
    return prisma.serviceRequest.findMany({
      where: {
        status: "PENDIENTE",
        mechanicId: null,
        serviceTypeId: serviceTypeIds?.length ? { in: serviceTypeIds } : undefined,
      },
      orderBy: { createdAt: "desc" },
      include: { serviceType: true },
    });
  },

  listAssignedToMechanic(mechanicId: string) {
    return prisma.serviceRequest.findMany({
      where: { mechanicId },
      orderBy: { createdAt: "desc" },
      include: { client: true, review: true, serviceType: true },
    });
  },

  listAll() {
    return prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, mechanic: true, review: true, serviceType: true },
    });
  },

  findById(id: string) {
    return prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: {
          include: { addresses: true },
        },
        mechanic: {
          include: { mechanicProfile: true },
        },
        review: true,
        serviceType: true,
        statusHistory: { orderBy: { changedAt: "asc" } },
      },
    });
  },

  create(data: {
    clientId: string;
    serviceTypeId: string;
    description: string;
    address: string;
    scheduledAt: Date;
    price?: number;
  }) {
    return prisma.serviceRequest.create({
      data: {
        clientId: data.clientId,
        serviceTypeId: data.serviceTypeId,
        description: data.description,
        address: data.address,
        scheduledAt: data.scheduledAt,
        price: data.price,
      },
    });
  },

  updateStatus(id: string, status: ServiceStatus) {
    return prisma.serviceRequest.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        mechanic: {
          include: { mechanicProfile: true },
        },
        serviceType: true,
      },
    });
  },

  updateNotes(id: string, notes: string) {
    return prisma.serviceRequest.update({
      where: { id },
      data: { notes },
    });
  },

  assignMechanic(id: string, mechanicId: string) {
    return prisma.serviceRequest.update({
      where: { id },
      data: { mechanicId, status: "ACEPTADO" },
      include: {
        client: true,
        mechanic: {
          include: { mechanicProfile: true },
        },
        serviceType: true,
      },
    });
  },

  hasActiveMechanicService(mechanicId: string) {
    return prisma.serviceRequest.findFirst({
      where: {
        mechanicId,
        status: {
          in: ["ACEPTADO", "EN_CAMINO", "EN_PROCESO"],
        },
      },
    });
  },

  listFiltered(filter: {
    status?: ServiceStatus;
    serviceTypeId?: string;
    mechanicId?: string;
    clientId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.serviceRequest.findMany({
      where: {
        status: filter.status,
        serviceTypeId: filter.serviceTypeId,
        mechanicId: filter.mechanicId,
        clientId: filter.clientId,
        createdAt: {
          gte: filter.startDate,
          lte: filter.endDate,
        },
      },
      include: { client: true, mechanic: true, serviceType: true, review: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
