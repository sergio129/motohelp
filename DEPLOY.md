# Desplegar MotoHelp en Vercel

## Pasos de configuración

### 1. Preparar la base de datos PostgreSQL

Necesitas una base de datos PostgreSQL. Opciones recomendadas:
- **Vercel Postgres** (integración directa)
- **Neon** (https://neon.tech) - Gratis
- **Supabase** (https://supabase.com) - Gratis
- **Railway** (https://railway.app)

### 2. Variables de entorno en Vercel

Configura estas variables en: **Project Settings → Environment Variables**

```bash
# Database URL
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="https://tu-proyecto.vercel.app"
NEXTAUTH_SECRET="tu-secreto-generado-con-openssl-rand-base64-32"
```

### 3. Generar NEXTAUTH_SECRET

Ejecuta en tu terminal:
```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como `NEXTAUTH_SECRET`.

### 4. Ejecutar migraciones de Prisma

Después del primer despliegue, necesitas ejecutar las migraciones:

**Opción A: Usar Vercel CLI**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Opción B: Desde tu base de datos**
Ejecuta el SQL de las migraciones manualmente desde:
- `prisma/migrations/*/migration.sql`

### 5. (Opcional) Crear usuario administrador

Conéctate a tu base de datos y ejecuta:
```sql
-- Actualizar un usuario existente a admin
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';
```

## Scripts disponibles

- `npm run build` - Construir para producción
- `npm run dev` - Desarrollo local
- `npm run start` - Iniciar producción
- `postinstall` - Se ejecuta automáticamente (genera Prisma Client)

## Notas importantes

✅ El script `postinstall` ejecuta `prisma generate` automáticamente
✅ Las migraciones deben ejecutarse manualmente después del despliegue
✅ Asegúrate de que `DATABASE_URL` tenga `?sslmode=require` al final
