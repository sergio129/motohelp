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
