/*
 * KILL-SWITCH del service worker de Arca Tierra — A10, Fase 3 de PLAN-EXP-SIN-FALLAS (30-sep-2026).
 *
 * Este archivo NO se registra nunca. Está listo por si el service worker (`public/sw.js`) llegara
 * a dar problemas en los teléfonos que ya instalaron la app.
 *
 * Cómo se usa (emergencia):
 *   1. cp public/sw-apagar.js public/sw.js      (se copia ENCIMA; NO se borra sw.js: un 404
 *                                                deja registrado el worker viejo para siempre)
 *   2. build --no-cache + up -d de la webapp.
 *   3. En la siguiente visita el navegador baja el sw.js nuevo (se sirve con no-store y se
 *      registra con updateViaCache: 'none'), éste se instala, se DESREGISTRA y recarga las
 *      pestañas abiertas, que quedan sin service worker.
 *   4. Para volver a tener la app instalable, se restaura el sw.js normal (git) y se despliega.
 *
 * Mientras sw.js sea este kill-switch, `RegistrarSW.tsx` lo vuelve a registrar en cada visita
 * y él se vuelve a desregistrar: es inofensivo (no intercepta nada ni guarda caché).
 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // claim primero: `navigate()` solo funciona en pestañas controladas por este worker.
      await self.clients.claim()
      await self.registration.unregister()
      const clientes = await self.clients.matchAll({ type: 'window' })
      // Recarga cada pestaña para que quede sin service worker.
      await Promise.all(
        clientes.map((cliente) => cliente.navigate(cliente.url).catch(() => undefined))
      )
    })()
  )
})
