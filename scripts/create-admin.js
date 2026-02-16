/**
 * Script para crear usuario administrador en producción
 * Uso: node scripts/create-admin.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL || "admin@motohelp.local";
  const password = process.env.ADMIN_SEED_PASSWORD || "Admin0129!";
  const name = "Administrador";

  try {
    // Verificar si ya existe
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`❌ El usuario ${email} ya existe.`);
      
      // Preguntar si desea actualizar a ADMIN
      if (existing.role !== "ADMIN") {
        await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" },
        });
        console.log(`✅ Usuario ${email} actualizado a rol ADMIN`);
      }
      
      return;
    }

    // Generar hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear administrador
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    console.log("✅ Usuario administrador creado exitosamente:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rol: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`\n🔑 Contraseña: ${password}`);
    console.log("\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login");
  } catch (error) {
    console.error("❌ Error al crear administrador:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
