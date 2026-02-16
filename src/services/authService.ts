import { hash } from "bcryptjs";
import { userRepository } from "@/repositories/userRepository";

type Role = "CLIENT" | "MECHANIC" | "ADMIN";

export const authService = {
  async registerUser(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    phone?: string;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hash(data.password, 10);
    const safeRole = data.role === "MECHANIC" ? "MECHANIC" : "CLIENT";

    return userRepository.create({
      ...data,
      password: passwordHash,
      role: safeRole,
    });
  },
};
