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
//
// R15 v2 · F5 (sesión 63, 1-nov; contrato v2 §9-F5 D-F5-03): chinampas (hoy 404; `/xochimilco` sigue con su página de hoy hasta F7, DR-7),
// nosotros, recetas (`/receta/<id>` sigue con su página de hoy, C44), la FAQ (hoy 404; `/experiencias/faq` sigue como hoy, C44), contacto,
// privacidad y términos: siete direcciones exactas, sin prefijos ni excluidos nuevos.
//
// R15 v2 · F6 (sesión 64, 2-nov; contrato v2 §9-F6 D-F6-03): Mi cuenta. Sin sesión, tres exactas públicas (`/auth/signin`, `/auth/recuperar`,
// `/auth/restablecer`). Con sesión, las de `/usuario/…`: ya corren el middleware por el matcher de las protegidas de siempre ('/usuario/:path*',
// que no cambia) y se reescriben solo DESPUÉS de que `withAuth` las deja pasar (src/middleware.ts); el detalle de un pedido es un prefijo de UN
// segmento. Siguen con su página de hoy `/usuario/reservas`, `/usuario/favoritos`, `/crear-cuenta`, `/dashboard`, `/perfil` y `/ordenes`.
//
// R15 v2 · F7 (sesión 65, 5-nov; contrato v2 §9-F7 D-F7-03, D-F7-11, D-F7-15, D-F7-19): lo que se oculta (DR-7: «sale del menú y de Google, la
// dirección vieja lleva a la equivalente o no se muestra, y el código se queda»), SOLO con el interruptor encendido. Tres piezas nuevas, todas por
// clave exacta (una forma codificada sigue como hoy): el sitemap del sitio nuevo (un archivo, no una página), tres direcciones de hoy que llevan a su
// equivalente y las páginas de hoy que siguen respondiendo con `X-Robots-Tag: noindex`. Ninguna página se borra (`cadena/OCULTAS.md` dice cómo
// regresar cada una). Siguen como hoy, sin middleware, las de C44 (`/prensa`, `/entregas`, `/experiencias/faq`, `/catering/contacto`, `/receta/<id>`).

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
  '/chinampas': '/nuevo/chinampas',
  '/nosotros': '/nuevo/nosotros',
  '/recetas': '/nuevo/recetas',
  '/faq': '/nuevo/faq',
  '/contacto': '/nuevo/contacto',
  '/privacidad': '/nuevo/privacidad',
  '/terminos': '/nuevo/terminos',
  '/auth/signin': '/nuevo/auth/signin',
  '/auth/recuperar': '/nuevo/auth/recuperar',
  '/auth/restablecer': '/nuevo/auth/restablecer',
  '/usuario/dashboard': '/nuevo/usuario/dashboard',
  '/usuario/suscripciones': '/nuevo/usuario/suscripciones',
  '/usuario/pedidos': '/nuevo/usuario/pedidos',
  '/usuario/direcciones': '/nuevo/usuario/direcciones',
  '/usuario/perfil': '/nuevo/usuario/perfil',
})

/**
 * Dirección pública que termina en UN segmento que cambia → la ruta interna con el mismo segmento. F3: la ficha de producto; F4: la ficha
 * de una experiencia. `/producto`, `/producto/`, `/productos` y `/producto/a/b` no casan (siguen con lo de hoy); lo mismo con experiencias.
 * F6: el detalle de un pedido de Mi cuenta (`/usuario/pedidos/<id>`; `/usuario/pedidos` es exacta y `/usuario/pedidos/a/b` sigue con lo de hoy).
 */
export const PREFIJOS_SITIO_NUEVO: Readonly<Record<string, string>> = Object.freeze({
  '/producto/': '/nuevo/producto/',
  '/experiencias/': '/nuevo/experiencias/',
  '/usuario/pedidos/': '/nuevo/usuario/pedidos/',
})

/**
 * Segmentos que, debajo de un prefijo, son páginas de hoy y NO pasan al sitio nuevo (se comparan con el segmento ya decodificado, así
 * `/experiencias/%66aq` también sigue con lo de hoy). F4: `/experiencias/faq` y `/experiencias/testimonios` (C44, DR-7).
 */
export const EXCLUIDOS_SITIO_NUEVO: Readonly<Record<string, readonly string[]>> = Object.freeze({
  '/experiencias/': Object.freeze(['faq', 'testimonios']),
})

/**
 * F7 (D-F7-03 a, D-F7-11, D-F7-15 P-7): archivos del sitio nuevo que se sirven en su dirección pública solo encendido. No son páginas: van aparte de
 * RUTAS_SITIO_NUEVO para que quien recorre las páginas (`armazon/ligaActual.ts`, los conteos de qa) no los lea como tales. Hoy `/sitemap.xml` lo sirve
 * `public/sitemap.xml`; el middleware corre antes que `public/`.
 */
export const ARCHIVOS_SITIO_NUEVO: Readonly<Record<string, string>> = Object.freeze({
  '/sitemap.xml': '/nuevo/sitemap.xml',
})

/**
 * F7 (DR-7, D-F7-03 b, D-F7-15): dirección de hoy que el sitio nuevo no trae → su equivalente (redirección temporal del middleware, solo encendido).
 * `/xochimilco` → Chinampas (D-F5-03); `/calendario` → Experiencias (misma compra de fechas y mismo feed, D-F4-12 P-3); `/suscripciones` → el alta de la
 * tienda (D-F3-04, D-F3-22 P-5). `/suscripciones/confirmacion` es otra dirección (RUTAS_SITIO_NUEVO) y no cambia.
 */
export const REDIRECCIONES_SITIO_NUEVO: Readonly<Record<string, string>> = Object.freeze({
  '/xochimilco': '/chinampas',
  '/calendario': '/experiencias',
  '/suscripciones': '/tienda?pestana=canasta-lista',
})

/**
 * F7 (DR-7, C13, D-F4-03, D-F7-15 P-6): páginas de hoy que el sitio nuevo no trae y siguen respondiendo igual, fuera del menú y del sitemap nuevo, con
 * `X-Robots-Tag: noindex` (solo encendido). El Baldío y Restaurantes se siguen alcanzando por «Hacer reservación» (externa) y «Contacto →» de la portada.
 */
export const OCULTAS_SITIO_NUEVO: readonly string[] = Object.freeze([
  '/baldio',
  '/baldio/reservas',
  '/baldio/menu',
  '/baldio/equipo',
  '/baldio/chinampas',
  '/baldio/sostenibilidad',
  '/restaurantes',
  '/blog',
  '/impacto',
  '/experiencias/testimonios',
  '/examples/hero-parallax',
  '/test-responsive',
])

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
  if (Object.prototype.hasOwnProperty.call(ARCHIVOS_SITIO_NUEVO, pathname)) return ARCHIVOS_SITIO_NUEVO[pathname]
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

/** F7: el destino de una dirección de hoy que lleva a su equivalente (con la búsqueda del destino, si la trae), o null. Solo la clave exacta. */
export function redireccionSitioNuevo(pathname: string): string | null {
  return Object.prototype.hasOwnProperty.call(REDIRECCIONES_SITIO_NUEVO, pathname) ? REDIRECCIONES_SITIO_NUEVO[pathname] : null
}

/** F7: la página de hoy sigue respondiendo pero sale de Google (`noindex`). Solo la clave exacta. */
export function esOcultaSitioNuevo(pathname: string): boolean {
  return OCULTAS_SITIO_NUEVO.includes(pathname)
}

/** `/nuevo`, `/nuevo/…` (y `/nuevo.algo`) pedidos directo: nunca se sirven (404). */
export function esRutaInternaSitioNuevo(pathname: string): boolean {
  const base = `/${SEGMENTO_SITIO_NUEVO}`
  return pathname === base || pathname.startsWith(`${base}/`) || pathname.startsWith(`${base}.`)
}
