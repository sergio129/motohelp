import { mechanicProfileRepository } from "@/repositories/mechanicProfileRepository";
import { prisma } from "@/lib/prisma";

export const mechanicProfileService = {
  getByUserId(userId: string) {
    return mechanicProfileRepository.findByUserId(userId);
  },
  
  async upsert(data: {
    userId: string;
    experienceYears: number;
    specialty: string;
    documentUrl?: string | null;
    serviceTypeIds: string[];
  }) {
    // Verificar que el usuario no está activo en solicitudes de cliente
    const activeClientRequests = await prisma.serviceRequest.findFirst({
      where: {
        clientId: data.userId,
        status: { in: ["PENDIENTE", "ACEPTADO", "EN_CAMINO", "EN_PROCESO"] }
      }
    });
    
    if (activeClientRequests) {
      throw new Error("No puedes ser mecánico mientras tienes solicitudes activas como cliente");
    }
    
    // Cambiar rol a MECHANIC y validar que no sea administrator
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    
    if (user.role === "ADMIN") {
      throw new Error("Los administradores no pueden ser mecánicos");
    }
    
    // Actualizar rol a MECHANIC en transacción
    const profile = await prisma.$transaction(async (tx) => {
      // Cambiar rol
      await tx.user.update({
        where: { id: data.userId },
        data: { role: "MECHANIC" }
      });
      
      // Crear/actualizar profile
      return mechanicProfileRepository.upsert(data);
    });
    
    return profile;
  },
  
  verify(userId: string, verified: boolean) {
    return mechanicProfileRepository.verify(userId, verified);
  },
  
  listWithUsers() {
    return mechanicProfileRepository.listWithUsers();
  },
};
