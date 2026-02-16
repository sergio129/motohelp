# 🚀 Quick Wins - Mejoras Rápidas

## Nivel: FÁCIL (30 min - 1 hora c/u)

### 1. ✨ Toast Notifications
**Archivo**: `src/components/Toast.tsx` (nuevo)
**Dónde usar**: 
- `src/app/dashboard/client/page.tsx` - Después de calificar
- `src/app/dashboard/mechanic/page.tsx` - Después de aceptar/cambiar estado

**Implementación simple**:
```tsx
// Usar react-hot-toast o similar
import { toast } from 'react-hot-toast';

// En handleAccept
toast.success('¡Solicitud aceptada! Ya estás en camino.');
```

**Instalación**: `npm install react-hot-toast`

---

### 2. 🚫 Deshabilitar Cancelar después EN_PROCESO
**Archivo**: `src/app/dashboard/client/page.tsx` (línea ~325)
**Cambio**:
```tsx
{item.status === "PENDIENTE" && (
  <Button ... onClick={() => handleCancel(item.id)}>
    Cancelar
  </Button>
)}
```

**Ya implementada la lógica en backend** - Solo UI

---

### 3. 📊 Stats Card Admin Dashboard
**Archivo**: Crear `src/app/dashboard/admin/page.tsx` completo
**Componentes necesarios**:
```tsx
// Tarjetas simples
<Card>
  <CardContent>
    <div className="text-3xl font-bold">42</div>
    <p className="text-sm text-slate-400">Servicios Completados</p>
  </CardContent>
</Card>
```

**API necesaria**: Crear `src/app/api/analytics/stats` que retorne:
- Total servicios completados
- Rating promedio
- Servicios pendientes
- Total cancelados

---

### 4. 👤 Ver Perfil del Mecánico (Cliente)
**Archivo**: Crear `src/components/MechanicProfileModal.tsx` (nuevo)
**Dónde usar**: En modal de detalles del servicio, botón "Ver mecánico"

**Componente muestra**:
- Nombre, especialidad, años experiencia
- Rating promedio (⭐4.5)
- Últimas 3 calificaciones con comentarios
- Botón para contactar (teléfono si existe)

---

### 5. 🔗 Botón "Ver Cliente" Funcional (Mecánico)
**Archivo**: `src/app/dashboard/mechanic/page.tsx` (línea ~313)
**Cambio simple**:
```tsx
<Button ... onClick={() => setSelectedClientForNotes(item.clientId || "")}>
  Ver cliente
</Button>
```

**Modal**: Mostrar nombre, teléfono, documento del cliente

---

## Nivel: MEDIO (1-2 horas c/u)

### 6. 🎯 Filtros en Cliente Dashboard
**Dónde**: `src/app/dashboard/client/page.tsx`
**Funcionalidad**:
- Dropdown: "Todos", "Pendientes", "En proceso", "Completados", "Calificados"
- Input búsqueda por tipo de servicio
- Rango de fechas

**Estado local**:
```tsx
const [filterStatus, setFilterStatus] = useState(""); // "" = todos
const filtered = data?.filter(item => !filterStatus || item.status === filterStatus);
```

---

### 7. 📅 Timeline Visual en Detalles
**Dónde**: Modal de detalles (cliente y mecánico)
**Visual**:
```
PENDIENTE ─→ ACEPTADO ─→ EN_CAMINO ─→ EN_PROCESO ─→ FINALIZADO
   ✓          ✓           ✓            ✓            ✓
```

**Datos**: Usar `statusHistory` del API

---

### 8. 💰 Sistema de Precios Básico
**Cambios**:
1. Mostrar precio en tarjeta de solicitud
2. Calcular: `basePrice * numServicios` o rango
3. Historial de precios en detalles

---

## Nivel: AVANZADO (2-4 horas)

### 9. 🔐 Reset de Contraseña
**Flujo**:
1. Link "Olvidé contraseña" en login
2. Email con código temporal (6 dígitos)
3. Validar código y permitir reset
4. Confirmación por email

**Librerías**: `nodemailer` (si se configura email)

---

## 🎬 Pasos para Implementar (Ejemplo: Toast Notifications)

1. **Instalar** → `npm install react-hot-toast`
2. **Envolver app** → `src/app/layout.tsx`:
   ```tsx
   import { Toaster } from 'react-hot-toast';
   
   <Toaster />  // Dentro del <body>
   ```
3. **Usar en componentes**:
   ```tsx
   import toast from 'react-hot-toast';
   
   toast.success('✅ Listo!');
   toast.error('❌ Error');
   toast.loading('Cargando...');
   ```
4. **Compilar** → `npm run build`
5. **Probar** → `npm run dev`

---

## 📌 Priority Order (Recomendado)

1. **Toast Notifications** (UX - vea feedback inmediato)
2. **Deshabilitar Cancelar** (Seguridad - previene errores)
3. **Ver Perfil Mecánico** (UX - confianza del cliente)
4. **Stats Admin** (Admin visibility)
5. **Filtros** (Usabilidad)
6. **Timeline** (Polish)

