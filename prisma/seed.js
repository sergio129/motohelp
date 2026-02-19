const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || "admin@motohelp.local";
  const password = process.env.ADMIN_SEED_PASSWORD || "Admin0129!";

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Administrador",
      password: hash,
      role: "ADMIN",
    },
    create: {
      name: "Administrador",
      email,
      password: hash,
      role: "ADMIN",
    },
  });

  const serviceTypes = [
    { name: "Cambio de aceite", category: "MANTENIMIENTO_PREVENTIVO", description: "Cambio de aceite y filtro" },
    { name: "Diagnóstico eléctrico", category: "MANTENIMIENTO_PREVENTIVO", description: "Revisión del sistema eléctrico" },
    { name: "Pinchazo / Llantas", category: "EMERGENCIAS", description: "Reparación o cambio de llanta" },
    { name: "Batería", category: "EMERGENCIAS", description: "Carga o reemplazo de batería" },
    { name: "Frenos", category: "REPARACIONES", description: "Mantenimiento y ajuste de frenos" },
  ];

  for (const service of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { name: service.name },
      update: { category: service.category, description: service.description, active: true },
      create: { ...service, active: true },
    });
  }

  console.log(`Admin listo: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
