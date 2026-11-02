import type { Metadata } from 'next'

// R15 v2 · F6 (acceso): la `metadata` de hoy de /auth/recuperar y /auth/restablecer (sus `layout.tsx` de servidor), reescrita para las páginas
// nuevas (D-F6-09 P-10). La prueba `f6-acceso/pruebas/metadatos-contra-hoy.mjs` la compara con la de hoy. /auth/signin no tiene `metadata`
// propia hoy (página de cliente sin layout): la nueva tampoco.

/** `src/app/auth/recuperar/layout.tsx:4-7`. No se indexa. */
export const METADATA_RECUPERAR: Metadata = {
  title: 'Recuperar contraseña',
  robots: { index: false, follow: false },
}

/**
 * `src/app/auth/restablecer/layout.tsx:5-9`. La URL trae el token de recuperación (una credencial): `referrer: 'no-referrer'` →
 * `<meta name="referrer" content="no-referrer">`, así ninguna liga ni recurso de la página manda la URL con el token en el Referer.
 */
export const METADATA_RESTABLECER: Metadata = {
  title: 'Crear contraseña nueva',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
}
