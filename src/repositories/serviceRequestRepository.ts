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
      include: { mechanic: true, review: true },
    });
  },
  listAvailable() {
    return prisma.serviceRequest.findMany({
      where: { status: "PENDIENTE", mechanicId: null },
      orderBy: { createdAt: "desc" },
    });
  },
  listAssignedToMechanic(mechanicId: string) {
    return prisma.serviceRequest.findMany({
      where: { mechanicId },
      orderBy: { createdAt: "desc" },
      include: { client: true, review: true },
    });
  },
  listAll() {
    return prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, mechanic: true, review: true },
    });
  },
  findById(id: string) {
    return prisma.serviceRequest.findUnique({
      where: { id },
      include: { client: true, mechanic: true, review: true },
    });
  },
  create(data: {
    clientId: string;
    type: string;
    description: string;
    address: string;
    scheduledAt: Date;
    price?: number;
  }) {
    return prisma.serviceRequest.create({
      data: {
        clientId: data.clientId,
        type: data.type,
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
    });
  },
  assignMechanic(id: string, mechanicId: string) {
    return prisma.serviceRequest.update({
      where: { id },
      data: { mechanicId, status: "ACEPTADO" },
    });
  },
};
