import { prisma } from "@/lib/prisma";

export const serviceTypeRepository = {
  listActive() {
    return prisma.serviceType.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { name: "asc" }] });
  },
  listAll() {
    return prisma.serviceType.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  },
  create(data: { name: string; category: string; description?: string | null }) {
    return prisma.serviceType.create({ data });
  },
  update(id: string, data: { name?: string; category?: string; description?: string | null; active?: boolean }) {
    return prisma.serviceType.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.serviceType.delete({ where: { id } });
  },
};
