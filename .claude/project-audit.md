# Auditoría del Proyecto Arcatierra Webapp

Generado: 2026-02-28
Revisado y confirmado con el equipo sección por sección.

---

## 1. ESTRUCTURA DEL PROYECTO

- **Proyecto único** (no monorepo), ubicado en `~/vps-stack/arcatierra-webapp/`
- **Frontend**: Next.js en `src/` (App Router)
- **Backend**: FastAPI en `~/vps-stack/arca_tierra_api/` (repo/carpeta separada). La carpeta `api/` dentro del repo webapp contiene solo docs de referencia y un main.py legacy.
- **Docker/Infra**: Raíz del proyecto — 5 docker-compose files + 4 Dockerfiles
- **VPS context**: Parte de un stack en `~/vps-stack/` con 20 contenedores activos en red `vps-net`:

| Contenedor | Imagen | Función |
|---|---|---|
| `arcatierra-webapp-new` | Next.js custom | Frontend |
| `arca-api` | FastAPI custom | Backend API |
| `arca-postgres` | pgvector/pgvector:pg16 | BD principal (PostgreSQL 16 + pgvector) |
| `arca-redis` | redis:7-alpine | Cache |
| `traefik` | traefik:latest | Proxy reverso + TLS |
| `n8n` + `n8n-worker` | n8n oficial | Workflow automation |
| `n8n-postgres` + `n8n-redis` | postgres:15 / redis:6 | Infra de n8n |
| `metabase` | metabase v0.48 | BI/Analytics |
| `mxbai-embed-large` | ollama/ollama | Embeddings |
| `searxng` | searxng oficial | Búsqueda |
| `grafana` + `prometheus` | oficiales | Monitoreo |
| `node-exporter` + `postgres-exporter` + `redis-exporter` + `alertmanager` | oficiales | Métricas/Alertas |
| `cloudbeaver` | dbeaver | DB admin web |
| `landing-page` | nginx:alpine | Landing estático |

**No están corriendo** (carpetas existen pero sin contenedor activo): Baserow, Portainer, llama31-chatbot.

### Sugerencias de mejora
- Limpiar la carpeta `api/` del repo webapp: contiene un `main.py` legacy y docs que pueden confundir. Mover los docs útiles a `docs/api/` o eliminarlos si están desactualizados respecto al `arca_tierra_api` real.
- Los docker-compose alternativos (`production`, `integration`, `n8n-gateway`, `enterprise`) son legacy y no se usan. Considerar archivarlos o eliminarlos para evitar confusión.
- Limpiar archivos backup en raíz: `Dockerfile.backup-*` (3 archivos).

---

## 2. PACKAGE.JSON / DEPENDENCIAS

**Scripts disponibles:**
| Script | Comando |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `next lint` |

- **No hay** script de test, format, ni pre-commit hooks
- **Gestor de paquetes**: npm con `legacy-peer-deps=true`
- **Node.js**: 20.18.0 (`.nvmrc`), pero Dockerfile usa `node:18-alpine` (discrepancia)
- **Python backend**: FastAPI 0.104.1 + requirements.txt en `~/vps-stack/arca_tierra_api/` (repo separado, no aplica directamente a este proyecto)

### Sugerencias de mejora
- **Resolver discrepancia de Node.js**: `.nvmrc` dice 20.18.0 pero Dockerfile usa node:18-alpine. Alinear a una versión (preferiblemente node:20-alpine para coincidir con `.nvmrc`).
- **Agregar script de format**: Instalar Prettier y agregar `"format": "prettier --write ."` al package.json.
- **Agregar script de test**: Aunque no hay tests hoy, tener el script listo facilita agregarlos después.
- **Auditar dependencias**: `npm audit` reporta 10 vulnerabilidades (3 low, 3 moderate, 2 high, 2 critical). Ejecutar `npm audit fix` para las que no sean breaking.

---

## 3. FRAMEWORK Y STACK

| Tecnología | Detalle |
|------------|---------|
| Next.js | **15.3.4** — App Router |
| TypeScript | **strict: true** |
| React | 18.3.1 |
| Tailwind CSS | 3.4.14 + tailwindcss-animate |
| UI Components | Radix UI + shadcn/ui + Headless UI |
| State | Zustand 5.0.1 |
| Data fetching | TanStack React Query 5.x |
| Auth | NextAuth 4.24.11 (JWT strategy, Google OAuth + Credentials) |
| Charts | Recharts 3.x |
| Carousel | Embla Carousel + Swiper |
| Animations | Framer Motion 11.x |
| Maps | Leaflet (admin MapPicker) + Google Maps (DeliveryMap checkout) |
| Icons | Lucide React 0.460 |
| ESLint | Flat config (`eslint.config.mjs`), extends `next/core-web-vitals` + `next/typescript` |
| Prettier | **No configurado** |

**Paleta de colores oficiales** (Tailwind customizado):
- Terracota: `#B15543` (principal), `#BA6440` (medio), `#975543` (oscuro)
- Verde: `#33503E` (principal), `#475A52` (claro), `#748880` (suave)
- Neutro: crema `#E3DBCB`, beige `#CCBB9A`, cálido `#DCB584`, gris `#C1CCCE`

**Tipografías oficiales** (custom fonts via CSS variables):
- **Mendoza** (`font-display`, `font-heading`) → Títulos
- **Akkurat** (`font-sans`, `font-body`) → Cuerpo de texto

**Next.js config notable:**
- `output: 'standalone'` (para Docker)
- Image optimization: AVIF + WebP
- Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy

### Sugerencias de mejora
- **Consolidar librerías de carrusel**: Se usan tanto Embla Carousel como Swiper. Evaluar si se puede estandarizar en una sola para reducir bundle size.
- **Consolidar librerías de UI**: Se usan Radix UI + shadcn/ui + Headless UI. Headless UI podría ser redundante si shadcn/ui cubre los mismos casos.
- **Configurar Prettier**: Agregar `.prettierrc` con reglas consistentes y script en package.json.
- **Agregar más security headers**: Considerar Content-Security-Policy (CSP) y Permissions-Policy.

---

## 4. DOCKER Y SERVICIOS

**Archivo activo**: `docker-compose.yml` (el único que importa)
| Servicio | Container | Puerto | Proxy |
|---|---|---|---|
| arcatierra-webapp | arcatierra-webapp-new | 3000 | Traefik → `arcatierra.dabychos.com` |

**Proxy reverso**: Traefik (externo, `~/vps-stack/traefik/`), red `vps-net`

**Dockerfile**: Multi-stage (deps → builder → runner), output standalone, Node 18-alpine

**Otros docker-compose*.yml**: Legacy/referencia, no afectan. No se usan.

**Comando de deploy** (siempre sin cache):
```bash
cd ~/vps-stack/arcatierra-webapp && docker compose build --no-cache && docker compose up -d
```

### Sugerencias de mejora
- **Eliminar o archivar** los 4 docker-compose alternativos que no se usan (`production`, `integration`, `n8n-gateway`, `enterprise`).
- **Eliminar Dockerfiles legacy**: `Dockerfile.backup-*` (3), `Dockerfile.n8n-integration`, `Dockerfile.production`.
- **Alinear Node version** en Dockerfile: cambiar `node:18-alpine` a `node:20-alpine` para coincidir con `.nvmrc`.
- **Agregar script de deploy**: Crear `scripts/deploy.sh` con el comando de build+deploy para no tener que recordarlo.

---

## 5. GIT Y CONVENCIONES

**Ramas:**
- `main` (activa)
- `remotes/origin/optimizacion`

**Convención de commits** (detectada de los últimos 15):
- Patrón dominante: `feat: descripción en inglés` (conventional commits informal)
- Algunos commits sin prefijo: `Fix TypeScript errors...`, `todas las fotos actualizadas`
- No hay convención estricta enforceada

**No hay**: husky, lint-staged, pre-commit hooks, commitlint

**.gitignore**: Excluye node_modules, .next, .env*, .vscode, coverage, proyecto-ejemplo, datos generados (`src/data/productos.js`)

### Sugerencias de mejora
- **Formalizar conventional commits**: Instalar commitlint + husky para enforcer el formato `tipo: descripción`. Tipos: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`.
- **Definir idioma de commits**: Los commits actuales mezclan inglés y español. Elegir uno y mantenerlo.
- **Agregar lint-staged**: Ejecutar ESLint automáticamente en pre-commit solo sobre archivos modificados.
- **Limpiar rama `optimizacion`**: Verificar si se necesita o se puede eliminar.
- **Limpiar archivos .backup** del repo: Hay ~20+ archivos `.backup`, `.backup-responsive`, `.bak` dispersos en `src/`. Considerar eliminarlos del working tree.

---

## 6. VARIABLES DE ENTORNO

**No hay** `.env.example` ni `.env.template`.

**Archivos existentes:**
- `.env.local` — Desarrollo local
- `.env.production` — Producción (usado por docker-compose)

**Variables detectadas** (.env.production, nombres sin valores):

| Variable | Propósito |
|----------|-----------|
| `API_URL` / `NEXT_PUBLIC_API_URL` | Backend FastAPI (arca-api) |
| `INTERNAL_API_URL` / `INTERNAL_API_SECRET` | Comunicación segura inter-servicios |
| `DATABASE_URL` | PostgreSQL (arca-postgres) |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | NextAuth config |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GOOGLE_API_KEY` | Google Maps |
| `MP_ACCESS_TOKEN` / `MP_PUBLIC_KEY` / `NEXT_PUBLIC_MP_PUBLIC_KEY` | MercadoPago credenciales |
| `MP_SUCCESS_URL` / `MP_FAILURE_URL` / `MP_PENDING_URL` / `MP_WEBHOOK_URL` | MercadoPago callbacks |
| `N8N_API_URL` / `N8N_WEBHOOK_URL` | n8n workflows |
| `REDIS_URL` | Redis cache |
| `LLAMA_CHATBOT_URL` | Chatbot LLM |
| `ADMIN_EMAIL` / `DOMAIN` | Config general |
| `TTS_ENABLED` / `VOICE_NOTES_ENABLED` / `CHAT_HISTORY_ENABLED` | Feature flags |
| `AUDIO_STORAGE_PATH` | Almacenamiento de audio |
| `NODE_ENV` | Entorno (production) |

**No hay** validación de env con Zod ni envalid.

### Sugerencias de mejora
- **Crear `.env.example`**: Urgente. Listar todas las variables con valores de ejemplo/placeholder para que cualquier desarrollador pueda configurar el proyecto.
- **Agregar validación de env**: Usar `@t3-oss/env-nextjs` o Zod para validar variables al inicio y fallar temprano si falta alguna.
- **Limpiar variables duplicadas/comentadas**: `.env.production` tiene líneas comentadas como `#API_URL` y `#NEXT_PUBLIC_API_URL` junto a las activas.
- **Documentar qué variables son obligatorias vs opcionales**: Las feature flags (`TTS_ENABLED`, etc.) parecen opcionales, pero las de auth y pago son críticas.

---

## 7. TESTING

- **No hay tests configurados**
- No hay carpeta de tests
- No hay jest, vitest ni pytest config
- No hay script de test en package.json

### Sugerencias de mejora
- **Prioridad alta**: Agregar al menos tests de integración para los flujos críticos: checkout/pagos, autenticación, webhooks de MercadoPago.
- **Framework recomendado**: Vitest (más rápido, compatible nativo con Next.js 15) + Testing Library para componentes.
- **Tests E2E**: Considerar Playwright para flujos completos de checkout y admin.
- **Empezar con lo crítico**: No hace falta 100% coverage de golpe. Cubrir primero: rutas API (`/api/orders`, `/api/webhooks/mercadopago`), middleware de auth, y componentes de checkout.

---

## 8. CONFIGURACIÓN DE CLAUDE CODE

- **No existe CLAUDE.md** en la raíz (lo vamos a crear)
- **No hay** `.claude/settings.json`
- **No hay** `.claude/agents/`
- **Existe** `.claude/skills-reference-arcatierra.md` (249 líneas, referencia completa de 20 skills)
- **12 skills locales** en `.claude/skills/`:
  - api-security-best-practices
  - async-python-patterns
  - audit-website
  - code-review-security
  - email-best-practices
  - fastapi-templates
  - n8n-workflow-patterns
  - next-best-practices
  - security-scanning-security-sast
  - seo-audit
  - stripe-best-practices
  - use-ai-sdk
- **8 skills globales** en `~/.claude/skills/`:
  - systematic-debugging
  - cc-skill-security-review
  - backend-security-coder
  - dockerfile-optimizer
  - devops-engineer
  - postgresql-expert
  - supabase-postgres-best-practices
  - simplify

### Sugerencias de mejora
- **Crear CLAUDE.md**: Este documento. Será el contexto base para todas las sesiones.
- **Crear `.claude/settings.json`**: Configurar permisos por defecto, modelo preferido, y otras settings del proyecto.
- **Evaluar skill de stripe-best-practices**: El proyecto usa MercadoPago, no Stripe. Este skill podría no ser útil aquí.
- **Considerar agregar agents**: Para tareas repetitivas como deploy, auditoría responsive, o revisión de seguridad.

---

## 9. DOCUMENTACIÓN EXISTENTE

- **README.md**: Genérico de create-next-app (no personalizado) — **necesita reescritura**
- **`docs/`**: Reportes de catálogo, migración de fotos, plantillas de recetas, CSVs de productos, datos de catering — **mayormente obsoletos**
- **`audit/`**: 10 archivos de auditoría responsive — **estado desconocido, posiblemente obsoletos**
- **`reports/`**: Reportes de productos sin descripción/foto/precio — **posiblemente obsoletos**
- **`api/`**: 4 docs markdown (API_ENDPOINTS, API_OVERVIEW, DEPLOYMENT_GUIDE, MERCADO_PAGO_INTEGRATION) — **posiblemente desactualizados vs el arca-api real**
- **No hay ADRs**

**PENDIENTE**: La documentación del proyecto necesita una actualización integral. La mayoría de los documentos existentes son obsoletos y no reflejan el estado actual del proyecto.

### Sugerencias de mejora
- **Reescribir README.md**: Con info real del proyecto, cómo levantar dev, cómo deployar, stack, y links a docs relevantes.
- **Auditar y limpiar `docs/`**: Eliminar docs obsoletos, mantener solo lo vigente, organizar por tema.
- **Actualizar docs de API**: Verificar contra los endpoints reales de `arca_tierra_api` y actualizar o marcar como obsoletos.
- **Crear documentación de arquitectura**: Un diagrama de la infraestructura (contenedores, redes, flujos de datos) sería muy útil.
- **Crear `.env.example`**: Documentación viva de las variables necesarias.
- **Considerar ADRs**: Para decisiones importantes futuras (migración de versión, cambio de stack, etc.).

---

## 10. INTEGRACIONES EXTERNAS

| Servicio | Uso detectado |
|----------|---------------|
| **MercadoPago** | Pagos únicos + suscripciones (checkout, webhooks, admin pagos) |
| **n8n** | Webhooks para formularios de contacto, catering, pedidos (workflow automation) |
| **Google OAuth** | Autenticación via NextAuth (Credentials + Google) |
| **Google Maps** | Mapa de validación de dirección de entrega en checkout (`DeliveryMap.tsx`) |
| **Leaflet** | Selector de coordenadas en admin (`MapPicker.tsx`) |
| **PostgreSQL + pgvector** | BD principal (`arca-postgres`, pgvector:pg16) |
| **Redis** | Cache (`arca-redis`, redis:7-alpine) |
| **mxbai-embed-large** | Embeddings para búsqueda semántica (ollama/ollama) |
| **Traefik** | Proxy reverso + TLS automático (Let's Encrypt) |
| **Metabase** | BI/Analytics (conectado a arca-postgres) |
| **SearxNG** | Motor de búsqueda |
| **Grafana + Prometheus** | Monitoreo + métricas (node/postgres/redis exporters + alertmanager) |
| **CloudBeaver** | Admin de BD web |

**No están en uso activo** (carpeta existe pero sin contenedor):
- Baserow, Portainer, llama31-chatbot

**No encontrados en código**:
- Resend, Stripe, Cloudflare, SAP

### Sugerencias de mejora
- **Limpiar servicios inactivos**: Decidir si Baserow, Portainer y llama31-chatbot se van a reactivar o si se pueden eliminar sus carpetas.
- **Documentar flujos de integración**: Crear un diagrama que muestre cómo fluyen los datos entre webapp → arca-api → n8n → PostgreSQL → MercadoPago.
- **Verificar uso real de Redis**: Está corriendo pero no es claro si el frontend lo usa activamente o solo el backend.
- **Verificar uso real de SearxNG y mxbai**: ¿Están integrados en la webapp o son servicios independientes del VPS?
- **Webhook de MercadoPago**: Verificar que `MP_WEBHOOK_URL` apunta al endpoint correcto y que Traefik lo routea bien.
