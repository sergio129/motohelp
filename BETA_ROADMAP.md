# 🚀 MotoHelp - Roadmap para Lanzamiento Beta

> **Fecha de creación:** 17 de febrero de 2026  
> **Estado actual:** Pre-Beta (MVP funcional completado)

---

## 📊 Estado Actual del Proyecto

### ✅ **Funcionalidades Completadas**
- Sistema de autenticación (Cliente, Mecánico, Administrador)
- Gestión de perfiles (cliente y mecánico)
- Creación y asignación de solicitudes de servicio
- Sistema de estados (PENDIENTE → ACEPTADO → EN_CAMINO → EN_PROCESO → FINALIZADO)
- Sistema de calificaciones y reseñas
- Panel administrativo con verificación de mecánicos
- Estadísticas básicas para admin
- Middleware de seguridad con protección de rutas
- Historial de cambios de estado
- Filtros por estado de servicio
- Dashboard responsivo con diseño moderno

---

## 🔴 **CRÍTICAS - Necesarias antes del lanzamiento**

### 1. Sistema de Notificaciones/Alertas
**Prioridad:** 🔴 Alta  
**Tiempo estimado:** 2-3 días  
**Complejidad:** Media

**Problema actual:**
- Cliente no sabe cuándo un mecánico acepta su solicitud
- Mecánico no recibe alerta de nuevas solicitudes disponibles
- No hay notificación cuando cambian estados del servicio

**Solución propuesta:**
- Implementar envío de emails con Nodemailer o SendGrid
- Notificar por email en eventos clave:
  - ✉️ Cliente: Cuando mecánico acepta solicitud
  - ✉️ Cliente: Cuando mecánico está en camino
  - ✉️ Cliente: Cuando servicio está finalizado
  - ✉️ Mecánico: Nuevas solicitudes disponibles según su especialidad
  - ✉️ Admin: Nuevo mecánico pendiente de verificación

**Archivos a crear/modificar:**
- `src/lib/email.ts` - Utilidad para envío de emails
- `src/services/notificationService.ts` - Lógica de notificaciones
- Templates de emails en `src/templates/emails/`

**Variables de entorno necesarias:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@motohelp.com
SMTP_PASSWORD=xxxxx
```

---

### 2. Recuperación de Contraseña
**Prioridad:** 🔴 Alta  
**Tiempo estimado:** 1 día  
**Complejidad:** Baja

**Problema actual:**
- Si un usuario olvida su contraseña, no puede recuperarla
- Única opción es crear nueva cuenta

**Solución propuesta:**
- Endpoint POST `/api/auth/forgot-password` - Envía email con token
- Endpoint POST `/api/auth/reset-password` - Valida token y cambia contraseña
- Página `/auth/reset-password/[token]` - Formulario de nueva contraseña
- Tokens temporales con expiración de 1 hora

**Archivos a crear:**
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/auth/forgot-password/page.tsx`
- `src/app/auth/reset-password/[token]/page.tsx`

**Base de datos:**
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

### 3. Validación de Ubicación Real
**Prioridad:** 🔴 Alta  
**Tiempo estimado:** 2-3 días  
**Complejidad:** Media-Alta

**Problema actual:**
- Direcciones son texto libre sin validación
- No hay mapa para confirmar ubicación
- Mecánico no puede ver distancia al cliente
- No hay garantía de que la dirección sea correcta

**Solución propuesta:**
- Integrar Google Maps API o Mapbox
- Autocompletar direcciones en formulario
- Geocodificar direcciones a coordenadas lat/lng
- Mostrar mapa en detalle del servicio
- Calcular distancia mecánico ↔ cliente

**Archivos a crear/modificar:**
- `src/components/AddressAutocomplete.tsx`
- `src/components/MapView.tsx`
- `src/lib/maps.ts` - Utilidades de geocodificación

**Variables de entorno necesarias:**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxxxx
```

**Base de datos:**
```prisma
model Address {
  // ... campos existentes
  latitude  Float?
  longitude Float?
}
```

---

### 4. Sistema de Pagos
**Prioridad:** 🟡 Media (puede lanzarse sin esto en beta temprana)  
**Tiempo estimado:** 4-5 días  
**Complejidad:** Alta

**Problema actual:**
- Campo `price` existe pero no hay flujo de pago
- Pagos se gestionan fuera de la app (efectivo)
- No hay registro de transacciones

**Solución propuesta:**
- Integrar Stripe o PayPal
- Cliente paga por adelantado o al finalizar
- Retener pago hasta confirmación del servicio
- Sistema de reembolsos para cancelaciones

**Archivos a crear:**
- `src/app/api/payments/create-checkout/route.ts`
- `src/app/api/payments/webhook/route.ts`
- `src/services/paymentService.ts`
- `src/components/PaymentForm.tsx`

**Variables de entorno necesarias:**
```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Base de datos:**
```prisma
model Payment {
  id              String   @id @default(cuid())
  serviceRequestId String
  amount          Decimal
  currency        String   @default("COP")
  status          PaymentStatus
  stripePaymentId String?
  createdAt       DateTime @default(now())
  serviceRequest  ServiceRequest @relation(fields: [serviceRequestId], references: [id])
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

---

## 🟡 **IMPORTANTES - Mejorarían mucho la experiencia**

### 5. Búsqueda y Filtros Avanzados
**Prioridad:** 🟡 Media  
**Tiempo estimado:** 2 días  
**Complejidad:** Media

**Características:**
- Búsqueda de mecánicos por:
  - ⭐ Rating mínimo
  - 📍 Ubicación cercana (requiere Maps API)
  - 🔧 Especialidad específica
  - 💰 Rango de precio
- Ordenar resultados por:
  - Más cercanos primero
  - Mejor calificados
  - Precio menor/mayor

**Archivos a modificar:**
- `src/app/dashboard/client/page.tsx` - Agregar filtros UI
- `src/repositories/mechanicProfileRepository.ts` - Queries avanzadas
- `src/app/api/mechanics/search/route.ts` - Nuevo endpoint

---

### 6. Chat/Mensajería Cliente-Mecánico
**Prioridad:** 🟡 Media  
**Tiempo estimado:** 4-5 días  
**Complejidad:** Alta

**Características:**
- Chat en tiempo real dentro de cada servicio activo
- Cliente puede preguntar detalles antes de que llegue
- Mecánico puede solicitar info adicional
- Historial de mensajes guardado

**Tecnologías:**
- Pusher o Socket.io para tiempo real
- React Query para actualizaciones

**Base de datos:**
```prisma
model Message {
  id               String   @id @default(cuid())
  serviceRequestId String
  senderId         String
  content          String
  createdAt        DateTime @default(now())
  serviceRequest   ServiceRequest @relation(fields: [serviceRequestId], references: [id])
  sender           User     @relation(fields: [senderId], references: [id])
}
```

---

### 7. Sistema de Fotos
**Prioridad:** 🟡 Media  
**Tiempo estimado:** 2 días  
**Complejidad:** Media

**Características:**
- Cliente puede subir 3-5 fotos del problema
- Mecánico puede documentar trabajo con fotos
- Galería de fotos en detalle del servicio

**Tecnologías:**
- Cloudinary o AWS S3 para almacenamiento
- Next.js Image para optimización

**Base de datos:**
```prisma
model ServicePhoto {
  id               String   @id @default(cuid())
  serviceRequestId String
  uploadedBy       String
  url              String
  description      String?
  createdAt        DateTime @default(now())
  serviceRequest   ServiceRequest @relation(fields: [serviceRequestId], references: [id])
  uploader         User     @relation(fields: [uploadedBy], references: [id])
}
```

---

### 8. Historial Completo de Servicios
**Prioridad:** 🟢 Baja  
**Tiempo estimado:** 1 día  
**Complejidad:** Baja

**Características:**
- Vista "Mis servicios completados" con estadísticas
- Cliente puede ver todos los mecánicos que lo han atendido
- Mecánico puede ver todos sus trabajos pasados
- Exportar historial a PDF

---

### 9. Panel de Análisis para Mecánicos
**Prioridad:** 🟢 Baja  
**Tiempo estimado:** 2 días  
**Complejidad:** Media

**Características:**
- Estadísticas del mes:
  - 📊 Servicios completados
  - 💰 Ganancias totales
  - ⭐ Rating promedio
  - ⏱️ Tiempo promedio por servicio
- Gráficos de evolución
- Comparación con mes anterior

---

## 🟢 **OPCIONALES - Para futuras versiones**

### 10. Horario de Disponibilidad
- Mecánicos configuran horarios disponibles
- Bloquear aceptación fuera de horario
- Configurar días libres/vacaciones

### 11. Sistema de Referencias/Cupones
- Códigos de descuento para nuevos usuarios
- Programa de referidos (invita amigo, gana crédito)
- Cupones promocionales para admin

### 12. Soporte/Ayuda
- FAQ integrado
- Chat de soporte en vivo
- Sistema de tickets para reportar problemas
- Centro de ayuda con tutoriales

### 13. Multi-idioma
- Actualmente solo español
- Agregar inglés
- Agregar portugués (Brasil)

---

## 📋 **CHECKLIST TÉCNICO PRE-LANZAMIENTO**

### Seguridad
- [x] Autenticación con NextAuth
- [x] Middleware de rutas protegidas
- [x] Validación de roles en API
- [ ] **Rate limiting** (prevenir abuso de API)
- [ ] **HTTPS obligatorio** (verificar en Vercel)
- [ ] **Sanitización de inputs** (prevenir XSS/SQL injection)
- [ ] **CORS configurado correctamente**
- [ ] **Variables de entorno en producción**

### Performance
- [x] Build sin errores
- [ ] **Optimización de imágenes** (next/image)
- [ ] **Caché de queries frecuentes**
- [ ] **Lazy loading** de componentes pesados
- [ ] **Minificación de assets**
- [ ] **Lighthouse score > 90**

### Testing
- [ ] **Tests unitarios** (Jest/Vitest)
- [ ] **Tests E2E** (Playwright/Cypress)
- [ ] **Testing de flujos críticos:**
  - [ ] Registro → Login
  - [ ] Crear servicio → Aceptar → Finalizar → Calificar
  - [ ] Admin verifica mecánico
- [ ] **Testing en múltiples navegadores**
- [ ] **Testing responsive (móvil/tablet)**

### Legal/Compliance
- [ ] **Términos y condiciones**
- [ ] **Política de privacidad**
- [ ] **Política de cookies**
- [ ] **GDPR compliance** (si aplica)
- [ ] **Aviso legal**
- [ ] **Consentimiento de uso de datos**

### UX/UI
- [x] Diseño responsivo
- [x] Toasts de feedback
- [ ] **Estados de carga** (skeletons)
- [ ] **Páginas de error custom** (404, 500)
- [ ] **Onboarding** para nuevos usuarios
- [ ] **Tutorial interactivo**
- [ ] **Confirmaciones para acciones destructivas**

### Monitoreo y Logs
- [ ] **Sentry u otro sistema de error tracking**
- [ ] **Analytics** (Google Analytics/Mixpanel)
- [ ] **Logging de eventos críticos**
- [ ] **Monitoreo de uptime**
- [ ] **Alertas automáticas de errores**

### SEO y Marketing
- [ ] **Meta tags optimizados**
- [ ] **Open Graph para redes sociales**
- [ ] **Sitemap.xml**
- [ ] **robots.txt**
- [ ] **Landing page pública**
- [ ] **Blog/Noticias** (opcional)

---

## 🎯 **RECOMENDACIÓN PARA BETA V1**

### **Implementar SOLO ESTAS 3 antes del lanzamiento beta:**

#### ✅ **1. Notificaciones por Email** (1-2 días)
**Por qué es crítico:** Sin notificaciones, los usuarios no saben qué está pasando con sus servicios.

**Eventos a notificar:**
```typescript
✉️ Cliente recibe email cuando:
- Mecánico acepta su solicitud
- Mecánico está en camino
- Servicio está en proceso
- Servicio finalizado → puede calificar
- Servicio cancelado

✉️ Mecánico recibe email cuando:
- Nueva solicitud coincide con sus servicios
- Cliente cancela servicio asignado
- Recibe una calificación

✉️ Admin recibe email cuando:
- Nuevo mecánico se registra (necesita verificación)
```

---

#### ✅ **2. Recuperación de Contraseña** (1 día)
**Por qué es crítico:** Es un estándar esperado en cualquier aplicación.

**Flujo:**
1. Usuario hace clic "Olvidé mi contraseña"
2. Ingresa su email
3. Recibe email con link temporal (válido 1 hora)
4. Crea nueva contraseña
5. Login automático

---

#### ✅ **3. Términos y Condiciones + Privacidad** (1 día)
**Por qué es crítico:** Requisito legal para operar.

**Documentos a crear:**
- Términos y condiciones del servicio
- Política de privacidad
- Política de tratamiento de datos
- Checkbox de aceptación en registro

---

## ⚡ **TODO LIST PRIORIZADO (4-6 SEMANAS)**

### **SEMANA 1 (Crítico)** 🔴
- [ ] Implementar notificaciones por email
- [ ] Sistema de recuperación de contraseña
- [ ] Rate limiting en API (express-rate-limit)
- [ ] Crear términos y condiciones + privacidad
- [ ] Páginas 404 y 500 personalizadas

### **SEMANA 2 (Importante)** 🟡
- [ ] Integración Google Maps API
  - [ ] Autocompletar direcciones
  - [ ] Geocodificación
  - [ ] Mapa en detalle de servicio
- [ ] Testing E2E de flujos críticos
- [ ] Sanitización de inputs
- [ ] Optimización de imágenes

### **SEMANA 3 (Sistema de Pagos)** 💰
- [ ] Integrar Stripe
- [ ] Checkout de pago
- [ ] Webhooks para confirmaciones
- [ ] Sistema de reembolsos
- [ ] Testing de pagos en sandbox

### **SEMANA 4 (Chat y Fotos)** 💬📸
- [ ] Sistema de chat básico
- [ ] Integrar Cloudinary para fotos
- [ ] Subida de fotos del problema
- [ ] Documentación fotográfica del mecánico

### **SEMANA 5 (Analytics y Monitoreo)** 📊
- [ ] Integrar Sentry para error tracking
- [ ] Google Analytics
- [ ] Panel de estadísticas para mecánicos
- [ ] Dashboard de métricas para admin

### **SEMANA 6 (Pulido y Testing)** ✨
- [ ] Testing exhaustivo en todos los navegadores
- [ ] Tests de carga y performance
- [ ] Optimización SEO
- [ ] Lighthouse audit y correcciones
- [ ] Documentación de API
- [ ] Onboarding para nuevos usuarios

---

## 📈 **CRITERIOS DE ÉXITO PARA BETA**

### Métricas Técnicas
- ✅ 0 errores críticos en producción
- ✅ Lighthouse score > 85
- ✅ Tiempo de carga < 3 segundos
- ✅ Uptime > 99.5%
- ✅ Cobertura de tests > 60%

### Métricas de Usuario
- 🎯 10-20 mecánicos verificados
- 🎯 50-100 clientes registrados
- 🎯 20+ servicios completados exitosamente
- 🎯 Rating promedio > 4.0
- 🎯 < 5% tasa de cancelación

### Métricas de Negocio
- 💰 Modelo de monetización definido
- 💰 Comisión por servicio establecida
- 💰 Costos de operación calculados
- 💰 Proyección de rentabilidad a 6 meses

---

## 🚨 **RIESGOS Y MITIGACIÓN**

### Riesgo 1: Bajo número de mecánicos verificados
**Mitigación:**
- Campaña de referidos para mecánicos
- Incentivos para primeros 50 mecánicos
- Verificación rápida (< 24 horas)

### Riesgo 2: Problemas de seguridad de datos
**Mitigación:**
- Auditoría de seguridad antes del lanzamiento
- Implementar rate limiting
- Backup diario de base de datos
- Plan de respuesta a incidentes

### Riesgo 3: Experiencia de pago deficiente
**Mitigación:**
- Testing exhaustivo de flujo de pago
- Soporte inmediato para problemas de pago
- Opción de pago en efectivo como fallback

### Riesgo 4: Confusión de usuarios
**Mitigación:**
- Tutorial interactivo al primer login
- Tooltips explicativos
- Centro de ayuda completo
- Chat de soporte

---

## 📞 **SIGUIENTE PASO**

**Dime cuáles de estas características quieres implementar y en qué orden.**

Recomendación del desarrollador:

```
1️⃣ Notificaciones por email (CRÍTICO)
2️⃣ Recuperación de contraseña (CRÍTICO)
3️⃣ Términos legales (CRÍTICO)
4️⃣ Google Maps (MUY IMPORTANTE)
5️⃣ Sistema de pagos (IMPORTANTE)
```

¿Por dónde empezamos? 🚀
