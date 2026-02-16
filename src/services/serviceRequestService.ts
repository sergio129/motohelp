import { serviceRequestRepository } from "@/repositories/serviceRequestRepository";

type ServiceStatus =
  | "PENDIENTE"
  | "ACEPTADO"
  | "EN_CAMINO"
  | "EN_PROCESO"
  | "FINALIZADO"
  | "CANCELADO";

export const serviceRequestService = {
  listByClient(clientId: string) {
    return serviceRequestRepository.listByClient(clientId);
  },
  listAssignedToMechanic(mechanicId: string) {
    return serviceRequestRepository.listAssignedToMechanic(mechanicId);
  },
  listAll() {
    return serviceRequestRepository.listAll();
  },
  listAvailable(serviceTypeIds?: string[]) {
    return serviceRequestRepository.listAvailable(serviceTypeIds);
  },
  create(data: {
    clientId: string;
    serviceTypeId: string;
    description: string;
    address: string;
    scheduledAt: Date;
    price?: number;
  }) {
    return serviceRequestRepository.create(data);
  },
  updateStatus(id: string, status: ServiceStatus) {
    return serviceRequestRepository.updateStatus(id, status);
  },
  async assignMechanic(id: string, mechanicId: string) {
    const request = await serviceRequestRepository.findById(id);
    if (!request) {
      throw new Error("NOT_FOUND");
    }
    if (request.status !== "PENDIENTE" || request.mechanicId) {
      throw new Error("INVALID_STATUS");
    }
    return serviceRequestRepository.assignMechanic(id, mechanicId);
  },
  async updateStatusForRole(data: {
    id: string;
    status: ServiceStatus;
    role: "CLIENT" | "MECHANIC" | "ADMIN";
    userId: string;
  }) {
    const request = await serviceRequestRepository.findById(data.id);
    if (!request) {
      throw new Error("NOT_FOUND");
    }

    if (request.status === "FINALIZADO" && data.status !== "FINALIZADO") {
      throw new Error("INVALID_STATUS");
    }

    if (request.status === "CANCELADO" && data.status !== "CANCELADO") {
      throw new Error("INVALID_STATUS");
    }

    if (data.role === "ADMIN") {
      return serviceRequestRepository.updateStatus(data.id, data.status);
    }

    if (data.role === "CLIENT") {
      if (request.clientId !== data.userId) {
        throw new Error("FORBIDDEN");
      }
      if (request.status !== "PENDIENTE" || data.status !== "CANCELADO") {
        throw new Error("INVALID_STATUS");
      }
      return serviceRequestRepository.updateStatus(data.id, data.status);
    }

    if (data.role === "MECHANIC") {
      if (request.mechanicId !== data.userId) {
        throw new Error("FORBIDDEN");
      }

      const allowed: Record<ServiceStatus, ServiceStatus[]> = {
        PENDIENTE: [],
        ACEPTADO: ["EN_CAMINO", "CANCELADO"],
        EN_CAMINO: ["EN_PROCESO", "CANCELADO"],
        EN_PROCESO: ["FINALIZADO"],
        FINALIZADO: [],
        CANCELADO: [],
      };

      const currentStatus = request.status as ServiceStatus;
      if (!allowed[currentStatus].includes(data.status)) {
        throw new Error("INVALID_STATUS");
      }

      return serviceRequestRepository.updateStatus(data.id, data.status);
    }

    throw new Error("FORBIDDEN");
  },
};
