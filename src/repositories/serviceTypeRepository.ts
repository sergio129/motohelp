import { prisma } from "@/lib/prisma";

export const serviceTypeRepository = {
  listActive() {
    return prisma.serviceType.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  },
  listAll() {
    return prisma.serviceType.findMany({ orderBy: { createdAt: "desc" } });
  },
  create(data: { name: string; description?: string | null }) {
    return prisma.serviceType.create({ data });
  },
  update(id: string, data: { name?: string; description?: string | null; active?: boolean }) {
    return prisma.serviceType.update({ where: { id }, data });
  },
};
