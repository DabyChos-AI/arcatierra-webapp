# Resumen Ejecutivo — Auditorías Arcatierra

**Fecha:** 2026-02-28
**Reportes analizados:** 4 (Website General, SEO, SAST, OWASP Review)
**Herramienta:** squirrelscan v0.0.38 | Páginas escaneadas: 19

---

## 1. Score General de Salud

| Reporte | Score | Calificación |
|---|---|---|
| **Website General** | **42/100** | F |
| **SEO / Performance (mobile)** | **10-25/100** | Catastrófico |
| **SAST (Seguridad)** | **87/100 riesgo** (42 vulnerabilidades) | Alto |
| **OWASP** | 3 Critical, 5 High, 6 Medium | Débil |

### Desglose Website General (42/100)

| Categoría | Score |
|---|---|
| Accessibility | 72/100 |
| Content | 52/100 |
| Core SEO | 76/100 |
| Performance | 82/100 |
| Images | 69/100 |
| Links | 59/100 |
| Crawlability | 82/100 |
| Security | 75/100 |
| E-E-A-T | 86/100 |
| Internationalization | 100/100 |
| Legal Compliance | 100/100 |
| Local SEO | 100/100 |
| Mobile | 100/100 |
| Structured Data | 100/100 |
| Social Media | 100/100 |
| URL Structure | 100/100 |

**Totales:** 1250 passed, 283 warnings, 123 failed.

**Veredicto:** El sitio tiene problemas serios en seguridad y rendimiento. La parte de contenido/legal/mobile/structured data está bien (100/100 en varias categorías), pero las áreas críticas están muy comprometidas.

---

## 2. Top 5 Problemas de Seguridad Más Críticos

| # | Problema | Archivo | Impacto |
|---|---|---|---|
| 1 | **Webhook MercadoPago sin verificación HMAC** — acepta requests de cualquier fuente | `src/app/api/webhooks/mercadopago/route.ts` | Fraude de pagos: cualquiera puede falsificar notificaciones de pago |
| 2 | **Secret de NextAuth hardcodeado** — fallback `'development-secret-key'` | `src/lib/auth-config.ts:238` | Si falta el env var, cualquiera puede forjar sesiones JWT |
| 3 | **Endpoint de debug expuesto en producción** sin autenticación | `src/app/api/debug-orders/route.ts` | Expone datos de pedidos, crea usuarios y preferencias de pago |
| 4 | **Payment webhook acepta cualquier Bearer token** — solo verifica que el string `'Bearer'` exista | `src/app/api/webhooks/payment/route.ts:8-13` | Bypass trivial de autenticación |
| 5 | **Cart API sin autenticación + IDOR** — cualquiera accede al carrito de otro usuario por email | `src/app/api/cart/route.ts` | Lectura/modificación del carrito de cualquier usuario |

### Hallazgos adicionales de seguridad (HIGH)

| # | Problema | Archivo |
|---|---|---|
| 6 | INTERNAL_API_SECRET enviado en query string (visible en logs) | `src/lib/auth-config.ts:169-175` |
| 7 | Refresh token enviado en query string | `src/lib/auth-config.ts:15` |
| 8 | Cart Add sin auth + mass assignment | `src/app/api/cart/add/route.ts` |
| 9 | Creación de suscripciones sin autenticación | `src/app/api/subscriptions/crear/route.ts` |
| 10 | Admin operations sin auth headers | `src/app/admin/productos/page.tsx`, `src/app/admin/calendario/page.tsx` |
| 11 | Admin proxy solo verifica que exista sesión, no verifica rol admin | `src/lib/admin-api-helper.ts:11-23` |
| 12 | Middleware no protege `/api/*` ni `/usuario/*` | `src/middleware.ts:52-58` |
| 13 | Orders API sin auth ni rate limiting | `src/app/api/orders/route.ts` |
| 14 | Sin Content Security Policy (CSP) | `next.config.ts` |
| 15 | Next.js 15.3.4 con 6 CVEs conocidos (RCE, SSRF, DoS) | `package.json` |
| 16 | Swiper con vulnerabilidad de prototype pollution | `package.json` |
| 17 | OAuth permite registro con password vacío | `src/lib/auth-config.ts:128-139` |
| 18 | Admin check enumera emails de empleados | `src/components/header/NavigationConfig.tsx:155` |
| 19 | `Math.random()` para IDs de orden | `src/app/api/orders/route.ts` |

---

## 3. Top 5 Problemas de SEO con Mayor Impacto

| # | Problema | Impacto estimado |
|---|---|---|
| 1 | **Homepage pesa 53 MB** — `OptimizedImage` usa `<img>` raw en vez de `next/image` (afecta 60 archivos). LCP >8 segundos en mobile | Core Web Vitals en rojo = penalización Google. Performance mobile: 10-25/100 |
| 2 | **5 páginas principales sin metadata** (home, experiencias, suscripciones, contacto, restaurantes) — todas son `'use client'` y no pueden exportar metadata | Google muestra títulos genéricos. CTR en SERPs devastado |
| 3 | **Sin Schema.org Product ni Event** en páginas de detalle (`/producto/[id]`, `/experiencias/[slug]`) | Sin rich results en Google — cero snippets enriquecidos para productos y eventos |
| 4 | **Sitemap apunta a dominio incorrecto** (645 URLs a `www.arcatierra.com`) + `public/sitemap.xml` estático sobreescribe el dinámico | Google indexa URLs equivocadas; solo 9 URLs en sitemap vs 40+ reales |
| 5 | **Reviews fabricadas/hardcodeadas** en schema de tienda (4.8/5, 127 reviews) | Viola políticas de Google — riesgo de penalización manual |

### Problemas SEO adicionales

- **Títulos duplicados:** 10 páginas comparten solo 2 títulos únicos
- **Descripciones duplicadas:** mismo patrón — 10 páginas comparten 2 descripciones
- **Sin H1:** `/tienda`, `/experiencias`, `/suscripciones` y variantes de categoría
- **Múltiples H1:** homepage tiene 4 H1 tags
- **Contenido delgado:** 9 páginas con <300 palabras (tienda: 55 palabras, experiencias: 54)
- **19 links rotos internos:** `/sustentabilidad`, `/legal/privacidad`, `/legal/terminos`, `/legal/cookies` (404 en todas las páginas)
- **Canonical URLs inconsistentes:** mezcla de `www.arcatierra.com` y `arcatierra.com`
- **`google-site-verification` con placeholder** — no es un código real
- **Schema Organization duplicado** — inyectado por `layout.tsx` Y `Footer.tsx`
- **Datos contradictorios** en schemas: `foundingDate` dice "2009" en un lugar y "2019" en otro

### Performance / Core Web Vitals (estimados homepage mobile)

| Métrica | Valor estimado | Target | Estado |
|---|---|---|---|
| **LCP** | >8-15s en 4G | <2.5s | FAIL |
| **FCP** | ~2-4s en 4G | <1.8s | FAIL |
| **CLS** | >0.25 | <0.1 | FAIL |
| **TBT** | ~500-1000ms | <200ms | FAIL |
| **TTFB** | 89ms | <800ms | PASS |

**Proyección después de fixes:**

| Fase | Score estimado |
|---|---|
| Después de P0 (imágenes) | 50-65 / 100 |
| Después de P0 + P1 | 70-85 / 100 |
| Después de todos los fixes | 85-95 / 100 |

---

## 4. Archivos Más Problemáticos (aparecen en múltiples reportes)

| Archivo | Reportes | Hallazgos principales |
|---|---|---|
| **`src/lib/auth-config.ts`** | SAST, OWASP | Secret hardcodeado, secret en query string, refresh token en URL, OAuth con password vacío (4 issues) |
| **`src/app/api/webhooks/mercadopago/route.ts`** | SAST, OWASP | Sin verificación HMAC, sin rate limiting, URLs hardcodeadas (4 issues) |
| **`src/app/api/orders/route.ts`** | SAST, OWASP | Sin auth, Math.random() para IDs, error details expuestos, sin rate limiting (4 issues) |
| **`src/app/api/debug-orders/route.ts`** | SAST, OWASP | Debug en producción sin auth, leak de errores internos (4 issues) |
| **`src/app/api/cart/route.ts` + `cart/add/`** | SAST, OWASP | Sin auth, IDOR, mass assignment, error leaks (3 issues c/u) |
| **`src/middleware.ts`** | SAST, OWASP | No protege `/api/*` ni `/usuario/*`, employee check bypassable (2 issues) |
| **`src/app/page.tsx`** | Website, SEO | `'use client'`, 4 H1 tags, 53MB de imágenes, sin metadata |
| **`src/components/ui/OptimizedImage.tsx`** | SEO | Usado en 60 archivos, bypassa `next/image` completamente |
| **`src/components/layout/Footer.tsx`** | Website, SEO | 4 links rotos en todas las páginas, schema Organization duplicado, Microdata mezclado |
| **`src/app/layout.tsx`** | Website, SEO | Schema duplicado, teléfono placeholder, datos contradictorios, meta tags en body |
| **`next.config.ts`** | SAST, Website | Sin CSP, sin HSTS, config conflictiva (3 issues) |
| **`package.json`** | SAST | Next.js con 6 CVEs, Swiper con prototype pollution (3 issues) |
| **`src/app/tienda/page.tsx`** | Website, SEO | Reviews fabricadas en schema, sin H1, contenido delgado, título duplicado |
| **`src/app/experiencias/page.tsx`** | Website, SEO | Sin metadata, sin H1, contenido delgado |
| **`src/app/suscripciones/page.tsx`** | Website, SEO | Sin metadata, sin H1, contenido delgado |
| **`src/app/producto/[id]/page.tsx`** | SEO | Sin metadata, sin Product schema |
| **`src/app/experiencias/[slug]/page.tsx`** | SEO | Sin metadata, sin Event schema |
| **`src/components/header/MobileMenu.tsx`** | Website | Botón mobile sin aria-label (accesibilidad, todas las páginas) |

---

## 5. Quick Wins vs Cambios Grandes

### Quick Wins — Seguridad (15-30 min total, elimina los vectores de ataque más graves)

| # | Acción | Esfuerzo | Severidad |
|---|---|---|---|
| 1 | Eliminar fallback `\|\| 'development-secret-key'` en `auth-config.ts:238` | 2 min | CRITICAL |
| 2 | Eliminar `src/app/api/debug-orders/route.ts` completo | 2 min | CRITICAL |
| 3 | Validar token real en webhook payment (no solo substring `'Bearer'`) | 10 min | CRITICAL |
| 4 | Mover secret interno de query string a header en `auth-config.ts` | 15 min | HIGH |
| 5 | Requerir sesión autenticada en Cart API | 15 min | HIGH |
| 6 | Agregar `/usuario/:path*` y `/api/admin/:path*` al matcher del middleware | 10 min | HIGH |
| 7 | Reemplazar `Math.random()` con `crypto.randomUUID()` en orders | 5 min | MEDIUM |
| 8 | Eliminar fallback token `'demo'` en `useDashboard.ts` | 5 min | MEDIUM |
| 9 | Eliminar error details de respuestas JSON (orders, debug-orders, cart/add) | 10 min | HIGH |

### Quick Wins — SEO y Performance (15-30 min total)

| # | Acción | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | Eliminar `public/robots.txt` y `public/sitemap.xml` estáticos | 2 min | HIGH |
| 2 | Eliminar reviews fabricadas del schema en `/tienda` | 5 min | CRITICAL |
| 3 | Quitar `loading="lazy"` de logos above-the-fold + agregar `fetchpriority="high"` al hero | 5 min | HIGH |
| 4 | Agregar preconnect para Google Fonts en `layout.tsx` | 5 min | MEDIUM |
| 5 | Agregar `aria-label` al botón mobile del header | 5 min | MEDIUM |
| 6 | Agregar label al input de email del footer | 5 min | MEDIUM |
| 7 | Agregar `<h1>` a `/tienda`, `/experiencias`, `/suscripciones` | 10 min | MEDIUM |
| 8 | Corregir datos contradictorios en schemas (foundingDate, emails, teléfonos) | 10 min | MEDIUM |
| 9 | Eliminar schema Organization duplicado de `Footer.tsx` | 10 min | MEDIUM |
| 10 | Poner código real en `google-site-verification` | 2 min | MEDIUM |

### Cambios Grandes — Seguridad (requieren diseño y testing)

| # | Acción | Esfuerzo | Severidad |
|---|---|---|---|
| 1 | **Implementar verificación HMAC** en webhook MercadoPago | 4-6 hrs | CRITICAL |
| 2 | **Actualizar Next.js** de 15.3.4 a 15.5.12+ (6 CVEs incluyendo RCE) | 4-6 hrs | CRITICAL |
| 3 | **Agregar autenticación** a cart, subscriptions, orders API | 1 día | HIGH |
| 4 | **Verificar rol admin** en `admin-api-helper.ts` (no solo existencia de sesión) | 4-6 hrs | HIGH |
| 5 | **Implementar CSP + HSTS headers** en `next.config.ts` | 4-6 hrs | HIGH |
| 6 | **Agregar CSRF protection** en endpoints mutativos | 4-6 hrs | MEDIUM |
| 7 | **Implementar rate limiting** en auth, orders, webhooks | 4-6 hrs | MEDIUM |
| 8 | **Mover JWT de localStorage a httpOnly cookies** | 4-6 hrs | MEDIUM |
| 9 | **Reemplazar 50+ URLs hardcodeadas** `https://api.dabychos.com` con env var | 2-4 hrs | MEDIUM |
| 10 | **Actualizar Node.js** de 18-alpine (EOL) a 20-alpine en Dockerfile | 2-4 hrs | MEDIUM |

### Cambios Grandes — SEO y Performance (impacto transformacional)

| # | Acción | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | **Reemplazar `OptimizedImage` con `next/image`** en 60 archivos | 1-2 días | CRITICAL (LCP -5-10s, page weight -95%) |
| 2 | **Comprimir/redimensionar imágenes** (49 MB → ~2 MB) | 2-4 hrs | CRITICAL |
| 3 | **Agregar Product schema + `generateMetadata`** a `/producto/[id]` | 4-6 hrs | CRITICAL |
| 4 | **Agregar Event schema + `generateMetadata`** a `/experiencias/[slug]` | 4-6 hrs | CRITICAL |
| 5 | **Convertir homepage de `'use client'` a Server Component** | 1-2 días | HIGH (FCP -1-2s, TBT -300ms) |
| 6 | **Agregar metadata custom a 5+ páginas client** (patrón server wrapper + client) | 1-2 días | HIGH |
| 7 | **Corregir canonical URLs** en todas las páginas (dominio consistente) | 2-4 hrs | HIGH |
| 8 | **Agregar dynamic imports** para HeroSlideshow, CategorySlider, CanastasGrid | 4-6 hrs | MEDIUM |
| 9 | **Convertir fonts a WOFF2 + subset** Latin | 2-3 hrs | MEDIUM |
| 10 | **Corregir 19 links rotos** internos (crear páginas faltantes o actualizar links) | 4-8 hrs | MEDIUM |
| 11 | **Agregar schemas** BreadcrumbList, WebSite+SearchAction, ItemList | 1 día | MEDIUM |

---

## 6. Áreas Limpias (lo que está bien)

Los reportes también identificaron áreas que **pasan correctamente**:

- No hay `eval()`, `exec()`, `new Function()` ni inyección de comandos
- No hay SQL directo — todo va por API al backend
- `.env` files correctamente en `.gitignore`
- TypeScript strict mode habilitado
- Docker corre como non-root user
- CORS defaults correctos (same-origin)
- Admin proxy y user-facing APIs (`direcciones`, `dashboard`) sí verifican sesión
- Password hashing delegado al backend (bcrypt)
- Token refresh logic funciona correctamente
- Internacionalización, Legal Compliance, Mobile, Local SEO: 100/100
- TTFB: 89ms (excelente)

---

## 7. Plan de Acción Recomendado

### Fase 1: Emergencia (1-2 días)
Atacar los quick wins de seguridad — eliminar el debug endpoint, el secret hardcodeado, y el webhook bypass. Estas son vulnerabilidades explotables hoy.

### Fase 2: Seguridad Estructural (1 semana)
Implementar HMAC en MercadoPago, agregar auth a APIs desprotegidas, actualizar Next.js, configurar CSP/HSTS, refactorizar middleware.

### Fase 3: Performance (1 semana)
Reemplazar `OptimizedImage` con `next/image`, comprimir imágenes, agregar dynamic imports, convertir fonts a WOFF2.

### Fase 4: SEO (1-2 semanas)
Agregar metadata a todas las páginas, implementar Product/Event schemas, corregir sitemap y canonicals, corregir H1s y contenido delgado, eliminar reviews fabricadas.

### Fase 5: Pulido (1 semana)
Accesibilidad (aria-labels, form labels), links rotos, schemas adicionales (BreadcrumbList, WebSite), cache headers optimizados.

---

*Generado a partir del análisis cruzado de 4 reportes de auditoría (website, SEO, SAST, OWASP) del 2026-02-28.*
