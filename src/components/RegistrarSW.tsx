'use client'

import { useEffect } from 'react'

/**
 * Registra el service worker de la app instalable (A10, Fase 3 de PLAN-EXP-SIN-FALLAS).
 *
 * `public/sw.js` no intercepta nada ni guarda caché: solo existe para que el navegador ofrezca
 * instalar la app. Se registra únicamente en producción (en `npm run dev` un worker estorba el
 * recargado en caliente) y si el navegador lo soporta. `updateViaCache: 'none'` hace que el
 * navegador siempre pida `sw.js` a la red al buscar actualizaciones: así el kill-switch
 * (`public/sw-apagar.js` copiado sobre `sw.js`) llega en la siguiente visita.
 *
 * Si el registro falla (navegador privado, HTTP sin TLS, bloqueo del usuario) la página sigue
 * igual: la app instalable es un extra, nunca una condición para usar el sitio.
 */
export default function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(() => {
        /* sin service worker el sitio funciona igual; no hay nada que avisar */
      })
  }, [])

  return null
}
