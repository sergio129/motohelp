import { mechanicProfileRepository } from "@/repositories/mechanicProfileRepository";

export const mechanicProfileService = {
  getByUserId(userId: string) {
    return mechanicProfileRepository.findByUserId(userId);
  },
  upsert(data: {
    userId: string;
    experienceYears: number;
    specialty: string;
    documentUrl?: string | null;
  }) {
    return mechanicProfileRepository.upsert(data);
  },
  verify(userId: string, verified: boolean) {
    return mechanicProfileRepository.verify(userId, verified);
  },
  listWithUsers() {
    return mechanicProfileRepository.listWithUsers();
  },
};
