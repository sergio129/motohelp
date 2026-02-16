import { prisma } from "@/lib/prisma";

export const mechanicProfileRepository = {
  findByUserId(userId: string) {
    return prisma.mechanicProfile.findUnique({ where: { userId } });
  },
  upsert(data: {
    userId: string;
    experienceYears: number;
    specialty: string;
    documentUrl?: string | null;
  }) {
    return prisma.mechanicProfile.upsert({
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
