import { clientProfileRepository } from "@/repositories/clientProfileRepository";

export const clientProfileService = {
  getByUserId(userId: string) {
    return clientProfileRepository.getByUserId(userId);
  },
  async upsert(userId: string, data: {
    name: string;
    phone?: string;
    documentId?: string;
    motoBrand?: string;
    motoModel?: string;
    motoYear?: number;
    motoPlate?: string;
    motoColor?: string;
  }) {
    await clientProfileRepository.updateUser(userId, {
      name: data.name,
      phone: data.phone,
      documentId: data.documentId,
    });

    return clientProfileRepository.upsert(userId, {
      motoBrand: data.motoBrand,
      motoModel: data.motoModel,
      motoYear: data.motoYear,
      motoPlate: data.motoPlate,
      motoColor: data.motoColor,
    });
  },
};
