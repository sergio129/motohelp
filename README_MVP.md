# 🏍️ MotoHelp - MVP Completo

Sistema de gestión integral de solicitudes de servicio de motos, conectando clientes con mecánicos verificados.

## 🎯 Características Principales

### Para Clientes
- ✅ Crear solicitudes de servicio
- ✅ Ver historial de servicios
- ✅ Calificar mecánicos (1-5 ⭐)
- ✅ Ver detalles completos del servicio
- ✅ Gestionar direcciones múltiples
- ✅ Ver contacto del mecánico asignado
- ✅ Recibir notas del mecánico sobre el trabajo

### Para Mecánicos
- ✅ Ver solicitudes disponibles
- ✅ Aceptar servicios (máximo 1 activo)
- ✅ Cambiar estado: En camino → En proceso → Finalizado
- ✅ Agregar notas sobre el trabajo
- ✅ Ver historial de trabajos
- ✅ Recibir calificaciones de clientes
- ✅ Gestionar servicios especializados

### Para Administrador
- ✅ Acceso total a todas las solicitudes
- ✅ Gestionar tipos de servicio
- ✅ Gestionar mecánicos verificados
- ✅ Ver métricas y estadísticas

---

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar o descargar el proyecto
cd MotoHelp

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### 2. Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb motohelp

# Configurar DATABASE_URL en .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/motohelp"

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Llenar datos de prueba
node prisma/seed.js
```

### 3. Iniciar Servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/                    # Next.js API Routes
│   │   ├── auth/               # Autenticación
│   │   ├── service-requests/   # CRUD solicitudes
│   │   ├── reviews/            # Sistema de calificaciones
│   │   ├── profile/            # Perfiles de usuario
│   │   └── admin/              # Endpoints admin
│   │
│   ├── dashboard/
│   │   ├── client/             # Panel del cliente
│   │   ├── mechanic/           # Panel del mecánico
│   │   └── admin/              # Panel del admin
│   │
│   ├── auth/
│   │   ├── sign-in/            # Login page
│   │   └── sign-up/            # Registro page
│   │
│   ├── globals.css             # Estilos globales
│   └── layout.tsx              # Layout principal
│
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── RatingComponent.tsx     # Componente de calificación
│   └── ...
│
├── lib/
│   ├── auth.ts                 # Configuración NextAuth
│   ├── fetcher.ts              # Cliente SWR
│   ├── prisma.ts               # Cliente Prisma singleton
│   ├── utils.ts                # Utilidades
│   └── validations/            # Esquemas Zod
│
├── services/                   # Lógica de negocio
│   ├── authService.ts
│   ├── clientProfileService.ts
│   ├── mechanicProfileService.ts
│   ├── serviceRequestService.ts
│   ├── reviewService.ts
│   └── ...
│
├── repositories/               # Capa de datos
│   ├── userRepository.ts
│   ├── serviceRequestRepository.ts
│   ├── reviewRepository.ts
│   ├── statusHistoryRepository.ts
│   └── ...
│
└── types/
    ├── next-auth.d.ts          # Tipos de sesión
    └── ...

prisma/
├── schema.prisma               # Esquema de BD
├── seed.js                     # Datos iniciales
└── migrations/                 # Historial de cambios
```

---

## 🔄 Flujo Principal

### 1️⃣ Cliente Crea Solicitud
```
Cliente → Inicia sesión → Dashboard → "Nueva solicitud"
         → Selecciona tipo servicio, descripción, dirección
         → Estado: PENDIENTE
```

### 2️⃣ Mecánico Busca Trabajo
```
Mecánico → Inicia sesión → Ve solicitudes disponibles
         → Solicitudes que coincidan con sus servicios
         → Estado actual: PENDIENTE
```

### 3️⃣ Mecánico Acepta Solicitud
```
Mecánico → Click "Aceptar"
         → Validación: Máximo 1 activo
         → Si tiene activo: Error 409 "Ya tienes un servicio en progreso"
         → Si OK: Estado → ACEPTADO
         → Registro automático en StatusHistory
```

### 4️⃣ Progreso del Servicio
```
Aceptado → En camino → En proceso → Finalizado
```
El mecánico actualiza el estado en el dashboard. El cliente ve cambios en tiempo real.

### 5️⃣ Cliente Califica
```
Después de FINALIZADO:
Cliente → Ve el servicio en historial
        → Componente RatingComponent aparece
        → Selecciona estrellas (1-5) + comentario
        → POST /api/reviews
        → Calificación guardada
```

### 6️⃣ Mecánico Ve Calificación
```
Mecánico → En su historial de servicios
         → Ve rating y comentarios del cliente
         → Estadísticas: Rating promedio actualizado
```

---

## 📊 Endpoints API

### Autenticación
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/[...nextauth]` - NextAuth (login/logout)

### Solicitudes de Servicio
- `GET /api/service-requests` - Listar (filtrado por rol)
- `GET /api/service-requests/[id]` - Detalles completos
- `POST /api/service-requests` - Crear (cliente)
- `PATCH /api/service-requests/[id]` - Actualizar estado/notas

### Calificaciones
- `POST /api/reviews` - Crear calificación
- `GET /api/reviews?serviceId=X` - Obtener by servicio
- `GET /api/reviews?mechanicId=X` - Obtener by mecánico

### Perfiles
- `GET /api/profile/client` - Perfil de cliente
- `GET /api/profile/mechanic` - Perfil de mecánico
- `PATCH /api/profile/*` - Actualizar perfil

### Direcciones
- `GET /api/addresses` - Listar direcciones del usuario
- `POST /api/addresses` - Crear dirección
- `PATCH /api/addresses/[id]` - Actualizar/hacer primaria

### Admin
- `GET /api/admin/service-types` - Tipos de servicio
- `POST /api/admin/service-types` - Crear tipo
- `GET /api/admin/mechanics` - Listar mecánicos

---

## 🛡️ Validaciones Críticas

### 1. Un Servicio Activo por Mecánico
```typescript
// Si mecánico tiene servicio en estados activos:
// ACEPTADO, EN_CAMINO, EN_PROCESO
// No puede aceptar otro
// Error: 409 Conflict
```

### 2. Calificar Solo FINALIZADO
```typescript
// Solo se puede calificar si:
// - Servicio status = "FINALIZADO"
// - No existe Review previo para ese servicio
```

### 3. Rol-Based Access
```typescript
// Cliente: Solo ve sus propias solicitudes
// Mecánico: Solo acepta sus servicios, actualiza su progreso
// Admin: Acceso total
```

### 4. No Cambiar Estados Finales
```typescript
// Si FINALIZADO o CANCELADO, no se puede cambiar
```

---

## 🎨 Tema Visual

### Colores
- **Primario**: Naranja (#FA7F1E)
- **Secundario**: Rojo (#EF4444)
- **Fondo**: Slate-950 (casi negro)
- **Texto**: Blanco/Slate-200

### Componentes
- Glassmorphism: Fondos semi-transparentes con blur
- Hologramas: SVG de motos en fondo
- Responsive: Mobile-first design
- Rounded: Bordes medianos (rounded-lg a rounded-2xl)

---

## 🧪 Testing

### Crear Cuentas de Prueba

1. **Cliente**
   - Email: `cliente@test.com`
   - Password: `Test123!`
   - Crear solicitud → Ver historial → Calificar

2. **Mecánico**
   - Email: `mecanico@test.com`
   - Password: `Test123!`
   - Seleccionar servicios → Buscar solicitudes → Aceptar

3. **Admin**
   - En BD, cambiar rol a ADMIN
   - Acceso a todas las solicitudes

### Flows a Probar

- [ ] Cliente crea solicitud exitosamente
- [ ] Mecánico ve solicitud disponible
- [ ] Mecánico acepta (sin otro activo)
- [ ] Estado cambia PENDIENTE → ACEPTADO
- [ ] No puede aceptar otro servicio
- [ ] Cliente ve detalles del mecánico
- [ ] Mecánico actualiza a FINALIZADO
- [ ] Cliente califica (aparece RatingComponent)
- [ ] Calificación se guarda
- [ ] Mecánico ve calificación

---

## 🐛 Troubleshooting

### Error: Prisma Client no generado
```bash
npx prisma generate
```

### Error: Database connection
- Verificar `DATABASE_URL` en `.env.local`
- PostgreSQL debe estar corriendo
- Base de datos debe existir

### Error: NextAuth session undefined
- Verificar `NEXTAUTH_SECRET` en `.env.local`
- Limpiar cookies del navegador
- Reiniciar servidor

### Build fallido TypeScript
```bash
npm run build -- --verbose
# Buscar errores específicos
```

---

## 📦 Dependencias Principales

```json
{
  "next": "16.1.6",
  "react": "19",
  "next-auth": "5",
  "prisma": "5.22",
  "swr": "2.2",
  "zod": "3.24",
  "tailwind": "4",
  "shadcn-ui": "latest"
}
```

---

## 📝 Notas de Desarrollo

### Convenciones
- **Rutas de API**: Plural (`/api/service-requests`, no `/api/service-request`)
- **Métodos**: GET (lectura), POST (crear), PATCH (actualizar parcial)
- **Errores**: Códigos HTTP estándar (400, 403, 404, 409, 500)
- **Tipos**: TypeScript en todo excepto config files

### Patrón arquitectura
```
Request → API Route → Service (lógica negocio) → Repository (BD)
         ↓ Validación Zod
Response ← Service responde
```

### Tips de Debugging
- Abrir DevTools → Network → Ver respuestas API
- Console → Logs de SWR y fetches
- Prisma Studio: `npx prisma studio` (UI para BD)

---

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Conectar repo a Vercel
# Vercel configura automáticamente:
# - Build: npm run build
# - Start: npm run start
# - Env vars desde archivo .env.local

# Push a main branch
git push origin main
```

### Variables de entorno en Vercel
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=tu-secret-muy-seguro
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

---

## 📞 Contacto / Soporte

Para preguntas o issues:
- Revisar documentación en `MVP_STATUS.md`
- Checklist de features pendientes en `QUICK_WINS.md`
- Revisar logs en `npm run dev`

---

**Estado**: ✅ MVP Completo y Compilando  
**Última actualización**: Sesión actual  
**Próxima fase**: UI Polish + Notificaciones

