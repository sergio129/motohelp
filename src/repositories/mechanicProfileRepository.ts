import { prisma } from "@/lib/prisma";

export const mechanicProfileRepository = {
  findByUserId(userId: string) {
    return prisma.mechanicProfile.findUnique({
      where: { userId },
      include: { services: { include: { serviceType: true } } },
    });
  },
  upsert(data: {
    userId: string;
    experienceYears: number;
    specialty: string;
    documentUrl?: string | null;
    serviceTypeIds: string[];
  }) {
    return prisma.$transaction(async (tx) => {
      const profile = await tx.mechanicProfile.upsert({
        where: { userId: data.userId },
        update: {
          experienceYears: data.experienceYears,
          specialty: data.specialty,
          documentUrl: data.documentUrl ?? undefined,
        },
        create: {
          userId: data.userId,
          experienceYears: data.experienceYears,
          specialty: data.specialty,
          documentUrl: data.documentUrl ?? undefined,
        },
      });

      await tx.mechanicService.deleteMany({
        where: { mechanicProfileId: profile.id },
      });

      if (data.serviceTypeIds.length) {
        await tx.mechanicService.createMany({
          data: data.serviceTypeIds.map((serviceTypeId) => ({
            mechanicProfileId: profile.id,
            serviceTypeId,
          })),
          skipDuplicates: true,
        });
      }

      return profile;
    });
  },
  verify(userId: string, verified: boolean) {
    return prisma.mechanicProfile.update({
      where: { userId },
      data: { verified },
    });
  },
  listWithUsers() {
    return prisma.mechanicProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
