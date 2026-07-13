# Skills de Claude Code — Referencia Completa

Última actualización: 28 de febrero de 2026. Instalados en VPS Ubuntu 24.04 LTS, usuario `dabycho`, Claude Code v2.1.63.

Se instalaron 20 skills organizados en dos niveles: 8 globales disponibles en todos los proyectos del VPS y 12 locales específicos para el proyecto Arca Tierra. En total suman 430 archivos entre SKILL.md principales, references y resources. Todos los paths y nombres fueron verificados contra los repos de GitHub durante la instalación — varios diferían de lo documentado en skills.sh.

---

## Skills Globales (8)

Ubicación: `~/.claude/skills/` → `/home/dabycho/.claude/skills/`

Estos skills están disponibles en cualquier proyecto que se abra con Claude Code en el VPS. Cubren prácticas transversales de debugging, seguridad, infraestructura y bases de datos que aplican independientemente del stack del proyecto.

### systematic-debugging

Ubicación: `~/.claude/skills/systematic-debugging/` (11 archivos)

Metodología rigurosa de debugging por fases de la colección obra/superpowers. Fase 1: loguear datos en cada límite de componente, verificar propagación de env/config, revisar estado en cada capa y ejecutar una vez para recolectar evidencia. Fase 2: analizar para identificar el componente que falla. Fase 3: investigar ese componente específico con rastreo de causa raíz. Es especialmente útil en fallos que cruzan límites entre servicios, como webhooks que atraviesan proxy → API → base de datos. Usar cuando algo falla y no se sabe dónde está el problema, cuando un servicio devuelve errores intermitentes, o cuando un flujo multi-componente deja de funcionar.

Origen: `github.com/obra/superpowers` → `skills/systematic-debugging/`

### cc-skill-security-review

Ubicación: `~/.claude/skills/cc-skill-security-review/` (1 archivo, 12.4 KB)

Guardia de seguridad continuo que se activa automáticamente al escribir código relacionado con autenticación, input de usuario, endpoints API o credenciales. Cubre gestión de secretos (variables de entorno, sin hardcoding), validación de input (schemas Zod, validación de subida de archivos), prevención de inyección SQL (consultas parametrizadas), mejores prácticas de auth (JWT en cookies httpOnly, RBAC), prevención XSS (DOMPurify, headers CSP), protección CSRF y checklist pre-despliegue. Usar siempre que se trabaje con auth, manejo de input de usuario, creación de endpoints API o gestión de credenciales — se activa de forma autónoma.

Nota: el nombre real del skill es `cc-skill-security-review`, no `security-review` como aparece en skills.sh.

Origen: `github.com/sickn33/antigravity-awesome-skills` → `skills/cc-skill-security-review/`

### backend-security-coder

Ubicación: `~/.claude/skills/backend-security-coder/` (1 archivo, 9.7 KB)

Expertise de seguridad backend cubriendo validación de input, sistemas de autenticación, seguridad API, protección de bases de datos, seguridad de contenedores Docker (usuarios non-root, dropping de capabilities, filesystem read-only), gestión de secretos (HashiCorp Vault, AWS Secrets Manager), seguridad de red, headers de seguridad CSP (HSTS, X-Frame-Options), seguridad de cookies, configuración CORS, consultas parametrizadas, encriptación a nivel de campo y logging de auditoría. Usar cuando se diseñe o revise la seguridad de cualquier backend, cuando se configuren contenedores Docker, o cuando se implementen políticas de headers y CORS.

Origen: `github.com/sickn33/antigravity-awesome-skills` → `skills/backend-security-coder/`

### dockerfile-optimizer

Ubicación: `~/.claude/skills/dockerfile-optimizer/` (1 archivo, 14.0 KB)

Construye imágenes Docker optimizadas, seguras y cache-eficientes. El workflow es: analizar Dockerfile actual, implementar multi-stage builds, optimizar cache de capas, minimizar tamaño de imagen, agregar endurecimiento de seguridad (usuario non-root, permisos mínimos) y configurar health checks. Incluye patrones detallados para Node.js y Python con multi-stage builds, templates `.dockerignore`, configuraciones docker-compose y endurecimiento de seguridad (filesystem read-only, dropping de capabilities, `no-new-privileges`). Usar cuando se creen o modifiquen Dockerfiles, cuando se quiera reducir el tamaño de una imagen, o cuando se necesite endurecer la seguridad de contenedores.

Nota: en el repo de origen este skill está bajo `ci-cd/`, no bajo `skills/`.

Origen: `github.com/patricio0312rev/skills` → `ci-cd/dockerfile-optimizer/`

### devops-engineer

Ubicación: `~/.claude/skills/devops-engineer/` (9 archivos: SKILL.md + 8 references)

Perspectiva de ingeniero DevOps senior cubriendo Build, Deploy y Ops. Incluye pipelines CI/CD (GitHub Actions, GitLab CI), patrones Docker y Docker Compose, Kubernetes, IaC (Terraform, Pulumi), estrategias de despliegue (blue-green, canary, rolling), respuesta a incidentes y monitoreo con Prometheus, Grafana y PagerDuty. Los 8 archivos de references cubren: estrategias de deployment, patrones Docker, GitHub Actions, respuesta a incidentes, Kubernetes, ingeniería de plataforma, release automation y Terraform. Usar cuando se configuren pipelines CI/CD, cuando se necesite monitoreo, cuando se gestionen despliegues, o ante incidentes en producción.

Origen: `github.com/jeffallan/claude-skills` → `skills/devops-engineer/`

### cloudflare

Ubicación: `~/.claude/skills/cloudflare/` (313 archivos: SKILL.md + 312 references en 61 subdirectorios)

Skill oficial de Cloudflare cubriendo toda la plataforma con árboles de decisión para selección de productos. Seguridad: WAF, Protección DDoS, Bot Management, API Shield, Turnstile. Redes: Tunnel (exponer servicios locales sin abrir puertos), Spectrum, Argo Smart Routing. Cómputo: Workers, Containers, Durable Objects. IaC: Pulumi, Terraform, REST API. Observabilidad: Analytics Engine, Web Analytics. Almacenamiento: KV, D1, R2, Queues. Cada uno de los 61 subdirectorios de references contiene documentación específica de un servicio de Cloudflare. Usar cuando se configure cualquier aspecto de Cloudflare: reglas WAF, Tunnels, Workers, Pages, R2, o cualquier otro servicio de la plataforma.

Origen: `github.com/cloudflare/skills` → `skills/cloudflare/`

### supabase-postgres-best-practices

Ubicación: `~/.claude/skills/supabase-postgres-best-practices/` (38 archivos: SKILL.md + AGENTS.md + CLAUDE.md + README.md + 34 references)

El skill PostgreSQL más popular del ecosistema. Ocho categorías de reglas priorizadas: Rendimiento de Consultas [CRÍTICO], Gestión de Conexiones [CRÍTICO], Seguridad y RLS [CRÍTICO], Diseño de Schema [ALTO], Concurrencia y Bloqueos [MEDIO-ALTO], Patrones de Acceso a Datos [MEDIO], Monitoreo y Diagnóstico, y Features Avanzados. Cada regla incluye ejemplos SQL incorrectos/correctos con salida de EXPLAIN. Las 34 references cubren temas como indexación, particionamiento, funciones, triggers, vistas, RLS, y más. Las estrategias de indexación cubren B-tree, GIN y GiST, estos últimos esenciales para búsqueda de similaridad con pgvector. Usar cuando se escriban queries SQL, cuando se diseñen schemas, cuando se configuren índices, cuando se optimice rendimiento de PostgreSQL, o cuando se trabaje con connection pooling.

Nota: el nombre real del skill es `supabase-postgres-best-practices`, no `postgres-best-practices`.

Origen: `github.com/supabase/agent-skills` → `skills/supabase-postgres-best-practices/`

### postgresql-expert

Ubicación: `~/.claude/skills/postgresql-expert/` (1 archivo, 18.1 KB)

Expertise profundo en PostgreSQL cubriendo operaciones JSONB, columnas array, tipos UUID, tipos range, búsqueda full-text con tsvector/tsquery, índices GIN/GiST/BRIN/B-tree, índices parciales, índices de expresión, índices de cobertura, PgBouncer para connection pooling, niveles de aislamiento de transacciones y tuning de rendimiento. Complementa al skill de Supabase con expertise práctico de DBA. Los patrones de búsqueda full-text se integran con pgvector para búsqueda híbrida semántica+keyword. La guía de PgBouncer es esencial para manejar conexiones desde múltiples contenedores Docker al mismo PostgreSQL. Usar cuando se necesite expertise avanzado de PostgreSQL que va más allá de lo básico: JSONB, full-text search, tipos de índice especializados, o tuning fino de rendimiento.

Nota: en el repo de origen este skill está bajo `stdlib/data/`, no bajo `skills/`.

Origen: `github.com/personamanagmentlayer/pcl` → `stdlib/data/postgresql-expert/`

---

## Skills Locales — Proyecto Arca Tierra (12)

Ubicación: `.claude/skills/` → `/home/dabycho/vps-stack/arcatierra-webapp/.claude/skills/`

Estos skills están disponibles solo dentro del proyecto Arca Tierra. Cubren el stack específico del proyecto (FastAPI + Next.js 15), sus integraciones (pagos, email, n8n, AI) y las auditorías de la plataforma. Se versionan con git.

### security-scanning-security-sast

Ubicación: `.claude/skills/security-scanning-security-sast/` (1 archivo, 14.3 KB)

Pipeline SAST completo integrando Bandit (Python), Semgrep, ESLint Security, pip-audit y npm audit. Detecta inyección SQL, XSS, secretos hardcodeados, path traversal, IDOR, CSRF y deserialización insegura en múltiples frameworks incluyendo Django, Flask, React y Express. Soporta reglas Semgrep personalizadas y mapea hallazgos a estándares OWASP y PCI-DSS. Diseñado para automatizar el pipeline de escaneo tanto en el backend FastAPI como en el frontend Next.js simultáneamente. Usar cuando se necesite un escaneo de seguridad automatizado del código, cuando se audite el proyecto contra OWASP, o cuando se quiera verificar que las remediaciones no introdujeron nuevos problemas.

Nota: el nombre real incluye `security-` duplicado: `security-scanning-security-sast`.

Origen: `github.com/sickn33/antigravity-awesome-skills` → `skills/security-scanning-security-sast/`

### code-review-security

Ubicación: `.claude/skills/code-review-security/` (2 archivos: SKILL.md 15.6 KB + scripts/security-scan.py)

Revisa código contra el OWASP Top 10 (2021) con verificaciones específicas para Python/FastAPI y React. Escanea patrones peligrosos de Python (`eval`, `pickle`, `subprocess`, `yaml.load`, SQL crudo, `hashlib.md5`, mala configuración JWT) y problemas específicos de React (`dangerouslySetInnerHTML`, vectores XSS, tokens en localStorage). Genera hallazgos en un `security-review.md` estructurado con severidad, archivo:línea, descripción y pasos de remediación. Incluye un script Python ejecutable en `scripts/security-scan.py` para escaneo automatizado. Usar cuando se revise código antes de un merge, cuando se audite el proyecto contra OWASP Top 10, o cuando se necesite un reporte estructurado de vulnerabilidades.

Origen: `github.com/hieutrtr/ai1-skills` → `skills/code-review-security/`

### api-security-best-practices

Ubicación: `.claude/skills/api-security-best-practices/` (1 archivo, 23.5 KB)

Framework de seguridad API en 5 pasos. Paso 1: Autenticación y Autorización con implementación JWT completa incluyendo refresh tokens, middleware de verificación y protección de rutas. Paso 2: Validación y Sanitización de Input con consultas parametrizadas y validación de schemas. Paso 3: Rate Limiting por usuario/IP con store Redis. Paso 4: Protección de Datos incluyendo HTTPS/TLS, headers seguros y sanitización de errores. Paso 5: Testing OWASP API Top 10. Cubre APIs REST, GraphQL y WebSocket. El patrón de rate limiting basado en Redis mapea directamente a la infraestructura Redis existente de Arca Tierra. Usar cuando se implementen endpoints API nuevos, cuando se configuren JWT y RBAC, cuando se necesite rate limiting, o cuando se valide input de usuario.

Origen: `github.com/sickn33/antigravity-awesome-skills` → `skills/api-security-best-practices/`

### stripe-best-practices

Ubicación: `.claude/skills/stripe-best-practices/` (1 archivo, 5.5 KB)

Skill oficial de Stripe cubriendo CheckoutSessions API, PaymentIntents, facturación de suscripciones, Stripe Connect, integración Payment Element, cumplimiento PCI y manejo de webhooks con verificación de firma. Reglas clave: nunca usar legacy Charges API, preferir checkout hospedado por Stripe, usar el Go Live Checklist antes de producción. Aunque Arca Tierra usa MercadoPago en vez de Stripe, no existe skill de MercadoPago en el ecosistema. Este skill provee patrones de arquitectura de webhooks probados en batalla (verificación de firma, idempotencia, máquinas de estado de suscripciones) que se traducen directamente a reparar los webhooks de MercadoPago. Usar cuando se trabaje con la integración de pagos, cuando se reparen webhooks de MercadoPago, o cuando se implementen flujos de suscripciones.

Origen: `github.com/stripe/ai` → `skills/stripe-best-practices/`

### fastapi-templates

Ubicación: `.claude/skills/fastapi-templates/` (1 archivo, 16.3 KB)

Estructuras de proyecto FastAPI listas para producción. Cubre layout de proyecto recomendado (api/core/models/schemas/services/repositories), setup de SQLAlchemy async engine, gestión de settings con Pydantic, patrón CRUD repository con generics, patrón de capa de servicio, inyección de dependencias para sesiones de base de datos, middleware CORS y eventos de lifespan. Todos los ejemplos usan async/await con AsyncSession. Provee el scaffolding arquitectónico para estructurar o refactorizar el backend FastAPI hacia patrones de producción. Usar cuando se creen nuevos endpoints FastAPI, cuando se refactorice la estructura del backend, cuando se configuren modelos SQLAlchemy async, o cuando se implementen patrones repository/service.

Origen: `github.com/wshobson/agents` → `plugins/api-scaffolding/skills/fastapi-templates/`

### async-python-patterns

Ubicación: `.claude/skills/async-python-patterns/` (1 archivo, 20.7 KB)

Guía integral de Python async cubriendo operaciones I/O concurrentes (base de datos, archivos, red), aplicaciones WebSocket, comunicación de microservicios y tareas en background. Incluye patrones para `asyncio.gather()`, gestión de tasks, manejo de errores, timeouts, context managers async para conexiones de base de datos, rate limiting basado en semáforos y connection pooling con asyncpg. Los patrones asyncpg optimizan el acceso a PostgreSQL y los patrones de semáforo/rate limiting ayudan a proteger endpoints. Usar cuando se escriba código async en FastAPI, cuando se necesiten operaciones concurrentes, cuando se implementen WebSockets, o cuando se optimice el acceso async a PostgreSQL.

Origen: `github.com/wshobson/agents` → `plugins/python-development/skills/async-python-patterns/`

### next-best-practices

Ubicación: `.claude/skills/next-best-practices/` (20 archivos: SKILL.md 4.0 KB + 19 references .md)

Skill oficial de Vercel para Next.js 15+. Cubre convenciones de archivo, límites de React Server Components, patrones async para Next.js 15+, selección de runtime, directivas (`'use client'`/`'use server'`/`'use cache'`), hooks de navegación, manejo de errores, route handlers, metadata e imágenes OG, optimización de imágenes, fuentes, bundling, Suspense boundaries, rutas paralelas e interceptoras, y self-hosting con `output: 'standalone'` para Docker. Los 19 archivos de reference cubren temas individuales en profundidad. La sección de self-hosting aplica directamente al despliegue en contenedor Docker. Usar cuando se trabaje con el frontend Next.js del proyecto, cuando se optimice rendimiento, cuando se configuren Server Components, o cuando se prepare el build para Docker.

Origen: `github.com/vercel-labs/next-skills` → `skills/next-best-practices/`

### use-ai-sdk

Ubicación: `.claude/skills/use-ai-sdk/` (5 archivos: SKILL.md 4.7 KB + 4 references)

Skill oficial del Vercel AI SDK cubriendo selección de modelos, paquetes de proveedores (`@ai-sdk/openai`, `@ai-sdk/anthropic`), agentes type-safe con patrón ToolLoopAgent, integración `useChat` para UIs de chat, embeddings, streaming y el AI Gateway. Provee el hook `useChat` para el frontend Next.js, soporte de embeddings para el pipeline pgvector, y streaming para respuestas en tiempo real. Aunque Arca Tierra usa Ollama como backend, los patrones de arquitectura del SDK (tool-calling, agent loops) informan la implementación del chatbot RAG. Usar cuando se implemente el chatbot RAG, cuando se integre la interfaz de chat en el frontend, cuando se trabaje con embeddings, o cuando se configure streaming de respuestas.

Nota: el nombre real del skill es `use-ai-sdk`, no `ai-sdk`.

Origen: `github.com/vercel/ai` → `skills/use-ai-sdk/`

### n8n-workflow-patterns

Ubicación: `.claude/skills/n8n-workflow-patterns/` (7 archivos: SKILL.md 11.5 KB + 6 extras)

Patrones arquitectónicos probados de workflows n8n reales. Cubre procesamiento de webhooks, integración HTTP API, operaciones de base de datos, workflows de agentes AI y tareas programadas. Los patrones de procesamiento de webhooks ayudan directamente con flujos de notificación de pagos, y los patrones de operaciones de base de datos guían la integración n8n → PostgreSQL. Los archivos extras cubren sintaxis de expresiones n8n, nodos de código (JavaScript y Python), y validación. Usar cuando se creen o modifiquen workflows de n8n, cuando se integren webhooks con n8n, cuando se automaticen sincronizaciones de datos, o cuando se configuren tareas programadas.

Origen: `github.com/czlonkowski/n8n-skills` → `skills/n8n-workflow-patterns/`

### email-best-practices

Ubicación: `.claude/skills/email-best-practices/` (11 archivos: SKILL.md 3.3 KB + 10 resources)

Skill oficial de Resend cubriendo setup SPF/DKIM/DMARC, optimización de deliverability, emails transaccionales (reset de password, OTP, confirmaciones de pedido), captura de email con double opt-in, emails de marketing, cumplimiento CAN-SPAM/GDPR/CASL, confiabilidad de envío (reintentos, idempotencia), procesamiento de eventos webhook y gestión de listas (bounces, quejas, supresión). Los 10 archivos de resources cubren cada tema en detalle. Usar cuando se configuren emails transaccionales con Resend, cuando se implemente email marketing, cuando se configure SPF/DKIM/DMARC para el dominio, o cuando se procesen webhooks de eventos de email.

Nota: el SKILL.md de este skill está en la raíz del repo, no bajo `skills/`.

Origen: `github.com/resend/email-best-practices` → raíz del repo

### seo-audit

Ubicación: `.claude/skills/seo-audit/` (2 archivos: SKILL.md 10.3 KB + 1 reference)

Auditor SEO experto que identifica problemas de SEO técnico y provee recomendaciones accionables cubriendo meta tags, detección de schema (consciente de limitaciones de JSON-LD inyectado por JS), optimización on-page, impacto en Core Web Vitals y cumplimiento de Rich Results. La guía de schema markup ayuda a que páginas de productos y listings de turismo ganen rich snippets. Usar cuando se audite el SEO del sitio, cuando se optimicen meta tags, cuando se implementen datos estructurados (schema.org), o cuando se necesite mejorar Core Web Vitals.

Origen: `github.com/coreyhaines31/marketingskills` → `skills/seo-audit/`

### audit-website

Ubicación: `.claude/skills/audit-website/` (3 archivos: SKILL.md 17.1 KB + 2 extras)

Auditoría integral de sitio web usando squirrelscan CLI con 230+ reglas en 21 categorías: SEO, problemas técnicos, rendimiento, calidad de contenido, seguridad (secretos filtrados, HTTPS, headers de seguridad, contenido mixto), accesibilidad, usabilidad, enlaces, Open Graph, Twitter cards y validación de schema. Soporta modos de scan superficial y profundo con salida optimizada para LLM, scoring de salud (0-100), modo de diff de regresión (para medir mejora entre escaneos) y paralelización automática de correcciones via subagentes. Usar cuando se quiera una auditoría integral del sitio que cubra seguridad, SEO, accesibilidad y rendimiento en una sola pasada, o cuando se quiera medir el progreso de las remediaciones con el modo de diff.

Nota: este skill está en la raíz del repo, no bajo `skills/`.

Origen: `github.com/squirrelscan/skills` → `audit-website/` (raíz)

---

## Referencia Rápida

### Globales (~/.claude/skills/)

| Skill | Archivos | Usar cuando... |
|---|---|---|
| systematic-debugging | 11 | algo falla y no sabes dónde, debugging multi-servicio |
| cc-skill-security-review | 1 | escribas código de auth, input, APIs, credenciales |
| backend-security-coder | 1 | diseñes seguridad backend, Docker, headers, CORS |
| dockerfile-optimizer | 1 | crees o modifiques Dockerfiles |
| devops-engineer | 9 | CI/CD, monitoreo, despliegues, incidentes |
| cloudflare | 313 | configures cualquier servicio de Cloudflare |
| supabase-postgres-best-practices | 38 | queries SQL, schemas, índices, PostgreSQL |
| postgresql-expert | 1 | JSONB, full-text search, PgBouncer, índices avanzados |

### Locales (.claude/skills/)

| Skill | Archivos | Usar cuando... |
|---|---|---|
| security-scanning-security-sast | 1 | escaneo SAST automatizado, auditoría OWASP |
| code-review-security | 2 | revisión de código, reporte de vulnerabilidades |
| api-security-best-practices | 1 | endpoints API, JWT, RBAC, rate limiting |
| stripe-best-practices | 1 | pagos, webhooks MercadoPago, suscripciones |
| fastapi-templates | 1 | estructura FastAPI, SQLAlchemy async, repositories |
| async-python-patterns | 1 | código async, asyncpg, WebSockets, concurrencia |
| next-best-practices | 20 | frontend Next.js 15, Server Components, Docker |
| use-ai-sdk | 5 | chatbot RAG, useChat, embeddings, streaming |
| n8n-workflow-patterns | 7 | workflows n8n, webhooks, sync datos, automatización |
| email-best-practices | 11 | Resend, email transaccional/marketing, SPF/DKIM |
| seo-audit | 2 | SEO técnico, meta tags, schema markup, Core Web Vitals |
| audit-website | 3 | auditoría integral: seguridad + SEO + a11y + rendimiento |

---

## Correcciones vs skills.sh

Durante la instalación se descubrió que 8 skills tenían paths o nombres diferentes a los documentados en skills.sh. Esta tabla sirve como referencia si se necesita reinstalar o actualizar algún skill.

| Nombre en skills.sh | Nombre real | Corrección aplicada |
|---|---|---|
| security-review | cc-skill-security-review | Nombre diferente en el repo |
| dockerfile-optimizer | dockerfile-optimizer | Path real: `ci-cd/`, no `skills/` |
| postgresql-expert | postgresql-expert | Path real: `stdlib/data/`, no `skills/` |
| security-scanning-sast | security-scanning-security-sast | Nombre incluye `security-` extra |
| ai-sdk | use-ai-sdk | Nombre real tiene prefijo `use-` |
| fastapi-templates | fastapi-templates | Path real: `plugins/api-scaffolding/skills/` |
| async-python-patterns | async-python-patterns | Path real: `plugins/python-development/skills/` |
| email-best-practices | email-best-practices | SKILL.md en raíz del repo, no bajo `skills/` |
| audit-website | audit-website | En raíz del repo, no bajo `skills/` |
