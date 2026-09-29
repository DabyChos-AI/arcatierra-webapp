# Dockerfile para Arca Tierra Web App
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias basadas en el gestor de paquetes preferido
COPY package.json package-lock.json* ./
RUN npm install

# Reconstruir el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# B10 (2026-09-29): el .env.production ya no entra al build (el modo standalone
# lo copiaba a la imagen final, con todas las credenciales). Next inlinea las
# NEXT_PUBLIC_* al compilar, así que aquí van SOLO las públicas, con los mismos
# valores que tenía el archivo. Las secretas llegan al contenedor por env_file.
ARG NEXT_PUBLIC_API_URL=https://api.dabychos.com
ARG NEXT_PUBLIC_SITE_URL=https://arcatierra.dabychos.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Deshabilitar telemetría durante la construcción
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instalar wget para health checks + tzdata para timezone
RUN apk add --no-cache wget tzdata

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Configurar permisos correctos para prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar automáticamente archivos de salida basados en el tipo de salida
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]

