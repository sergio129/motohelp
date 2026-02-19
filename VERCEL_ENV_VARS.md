# Variables de Entorno para Vercel

## ⚠️ IMPORTANTE: Configurar estas variables obligatorias

Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**

---

## 🔐 Variables de Autenticación

### 1. DATABASE_URL
**Valor:**
```
postgres://51ecd98aa7cb522bffc7f0d3eefaf1ddbc5f66c826102fd3714b53974057190b:sk_s5T1s5r8R8onhYyd63Hju@db.prisma.io:5432/postgres?sslmode=require
```

**Environments:** Production, Preview, Development (seleccionar los 3)

---

### 2. NEXTAUTH_URL
**Valor:**
```
https://motohelp-iota.vercel.app
```

**Environments:** Production

**⚠️ NOTA:** NO incluir `/auth/sign-in` ni ninguna otra ruta, solo el dominio base.  
**⚠️ CRÍTICO:** Esta variable es necesaria para que los links en los emails funcionen correctamente.

---

### 3. NEXTAUTH_SECRET
**Valor:**
```
FWobJcidebu6bz8AVU2MjCXYzwfqNUrL6Qcqml1IGmE=
```

**Environments:** Production, Preview, Development (seleccionar los 3)

---

## 📧 Variables de Email (Sistema de Notificaciones)

### 4. SMTP_HOST
**Valor:**
```
smtp.gmail.com
```

**Environments:** Production

---

### 5. SMTP_PORT
**Valor:**
```
587
```

**Environments:** Production

---

### 5.1 SMTP_SECURE
**Valor recomendado:**
- `false` si usas `SMTP_PORT=587`
- `true` si usas `SMTP_PORT=465`

**Environments:** Production

**⚠️ NOTA:** Debe coincidir con el puerto SMTP. Si no coincide, puede aparecer el error `Greeting never received`.

---

### 6. SMTP_USER
**Valor:**
```
sanayaromero62@gmail.com
```

**Environments:** Production

---

### 7. SMTP_PASSWORD
**Valor:**
```
opercihlnhwqxspb
```

**Environments:** Production

**⚠️ NOTA:** Esta es una contraseña de aplicación de Gmail, NO la contraseña normal.

---

### 8. ADMIN_EMAIL
**Valor:**
```
admin@motohelp.local
```

**Environments:** Production

**Descripción:** Email que recibe notificaciones cuando nuevos mecánicos se registran.

---

### 3. NEXTAUTH_SECRET
**Valor:**
```
FWobJcidebu6bz8AVU2MjCXYzwfqNUrL6Qcqml1IGmE=
```

**Environments:** Production, Preview, Development (seleccionar los 3)

---

## 🔄 Después de configurar:

1. **Guarda todas las variables**
2. Ve a la pestaña **Deployments**
3. Encuentra el último deployment
4. Haz clic en los **3 puntos (...)** a la derecha
5. Selecciona **Redeploy**
6. Espera a que termine el despliegue (~2-3 minutos)

---

## ✅ Credenciales de prueba:

**Email:** admin@motohelp.local  
**Contraseña:** Admin0129!

---

## 🐛 Si sigue sin funcionar:

1. Verifica que las 3 variables estén configuradas correctamente (sin espacios extra)
2. Asegúrate de que `NEXTAUTH_URL` sea exactamente: `https://motohelp-iota.vercel.app` (sin barra al final)
3. Verifica en los logs de Vercel si hay algún error de Prisma o NextAuth
4. Intenta limpiar cookies del navegador y vuelve a intentar

---

## 📋 Checklist de verificación:

- [ ] DATABASE_URL configurada
- [ ] NEXTAUTH_URL configurada (sin `/` al final)
- [ ] NEXTAUTH_SECRET configurada
- [ ] SMTP_HOST configurada
- [ ] SMTP_PORT configurada
- [ ] SMTP_SECURE configurada (true para 465 / false para 587)
- [ ] SMTP_USER configurada
- [ ] SMTP_PASSWORD configurada (contraseña de aplicación de Gmail)
- [ ] ADMIN_EMAIL configurada
- [ ] Redeploy ejecutado
- [ ] Migraciones aplicadas en la base de datos
- [ ] Usuario admin creado en la base de datos

---

## 🧪 Prueba de emails:

Después de configurar las variables SMTP y hacer redeploy, puedes probar que funcionen:

1. **Registro de nuevo usuario:** Debería enviar email de bienvenida
2. **Mecánico acepta solicitud:** Cliente recibe email con detalles
3. **Servicio completado:** Cliente recibe email para calificar
4. **Nueva calificación:** Mecánico recibe notificación
