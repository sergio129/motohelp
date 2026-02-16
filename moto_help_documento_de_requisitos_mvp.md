# 🏍️ MotoHelp
## Documento de Requisitos Funcionales y Técnicos – MVP

---

# 1. Descripción General del Proyecto

**MotoHelp** es una plataforma web que conecta clientes que necesitan servicios mecánicos para motocicletas a domicilio con mecánicos verificados en su zona.

El objetivo del MVP (Producto Mínimo Viable) es validar el modelo de negocio permitiendo:

- Registro y autenticación de usuarios
- Solicitud de servicios mecánicos
- Asignación de mecánicos
- Gestión de estados del servicio
- Cierre y calificación

---

# 2. Alcance del MVP

El MVP incluirá:

- Plataforma web responsive
- Panel para clientes
- Panel para mecánicos
- Panel administrativo básico
- Gestión de servicios
- Sistema de roles

No incluirá inicialmente:

- App móvil nativa
- Pagos en línea automatizados
- Geolocalización en tiempo real
- Chat en tiempo real

---

# 3. Tipos de Usuario y Permisos

## 3.1 Cliente

Permisos:
- Registrarse
- Iniciar sesión
- Editar perfil
- Crear solicitudes de servicio
- Ver historial de servicios
- Calificar servicios

Restricciones:
- No puede ver datos privados de otros usuarios
- No puede modificar estados del servicio

---

## 3.2 Mecánico

Permisos:
- Registrarse
- Completar perfil profesional
- Subir documentación
- Ver solicitudes disponibles
- Aceptar solicitudes
- Cambiar estado del servicio
- Ver historial de trabajos

Restricciones:
- No puede aceptar más de un servicio activo
- No puede modificar precios finales sin autorización

---

## 3.3 Administrador

Permisos:
- Ver todos los usuarios
- Aprobar o rechazar mecánicos
- Ver todos los servicios
- Cambiar estados manualmente
- Editar precios base
- Ver métricas generales

---

# 4. Requisitos Funcionales

## 4.1 Autenticación

- Registro con email y contraseña
- Login seguro
- Recuperación de contraseña
- Roles diferenciados (CLIENT | MECHANIC | ADMIN)
- Protección de rutas según rol

---

## 4.2 Gestión de Perfil

### Cliente
- Nombre completo
- Teléfono
- Dirección principal

### Mecánico
- Nombre completo
- Documento de identidad
- Teléfono
- Años de experiencia
- Especialidad
- Documento adjunto (PDF o imagen)
- Estado de verificación

---

## 4.3 Solicitud de Servicio

Campos obligatorios:
- Tipo de servicio (lista predefinida)
- Descripción del problema
- Dirección del servicio
- Fecha y hora deseada

Campos opcionales:
- Imagen del problema
- Comentarios adicionales

Estados del servicio:
- PENDIENTE
- ACEPTADO
- EN_CAMINO
- EN_PROCESO
- FINALIZADO
- CANCELADO

Reglas:
- Solo puede haber un mecánico asignado
- El cliente puede cancelar si está en estado PENDIENTE
- El mecánico puede cancelar antes de EN_PROCESO

---

## 4.4 Flujo del Servicio

1. Cliente crea solicitud (PENDIENTE)
2. Mecánico acepta (ACEPTADO)
3. Mecánico cambia a EN_CAMINO
4. Mecánico cambia a EN_PROCESO
5. Mecánico finaliza (FINALIZADO)
6. Cliente califica

---

## 4.5 Sistema de Calificaciones

- Calificación de 1 a 5 estrellas
- Comentario opcional
- Solo puede calificar si el servicio está FINALIZADO
- Solo una calificación por servicio

---

# 5. Requisitos No Funcionales

## 5.1 Seguridad

- Contraseñas encriptadas
- Validación de datos en backend
- Protección CSRF
- Middleware de autorización por rol

## 5.2 Rendimiento

- Tiempo de carga menor a 3 segundos
- Paginación en listas largas

## 5.3 Escalabilidad

- Arquitectura modular
- Separación de lógica de negocio
- Preparado para migración futura a microservicios

## 5.4 Usabilidad

- Interfaz responsive
- Navegación simple
- Formularios claros

---

# 6. Requisitos Técnicos

## 6.1 Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- Componentes reutilizables
- Manejo de estado con React Hooks
- Data fetching con SWR

---

## 6.2 Backend

- API Routes de Next.js
- Validación con Zod
- ORM Prisma
- Arquitectura por capas (routes, services, repositories)

---

## 6.3 Base de Datos (PostgreSQL)

Entidades principales:

### User
- id
- name
- email
- password
- role
- phone
- createdAt

### MechanicProfile
- id
- userId
- verified
- experienceYears
- documentUrl

### ServiceRequest
- id
- clientId
- mechanicId
- type
- description
- address
- status
- price
- createdAt

### Review
- id
- serviceId
- rating
- comment

---

# 6.4 Arquitectura del Sistema Propuesta

La arquitectura oficial del MVP será la siguiente:

### 🏗️ Stack Tecnológico

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL
- **Autenticación:** NextAuth.js
- **UI Components:** Radix UI + shadcn/ui
- **Charts y métricas:** Chart.js + Recharts
- **State Management:** SWR + React Hooks

---

## 6.4.1 Arquitectura Lógica

Se utilizará una arquitectura modular por capas dentro del mismo proyecto Next.js:

```
src/
 ├── app/ (rutas y páginas)
 ├── components/ (componentes UI reutilizables)
 ├── lib/
 │    ├── prisma.ts
 │    ├── auth.ts
 │    └── validations/
 ├── services/ (lógica de negocio)
 ├── repositories/ (acceso a base de datos)
 ├── hooks/ (custom hooks)
 └── types/ (tipos TypeScript)
```

Separación de responsabilidades:

- **API Routes:** reciben request y validan datos
- **Services:** contienen lógica de negocio
- **Repositories:** interactúan con Prisma
- **Frontend:** consume API mediante SWR

---

## 6.4.2 Flujo Técnico de una Solicitud

1. Cliente envía formulario desde el frontend
2. SWR envía request a API Route
3. API valida datos con Zod
4. Service ejecuta lógica de negocio
5. Repository guarda en PostgreSQL vía Prisma
6. Respuesta JSON al frontend
7. UI se actualiza automáticamente

---

## 6.4.3 Seguridad y Control de Acceso

- NextAuth.js gestionará sesiones
- Middleware para protección por rol
- JWT o sesiones seguras
- Validaciones backend obligatorias

---

## 6.4.4 Escalabilidad Futura

La arquitectura permite:

- Migrar backend a microservicios
- Separar frontend en app independiente
- Implementar WebSockets para tiempo real
- Integrar pasarelas de pago

---

# 7. Reglas de Negocio

- Comisión por servicio (configurable)
- Solo mecánicos verificados pueden aceptar servicios
- Un servicio activo por mecánico
- Historial permanente de servicios

---

# 8. Métricas Iniciales del Sistema

- Número total de usuarios
- Número total de mecánicos
- Servicios completados
- Ingresos generados
- Calificación promedio

---

# 9. Roadmap de Desarrollo

Fase 1:
- Autenticación
- CRUD de servicios
- Panel básico

Fase 2:
- Pagos online
- Notificaciones
- Geolocalización

Fase 3:
- Aplicación móvil
- Planes de suscripción
- Chat en tiempo real

---

# 10. Objetivo del MVP

Validar que:

- Existe demanda real
- Los mecánicos están dispuestos a pagar comisión
- Los clientes valoran el servicio a domicilio

El éxito del MVP se medirá por:
- 50+ servicios completados
- 10+ mecánicos activos
- Calificación promedio mayor a 4 estrellas

---

Documento versión 1.0
Proyecto: MotoHelp
Estado: En planificación

