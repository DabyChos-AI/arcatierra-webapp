# Configs de Next archivados — 2026-08-04

Aquí vivían 4 archivos de configuración de Next que **no se usaban**, junto con
`next.config.js` que sí. Next da precedencia `.js > .mjs > .ts`, así que el `.js`
ganaba siempre y todo lo declarado en los demás se ignoraba en silencio.

Eso causó un bug real: los headers de seguridad (X-Frame-Options,
X-Content-Type-Options, Referrer-Policy) estaban escritos en `next.config.ts`,
el `CLAUDE.md` los daba por configurados, y **en producción no existía ninguno**.
Se movieron a `next.config.js` el 2026-08-04.

**El único config válido es `next.config.js` en la raíz.** No recrear estos.

## Qué había en cada uno

| Archivo | Qué tenía que el `.js` no tiene |
|---|---|
| `next.config.ts` | headers de seguridad (YA MIGRADOS), `images.formats` AVIF/WebP + deviceSizes/imageSizes, rewrite de `/uploads` (redundante: existe `src/app/uploads/[...path]`), `env.CUSTOM_KEY`, `allowedDevOrigins` |
| `next.config.production.ts` | variante del anterior, nunca referenciada por package.json ni el Dockerfile |
| `next.config.ts.bak` / `.backup-20251209` | respaldos viejos |

## Pendiente que quedó anotado

`next.config.js` tiene `images.unoptimized: true` con el comentario
"Deshabilitar optimización para Netlify" — pero el despliegue es Docker en VPS,
no Netlify. Eso apaga la optimización de imágenes de Next (AVIF/WebP,
redimensionado), que el `CLAUDE.md` da por activa. Encenderla es una mejora de
rendimiento real, pero exige revisar `remotePatterns` primero o las imágenes de
dominios no listados empiezan a dar 400. **No se tocó en esta sesión.**
