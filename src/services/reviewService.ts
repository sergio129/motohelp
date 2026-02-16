import { reviewRepository } from "@/repositories/reviewRepository";
import { serviceRequestRepository } from "@/repositories/serviceRequestRepository";

export const reviewService = {
  async create(serviceId: string, rating: number, comment?: string) {
    // Validar que el servicio existe y está FINALIZADO
    const service = await serviceRequestRepository.findById(serviceId);
    if (!service) {
      throw new Error("Servicio no encontrado");
    }
    if (service.status !== "FINALIZADO") {
      throw new Error("Solo puedes calificar servicios finalizados");
    }
    
    // Validar que no exista review previo
    const existing = await reviewRepository.findByService(serviceId);
    if (existing) {
      throw new Error("Este servicio ya tiene una calificación");
    }

    return reviewRepository.create(serviceId, rating, comment);
  },

  findByService(serviceId: string) {
    return reviewRepository.findByService(serviceId);
  },

  getMechanicStats(mechanicId: string) {
    return reviewRepository.getMechanicAverageRating(mechanicId);
  },

  getMechanicReviews(mechanicId: string) {
    return reviewRepository.getMechanicReviews(mechanicId);
  },
};
