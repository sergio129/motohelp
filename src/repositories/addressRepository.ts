import { prisma } from "@/lib/prisma";

export const addressRepository = {
  listByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });
  },
  create(userId: string, data: {
    label?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    reference?: string;
  }) {
    return prisma.address.create({
      data: {
        userId,
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        reference: data.reference,
      },
    });
  },
  async setPrimary(userId: string, id: string) {
    return prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);
  },
};
