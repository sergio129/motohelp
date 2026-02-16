import { prisma } from "@/lib/prisma";

export const clientProfileRepository = {
  getByUserId(userId: string) {
    return prisma.clientProfile.findUnique({ where: { userId } });
  },
  upsert(userId: string, data: {
    motoBrand?: string;
    motoModel?: string;
    motoYear?: number;
    motoPlate?: string;
    motoColor?: string;
  }) {
    return prisma.clientProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },
  updateUser(userId: string, data: { name: string; phone?: string; documentId?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone ?? null,
        documentId: data.documentId ?? null,
      },
    });
  },
};
