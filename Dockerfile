# ===========================================
# DOCKERFILE OPTIMIZADO PARA LMS PLATFORM
# ===========================================
# Multi-stage build para Next.js con optimizaciones de producción

# Etapa 1: Dependencias base
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias de producción
RUN npm install --production && \
    npm install prisma && \
    npx prisma generate && \
    npm cache clean --force

# Etapa 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generar cliente Prisma
RUN npx prisma generate

# Build de la aplicación
RUN npm run build

# Asegurar que existe la carpeta public
RUN mkdir -p public

# Etapa 3: Producción
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear grupo y usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Crear directorios necesarios
RUN mkdir -p ./public ./.next

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Configurar permisos para Next.js
RUN chown nextjs:nodejs .next

# Copiar archivos de build con permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar schema de Prisma y node_modules necesarios
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Instalar dependencias de runtime necesarias
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
CMD ["node", "server.js"]
