import { reviewRepository } from "@/repositories/reviewRepository";

export const reviewService = {
  create(data: { serviceId: string; rating: number; comment?: string }) {
    return reviewRepository.create(data);
  },
  listByService(serviceId: string) {
    return reviewRepository.listByService(serviceId);
  },
};
