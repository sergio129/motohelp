import { prisma } from "@/lib/prisma";

type Role = "CLIENT" | "MECHANIC" | "ADMIN";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  list() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  },
  create(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    phone?: string;
  }) {
    return prisma.user.create({ data });
  },
};
