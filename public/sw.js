/*
 * Service worker de Arca Tierra — A10, Fase 3 de PLAN-EXP-SIN-FALLAS (30-sep-2026).
 *
 * Existe SOLO para que el navegador ofrezca «Instalar la app» / «Agregar a pantalla de inicio»
 * (junto con /manifest.json). A propósito NO hace nada más:
 *
 *   - NO escucha peticiones de red: no intercepta ninguna. El panel (/admin/*), el login
 *     (/api/auth/*), la tienda y los pagos van a la red exactamente como sin service worker.
 *   - NO guarda nada en caché: nunca puede servir una versión vieja del sitio.
 *
 * Si algún día hace falta apagarlo en los teléfonos que ya lo instalaron, NO se borra este
 * archivo (un 404 deja registrado el worker viejo): se copia `public/sw-apagar.js` ENCIMA de
 * este `sw.js` y se despliega. Ver el comentario de `sw-apagar.js`.
 *
 * Lo registra `src/components/RegistrarSW.tsx` (solo en producción) con `updateViaCache: 'none'`,
 * y `next.config.js` lo sirve con `Cache-Control: no-cache, no-store, must-revalidate`, así que
 * cualquier cambio a este archivo llega en la siguiente visita.
 */

self.addEventListener('install', () => {
  // Activa la versión nueva sin esperar a que se cierren las pestañas abiertas.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Toma control de las pestañas abiertas desde ya (no cambia nada: no intercepta peticiones).
  event.waitUntil(self.clients.claim())
})
