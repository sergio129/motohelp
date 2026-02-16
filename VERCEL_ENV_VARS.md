# Variables de Entorno para Vercel

## ⚠️ IMPORTANTE: Configurar exactamente estas 3 variables

Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**

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
- [ ] Redeploy ejecutado
- [ ] Migraciones aplicadas en la base de datos
- [ ] Usuario admin creado en la base de datos
