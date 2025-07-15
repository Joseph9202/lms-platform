# Guía de Deployment - LMS Platform

## 🚀 Deployment en Vercel

1. **Preparar el proyecto:**
   ```bash
   npm run build
   ```

2. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Importa el proyecto

3. **Configurar variables de entorno en Vercel:**
   ```
   DATABASE_URL=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   UPLOADTHING_SECRET=
   UPLOADTHING_APP_ID=
   MUX_TOKEN_ID=
   MUX_TOKEN_SECRET=
   STRIPE_API_KEY=
   NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
   STRIPE_WEBHOOK_SECRET=
   ```

4. **Deploy automático:**
   - Vercel automáticamente hará deploy en cada push

## 📊 Configuración de Base de Datos en Producción

### Opción 1: PlanetScale (Recomendado)
1. Crea una cuenta en [planetscale.com](https://planetscale.com)
2. Crea una nueva base de datos
3. Obtén la cadena de conexión
4. Actualiza `DATABASE_URL` en las variables de entorno

### Opción 2: Railway
1. Crea una cuenta en [railway.app](https://railway.app)
2. Crea un nuevo proyecto MySQL
3. Obtén la cadena de conexión
4. Actualiza `DATABASE_URL`

### Aplicar migraciones:
```bash
npx prisma db push
```

## 💳 Configuración de Stripe para Producción

1. **Cambiar a claves de producción:**
   - Ve al dashboard de Stripe
   - Cambia a modo "Live"
   - Obtén las nuevas claves API

2. **Configurar webhooks:**
   - URL: `https://tu-dominio.vercel.app/api/webhook`
   - Eventos: `checkout.session.completed`

## 📱 Configuración de Clerk para Producción

1. **Actualizar URLs:**
   - Production domain: `https://tu-dominio.vercel.app`
   - Authorized origins y redirect URLs

## 🎥 Configuración de Mux

1. **Verificar configuración:**
   - Las claves de Mux funcionan tanto en desarrollo como producción
   - Asegúrate de que los webhooks apunten a tu dominio de producción

## 🔧 Variables de Entorno Adicionales

```bash
# Para identificar instructores (opcional)
NEXT_PUBLIC_TEACHER_ID=user_xxxxxxxxxxxxxxx

# Para analytics (opcional)
NEXT_PUBLIC_GOOGLE_ANALYTICS=GA_XXXXXXXXXXXXX
```

## ⚡ Optimizaciones para Producción

1. **Imágenes:**
   - Usar Next.js Image component
   - Configurar dominios permitidos en `next.config.js`

2. **Performance:**
   - Implementar cache con Redis (opcional)
   - Usar CDN para assets estáticos

3. **Monitoreo:**
   - Configurar Sentry para error tracking
   - Implementar logging con Winston

## 🔒 Consideraciones de Seguridad

1. **Variables de entorno:**
   - Nunca commitear archivos `.env`
   - Usar variables seguras en producción

2. **Base de datos:**
   - Configurar IP whitelist
   - Usar conexiones SSL

3. **API Routes:**
   - Implementar rate limiting
   - Validar todas las entradas

## 📝 Checklist de Pre-Deploy

- [ ] Todas las variables de entorno configuradas
- [ ] Base de datos creada y migrada
- [ ] Stripe configurado con webhooks
- [ ] Clerk configurado con URLs correctas
- [ ] Mux configurado
- [ ] UploadThing configurado
- [ ] Tests pasando (si los hay)
- [ ] Build exitoso localmente

## 🐛 Troubleshooting

### Error de conexión a base de datos
- Verificar cadena de conexión
- Comprobar whitelist de IPs
- Asegurar que la base de datos esté activa

### Error 500 en producción
- Revisar logs de Vercel
- Verificar variables de entorno
- Comprobar que todas las dependencias estén instaladas

### Problemas con Stripe
- Verificar webhook URL
- Comprobar que los eventos estén configurados
- Revisar logs de Stripe dashboard