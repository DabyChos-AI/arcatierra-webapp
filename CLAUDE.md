# CLAUDE.md — Arcatierra Webapp

E-commerce y plataforma de experiencias de Arca Tierra. Frontend Next.js 15 (App Router) con backend FastAPI separado (`~/vps-stack/arca_tierra_api/`). Desplegado en VPS Ubuntu 24.04 con Docker + Traefik en `arcatierra.dabychos.com`.

---

## Comandos esenciales

```bash
# Desarrollo
npm run dev          # Next.js dev server en localhost:3000
npm run lint         # ESLint (next/core-web-vitals + next/typescript)

# Build y deploy (producción — siempre sin cache)
npm run build        # Verificar que compila antes de deploy
cd ~/vps-stack/arcatierra-webapp && docker compose build --no-cache && docker compose up -d

# Verificar estado
docker ps --filter name=arcatierra    # Estado del contenedor
docker logs arcatierra-webapp-new     # Logs del frontend
docker logs arca-api                  # Logs del backend

# No hay: test, format, pre-commit hooks
```

---

## Estructura del proyecto

```
arcatierra-webapp/
├── src/
│   ├── app/                  # App Router — páginas y API routes
│   │   ├── admin/            # Panel admin (pedidos, clientes, pagos, productos)
│   │   ├── api/              # API routes Next.js (auth, cart, orders, webhooks)
│   │   ├── tienda/           # Tienda de productos
│   │   ├── experiencias/     # Experiencias y eventos
│   │   ├── suscripciones/    # Suscripciones de canastas
│   │   ├── checkout/         # Flujo de pago
│   │   ├── baldio/           # Restaurante El Baldío
│   │   ├── catering/         # Servicio de catering
│   │   ├── usuario/          # Dashboard, perfil, favoritos
│   │   └── ...
│   ├── components/           # Componentes React
│   │   ├── admin/            # Componentes del panel admin
│   │   ├── header/           # Header con navegación
│   │   ├── layout/           # Footer, Header, TransparentHeader
│   │   ├── ui/               # Componentes base (shadcn/ui + custom)
│   │   └── ...
│   ├── data/                 # Datos estáticos (productos, recetas, experiencias)
│   ├── hooks/                # Custom hooks (useFavoritos, useDashboard, useVoiceSearch)
│   ├── lib/                  # Utilidades (auth-config, utils, animations)
│   └── types/                # TypeScript types y declaraciones
├── public/                   # Assets estáticos (imágenes, fonts, logos)
├── api/                      # ⚠️ LEGACY — Solo docs de referencia y main.py viejo
│                             #    El backend real está en ~/vps-stack/arca_tierra_api/
├── docs/                     # Documentación (mayormente obsoleta)
├── audit/                    # Reportes de auditoría responsive (posiblemente obsoletos)
├── .claude/
│   ├── skills/               # 12 skills locales de Claude Code
│   ├── skills-reference-arcatierra.md  # Referencia completa de 20 skills
│   └── project-audit.md     # Auditoría detallada del proyecto
├── docker-compose.yml        # El único docker-compose activo
├── Dockerfile                # Multi-stage: deps → builder → runner (node:18-alpine)
├── .env.local                # Variables de entorno desarrollo
├── .env.production           # Variables de entorno producción
├── tailwind.config.ts        # Colores y tipografías oficiales
└── CLAUDE.md                 # Este archivo
```

**Backend FastAPI**: Repo separado en `~/vps-stack/arca_tierra_api/`. No está en este repo. Si necesitas trabajar con el backend, cambia de directorio.

**Docker-compose alternativos** (`production`, `integration`, `n8n-gateway`, `enterprise`): Son legacy, no se usan. Ignorarlos.

**Archivos .backup**: Hay ~20+ archivos `.backup`, `.backup-responsive`, `.bak` dispersos en `src/` y Dockerfiles backup en raíz. Son basura legacy.

---

## Stack y tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 15.3.4 | App Router, `output: 'standalone'` |
| React | 18.3.1 | UI |
| TypeScript | 5.7.2 | strict: true |
| Tailwind CSS | 3.4.14 | Estilos + tailwindcss-animate |
| Radix UI + shadcn/ui | latest | Componentes base |
| Zustand | 5.0.1 | Estado global (carrito, UI) |
| React Query | 5.x | Data fetching |
| NextAuth | 4.24.11 | Auth (JWT, Google OAuth + Credentials) |
| Framer Motion | 11.x | Animaciones |
| Recharts | 3.x | Gráficas (admin/dashboard) |
| Embla Carousel + Swiper | — | Carruseles |
| Lucide React | 0.460 | Iconos |
| Leaflet | 1.9.4 | Mapa admin (MapPicker) |
| Google Maps | API | Mapa de entregas (checkout) |
| ESLint | 9.x | next/core-web-vitals + next/typescript |
| npm | legacy-peer-deps | Gestor de paquetes |

**Backend** (repo separado `~/vps-stack/arca_tierra_api/`): FastAPI 0.104.1, SQLAlchemy 2.0 async + asyncpg, Alembic, pgvector.

**⚠️ Discrepancia Node.js**: `.nvmrc` = 20.18.0, Dockerfile = node:18-alpine. Tener en cuenta al generar código.

---

## Diseño y colores

Siempre usar estos colores y tipografías al crear o modificar componentes UI.

**Paleta Tailwind (customizada):**
- Terracota: `#B15543` (principal), `#BA6440` (medio), `#975543` (oscuro)
- Verde: `#33503E` (principal), `#475A52` (claro), `#748880` (suave)
- Neutro: crema `#E3DBCB`, beige `#CCBB9A`, cálido `#DCB584`, gris `#C1CCCE`

**Tipografías** (CSS variables):
- `font-display`, `font-heading` → **Mendoza** (títulos)
- `font-sans`, `font-body` → **Akkurat** (cuerpo)

**Imágenes**: AVIF + WebP (configurado en next.config).

---

## Convenciones de código

**TypeScript:**
- strict mode habilitado
- Path alias: `@/*` → `./src/*`
- Componentes: `'use client'` explícito solo cuando se necesita

**Estilos:**
- Usar colores de marca de Tailwind (`terracota`, `verde`, `neutro-*`), no colores genéricos
- Usar `font-display`/`font-heading` para títulos, `font-sans` para texto
- Componentes UI: usar shadcn/ui + Radix UI como base. Tailwind para estilos, no CSS modules.

**Arquitectura:**
- App Router con Server Components por defecto
- `'use client'` solo cuando hay interactividad (hooks, eventos, estado)
- API routes en `src/app/api/` — proxy al backend FastAPI en `arca-api:8000`
- Auth middleware en `src/middleware.ts` — protege `/dashboard`, `/admin`, `/perfil`, `/ordenes`
- Admin requiere verificación de empleado via API (`/api/auth/check-employee`)
- Modales: usar `z-[60]` para overlay (navbar es `z-50`), header sticky con botón X visible
- Idioma de UI: español (proyecto mexicano)

---

## Servicios y contenedores

**Este proyecto** (docker-compose.yml):
| Servicio | Container | Puerto | URL |
|---|---|---|---|
| arcatierra-webapp | arcatierra-webapp-new | 3000 | arcatierra.dabychos.com |

**Infraestructura VPS** (red `vps-net` compartida):
| Container | Función | Puerto |
|---|---|---|
| `arca-api` | Backend FastAPI | 8000 |
| `arca-postgres` | PostgreSQL 16 + pgvector (BD: **arcatierra**) | 5432 |
| `arca-redis` | Redis 7 cache | 6379 |
| `traefik` | Proxy reverso + TLS (Let's Encrypt) | 80/443 |
| `n8n` + `n8n-worker` | Workflow automation | 5678 |
| `metabase` | BI/Analytics | 3001 |
| `mxbai-embed-large` | Embeddings (Ollama) | 11434 |
| `grafana` | Monitoreo dashboards | 3000 |
| `prometheus` | Métricas | 9090 |
| `searxng` | Motor de búsqueda | 8080 |
| `cloudbeaver` | Admin BD web | 8978 |

**No activos** (carpetas existen, sin contenedor): Baserow, Portainer, llama31-chatbot.

---

## Variables de entorno

No hay `.env.example`. Archivos: `.env.local` (dev), `.env.production` (prod). No hay validación de env con Zod.

**Variables críticas:**
| Variable | Propósito |
|---|---|
| `API_URL` / `NEXT_PUBLIC_API_URL` | Backend FastAPI (arca-api) |
| `INTERNAL_API_URL` / `INTERNAL_API_SECRET` | Comunicación inter-servicios |
| `DATABASE_URL` | PostgreSQL (arca-postgres, BD: arcatierra) |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Auth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GOOGLE_API_KEY` | Google Maps |
| `MP_ACCESS_TOKEN` / `MP_PUBLIC_KEY` / `NEXT_PUBLIC_MP_PUBLIC_KEY` | MercadoPago credenciales |
| `MP_SUCCESS_URL` / `MP_FAILURE_URL` / `MP_PENDING_URL` / `MP_WEBHOOK_URL` | MercadoPago callbacks |
| `N8N_API_URL` / `N8N_WEBHOOK_URL` | n8n |
| `REDIS_URL` | Redis |

**Feature flags:** `TTS_ENABLED`, `VOICE_NOTES_ENABLED`, `CHAT_HISTORY_ENABLED`, `LLAMA_CHATBOT_URL`

---

## Integraciones

| Servicio | Qué hace en el proyecto |
|---|---|
| **MercadoPago** | Pagos únicos y suscripciones. Checkout en frontend, webhooks en `/api/webhooks/mercadopago` |
| **n8n** | Automatización: formularios de contacto, catering, procesamiento de pedidos |
| **Google OAuth** | Login con Google via NextAuth |
| **Google Maps** | Validación de dirección de entrega en checkout |
| **Leaflet** | Selector de coordenadas en panel admin |
| **PostgreSQL + pgvector** | BD principal con búsqueda vectorial (arca-postgres, BD: arcatierra) |
| **Redis** | Cache de sesiones y datos |
| **mxbai-embed-large** | Generación de embeddings para búsqueda semántica |
| **Traefik** | Proxy reverso, TLS automático con Let's Encrypt |
| **Metabase** | Reportes y analytics conectado a arca-postgres |
| **Grafana + Prometheus** | Monitoreo + métricas + alertas |

**No implementados todavía**: Resend, Cloudflare, SAP. Stripe no se usa — MercadoPago es el procesador de pagos.

---

## Reglas para Claude Code

**Seguridad:**
- NUNCA exponer secretos, tokens, passwords o API keys en código
- NUNCA hardcodear URLs de producción — usar variables de entorno
- NO modificar `.env.production` sin confirmación explícita
- NO modificar `docker-compose.yml`, `Dockerfile`, traefik ni configuraciones de infraestructura sin confirmación
- NO modificar `src/middleware.ts` (auth/protección de rutas) sin confirmación
- NO tocar la carpeta `api/` — es legacy. El backend real es `~/vps-stack/arca_tierra_api/`

**Deploy:**
- Siempre `npm run build` primero para verificar que compila
- El comando de deploy es siempre con `--no-cache`
- NO hacer deploy automático — siempre esperar confirmación del usuario
- NO hacer `docker compose down` a menos que se solicite explícitamente
- Después de deploy, verificar con `docker ps --filter name=arcatierra`

**Código:**
- TypeScript strict. No usar `any`, no ignorar errores con `@ts-ignore`
- App Router only. No crear archivos en formato Pages Router
- Security headers ya configurados en next.config: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin

**Skills disponibles:**
- Consultar `.claude/skills-reference-arcatierra.md` para referencia completa de 20 skills (8 globales + 12 locales)
- Auditoría detallada del proyecto en `.claude/project-audit.md`

**Lo que NO hay (aún):**
- No hay tests — no intentar correr `npm test`
- No hay Prettier — no intentar correr `npm run format`
- No hay `.env.example` — las variables están documentadas arriba
- La documentación en `docs/`, `audit/`, `reports/` está mayormente obsoleta

---

## Estado actual

- Webhooks MercadoPago requieren reparación (suscripciones atascadas en pending)
- npm audit: 10 vulnerabilidades pendientes (2 critical, 2 high, 3 moderate, 3 low)
- Discrepancia Node.js: `.nvmrc` = 20.18.0, Dockerfile = node:18-alpine
- ~20 archivos .backup dispersos en src/ pendientes de limpieza
- 4 docker-compose alternativos legacy pendientes de archivar o eliminar
