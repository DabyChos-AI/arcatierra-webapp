// R15 · F0 (sesión 53, 28-oct-2026; revisado en F0 v2, sesión 57, 29-oct): el interruptor del sitio nuevo (R15-CONTRATO-V2 §7).
//
// Las páginas nuevas viven en `src/app/nuevo/…` y se ven en su dirección pública de siempre (`/`, `/tienda`, …) solo en el
// link de revisión (contenedor con ARCA_SITIO_NUEVO=1): `src/middleware.ts` reescribe la dirección pública a la ruta interna.
// `/nuevo` y `/nuevo/*` pedidos directo responden 404 en los dos contenedores. En producción (sin la variable) nada cambia.
//
// Sin imports: lo usan el middleware (Edge), `SoloSitioActual` (cliente) y el conteo de qa (`~/arcatierra-qa/r15-faltantes.mjs`,
// que lee las direcciones de esta lista). Cada fase agrega aquí sus direcciones; una que no está sigue mostrando la página de hoy,
// también en el link de revisión.
// **Cada dirección nueva va TAMBIÉN en `config.matcher` de `src/middleware.ts`** (Next exige ahí un literal estático): sin eso
// el middleware no corre en esa dirección y el link sigue mostrando la página de hoy. Lo vigila
// `comprobar-matcher-sitio-nuevo.mjs` (qa) contra `.next/server/middleware-manifest.json` de la build.

/** Carpeta de `src/app/` donde viven las páginas nuevas (= el segmento que ve `useSelectedLayoutSegment()` en el layout raíz). */
export const SEGMENTO_SITIO_NUEVO = 'nuevo'

/** Dirección pública → ruta interna del sitio nuevo. F0: solo la portada (página de muestra). */
export const RUTAS_SITIO_NUEVO: Readonly<Record<string, string>> = Object.freeze({
  '/': '/nuevo',
})

/** La ruta interna para una dirección pública, o null si esa dirección sigue con la página de hoy. */
export function rutaInternaSitioNuevo(pathname: string): string | null {
  return Object.prototype.hasOwnProperty.call(RUTAS_SITIO_NUEVO, pathname) ? RUTAS_SITIO_NUEVO[pathname] : null
}

/** `/nuevo`, `/nuevo/…` (y `/nuevo.algo`) pedidos directo: nunca se sirven (404). */
export function esRutaInternaSitioNuevo(pathname: string): boolean {
  const base = `/${SEGMENTO_SITIO_NUEVO}`
  return pathname === base || pathname.startsWith(`${base}/`) || pathname.startsWith(`${base}.`)
}
