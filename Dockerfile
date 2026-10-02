# Dockerfile para Arca Tierra Web App
# B2 (R7, 2-oct-2026): Node 22 exacto (producción corría 18.20.8 y .nvmrc decía 20). Con Node 18, npm
# saltaba sharp (pide >=20.9) y por eso el optimizador de imágenes no podía funcionar (M5).
FROM node:22.23.3-alpine3.24 AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# C4 (R3, 1-oct-2026): `npm ci` instala EXACTAMENTE el package-lock auditado (falla si no está
# sincronizado con package.json). `.npmrc` entra aquí porque el lock se genera con
# legacy-peer-deps=true: sin él, `npm ci` lo da por desincronizado y el `npm install` de antes
# resolvía OTRO árbol de dependencias (peer deps) que el que se audita en el repo.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

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
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

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

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]

