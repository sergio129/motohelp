import { serviceRequestRepository } from "@/repositories/serviceRequestRepository";
import { statusHistoryRepository } from "@/repositories/statusHistoryRepository";
import { Prisma } from "@prisma/client";

type ServiceStatus =
  | "PENDIENTE"
  | "ACEPTADO"
  | "EN_CAMINO"
  | "EN_PROCESO"
  | "FINALIZADO"
  | "CANCELADO";

function generateCaseNumber(date = new Date()): string {
  const yyyy = date.getFullYear().toString();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MH-${yyyy}${mm}${dd}-${random}`;
}

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

  findById(id: string) {
    return serviceRequestRepository.findById(id);
  },

  create(data: {
    clientId: string;
    serviceTypeId: string;
    description: string;
    address: string;
    scheduledAt: Date;
    price?: number;
  }) {
    return (async () => {
      for (let attempt = 1; attempt <= 5; attempt++) {
        const caseNumber = generateCaseNumber();
        try {
          return await serviceRequestRepository.create({
            ...data,
            caseNumber,
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002" &&
            attempt < 5
          ) {
            continue;
          }
          throw error;
        }
      }

      throw new Error("NO_CASE_NUMBER");
    })();
  },

  async updateNotes(id: string, notes: string, userId: string) {
    const request = await serviceRequestRepository.findById(id);
    if (!request) {
      throw new Error("NOT_FOUND");
    }
    if (request.mechanicId !== userId) {
      throw new Error("FORBIDDEN");
    }
    return serviceRequestRepository.updateNotes(id, notes);
  },

  async updateStatus(id: string, status: ServiceStatus) {
    const request = await serviceRequestRepository.findById(id);
    if (!request) {
      throw new Error("NOT_FOUND");
    }
    
    // Registrar cambio en historia
    await statusHistoryRepository.create(id, request.status, status);
    
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

    // VALIDACIÓN CRÍTICA: un servicio activo por mecánico
    const hasActive = await serviceRequestRepository.hasActiveMechanicService(mechanicId);
    if (hasActive) {
      throw new Error("El mecánico ya tiene un servicio en progreso");
    }

    const result = await serviceRequestRepository.assignMechanic(id, mechanicId);
    
    // Registrar en historia
    await statusHistoryRepository.create(id, "PENDIENTE", "ACEPTADO");
    
    return result;
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

    // No cambiar si ya fue finalizado o cancelado
    if (request.status === "FINALIZADO" && data.status !== "FINALIZADO") {
      throw new Error("INVALID_STATUS");
    }

    if (request.status === "CANCELADO" && data.status !== "CANCELADO") {
      throw new Error("INVALID_STATUS");
    }

    if (data.role === "ADMIN") {
      await statusHistoryRepository.create(data.id, request.status, data.status);
      return serviceRequestRepository.updateStatus(data.id, data.status);
    }

    if (data.role === "CLIENT") {
      if (request.clientId !== data.userId) {
        throw new Error("FORBIDDEN");
      }
      // Cliente solo puede cancelar si está PENDIENTE
      if (request.status !== "PENDIENTE" || data.status !== "CANCELADO") {
        throw new Error("INVALID_STATUS");
      }
      await statusHistoryRepository.create(data.id, request.status, data.status);
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

      await statusHistoryRepository.create(data.id, request.status, data.status);
      return serviceRequestRepository.updateStatus(data.id, data.status);
    }

    throw new Error("FORBIDDEN");
  },

  listFiltered(filter: {
    status?: ServiceStatus;
    serviceTypeId?: string;
    mechanicId?: string;
    clientId?: string;
  }) {
    return serviceRequestRepository.listFiltered(filter);
  },
};
