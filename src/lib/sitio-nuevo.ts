// R15 · F0 (sesión 53, 28-oct-2026; revisado en F0 v2, sesión 57, 29-oct): el interruptor del sitio nuevo (R15-CONTRATO-V2 §7).
//
// Las páginas nuevas viven en `src/app/nuevo/…` y se ven en su dirección pública de siempre (`/`, `/tienda`, …) solo en el
// link de revisión (contenedor con ARCA_SITIO_NUEVO=1): `src/middleware.ts` reescribe la dirección pública a la ruta interna.
// `/nuevo` y `/nuevo/*` pedidos directo responden 404 en los dos contenedores. En producción (sin la variable) nada cambia.
//
// Sin imports: lo usan el middleware (Edge), `SoloSitioActual` (cliente), `armazon/ligaActual.ts` y el conteo de qa
// (`~/arcatierra-qa/r15-faltantes.mjs` y `comprobar-matcher-sitio-nuevo.mjs`, que leen las direcciones de este archivo).
// Cada fase agrega aquí sus direcciones; una que no está sigue mostrando la página de hoy, también en el link de revisión.
// **Cada dirección nueva va TAMBIÉN en `config.matcher` de `src/middleware.ts`** (Next exige ahí un literal estático): sin eso
// el middleware no corre en esa dirección y el link sigue mostrando la página de hoy. Lo vigila
// `comprobar-matcher-sitio-nuevo.mjs` (qa) contra `.next/server/middleware-manifest.json` de la build.
//
// R15 v2 · F3 (sesión 61, 31-oct; contrato v2 §9-F3 D-F3-04, D-F3-15, D-F3-22): la tienda, el carrito, el checkout y su resultado y la
// confirmación de la suscripción son direcciones exactas; la ficha de producto (`/producto/<itemcode>`) tiene un segmento que cambia y
// va aparte, en los prefijos de abajo. `/suscripciones` sigue con su página de hoy.
//
// R15 v2 · F4 (sesión 62, 1-nov; contrato v2 §9-F4 D-F4-03, D-F4-11 P-3): la lista de experiencias, eventos privados y catering son
// direcciones exactas (`/catering/contacto` sigue con su página de hoy); la ficha de cada experiencia (`/experiencias/<slug>`) es un prefijo de
// UN segmento, salvo `faq` y `testimonios`, que son páginas de hoy y se quedan (C44, DR-7): van en los excluidos de abajo y también fuera
// del matcher de `src/middleware.ts`.

/** Carpeta de `src/app/` donde viven las páginas nuevas (= el segmento que ve `useSelectedLayoutSegment()` en el layout raíz). */
export const SEGMENTO_SITIO_NUEVO = 'nuevo'

/** Dirección pública exacta → ruta interna del sitio nuevo. */
export const RUTAS_SITIO_NUEVO: Readonly<Record<string, string>> = Object.freeze({
  '/': '/nuevo',
  '/tienda': '/nuevo/tienda',
  '/carrito': '/nuevo/carrito',
  '/checkout': '/nuevo/checkout',
  '/checkout/success': '/nuevo/checkout/success',
  '/checkout/pending': '/nuevo/checkout/pending',
  '/checkout/failure': '/nuevo/checkout/failure',
  '/suscripciones/confirmacion': '/nuevo/suscripciones/confirmacion',
  '/experiencias': '/nuevo/experiencias',
  '/eventos': '/nuevo/eventos',
  '/catering': '/nuevo/catering',
})

/**
 * Dirección pública que termina en UN segmento que cambia → la ruta interna con el mismo segmento. F3: la ficha de producto; F4: la ficha
 * de una experiencia. `/producto`, `/producto/`, `/productos` y `/producto/a/b` no casan (siguen con lo de hoy); lo mismo con experiencias.
 */
export const PREFIJOS_SITIO_NUEVO: Readonly<Record<string, string>> = Object.freeze({
  '/producto/': '/nuevo/producto/',
  '/experiencias/': '/nuevo/experiencias/',
})

/**
 * Segmentos que, debajo de un prefijo, son páginas de hoy y NO pasan al sitio nuevo (se comparan con el segmento ya decodificado, así
 * `/experiencias/%66aq` también sigue con lo de hoy). F4: `/experiencias/faq` y `/experiencias/testimonios` (C44, DR-7).
 */
export const EXCLUIDOS_SITIO_NUEVO: Readonly<Record<string, readonly string[]>> = Object.freeze({
  '/experiencias/': Object.freeze(['faq', 'testimonios']),
})

/** Un solo segmento: no vacío, sin «/» ni «\» y que no sea «.» ni «..», tampoco una vez decodificado (y que se pueda decodificar). */
function esUnSegmento(resto: string): boolean {
  if (resto === '' || resto.includes('/')) return false
  let decodificado: string
  try {
    decodificado = decodeURIComponent(resto)
  } catch {
    return false
  }
  return decodificado !== '' && decodificado !== '.' && decodificado !== '..' && !/[/\\]/.test(decodificado)
}

/** La ruta interna para una dirección pública, o null si esa dirección sigue con la página de hoy. */
export function rutaInternaSitioNuevo(pathname: string): string | null {
  if (Object.prototype.hasOwnProperty.call(RUTAS_SITIO_NUEVO, pathname)) return RUTAS_SITIO_NUEVO[pathname]
  for (const [publico, interno] of Object.entries(PREFIJOS_SITIO_NUEVO)) {
    if (!pathname.startsWith(publico)) continue
    const resto = pathname.slice(publico.length)
    if (!esUnSegmento(resto)) return null
    // Una página de hoy debajo del prefijo (F4): sigue con lo de hoy. esUnSegmento ya comprobó que se puede decodificar.
    if ((EXCLUIDOS_SITIO_NUEVO[publico] ?? []).includes(decodeURIComponent(resto))) return null
    // El segmento pasa tal como llegó (sin volver a codificarlo): Next lo decodifica al dárselo a la página.
    return interno + resto
  }
  return null
}

/** `/nuevo`, `/nuevo/…` (y `/nuevo.algo`) pedidos directo: nunca se sirven (404). */
export function esRutaInternaSitioNuevo(pathname: string): boolean {
  const base = `/${SEGMENTO_SITIO_NUEVO}`
  return pathname === base || pathname.startsWith(`${base}/`) || pathname.startsWith(`${base}.`)
}
