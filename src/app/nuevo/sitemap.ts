import type { MetadataRoute } from 'next'

// R15 v2 · F7 (ocultas, sesión 65; contrato v2 §9-F7 D-F7-03 a, D-F7-11, D-F7-15 P-2/P-4): el sitemap del sitio nuevo. Next lo sirve en
// `/nuevo/sitemap.xml` (ruta de metadatos en un segmento), que pedido directo da 404 (src/middleware.ts); el middleware lo sirve en `/sitemap.xml`
// SOLO con el interruptor encendido (ARCHIVOS_SITIO_NUEVO). Apagado, `/sitemap.xml` sigue siendo `public/sitemap.xml` (producción no cambia).
// Solo `url`: no hay un dato real de fecha, frecuencia ni prioridad (D-F7-15 P-2). Las fichas de producto y de experiencia no van: pedirían la API
// en el servidor (D-F7-15 P-4, a TASK-LIST para el lanzamiento).

/** El dominio de hoy (`src/app/sitemap.ts:4`, `src/app/robots.ts` sitemap y host). */
const DOMINIO = 'https://www.arcatierra.com'

/** Las páginas del sitio nuevo que se listan (cada una está en RUTAS_SITIO_NUEVO; lo prueba `probar-sitemap-f7`). */
export const EN_EL_SITEMAP: readonly string[] = Object.freeze([
  '/',
  '/tienda',
  '/experiencias',
  '/eventos',
  '/catering',
  '/chinampas',
  '/nosotros',
  '/recetas',
  '/faq',
  '/contacto',
  '/privacidad',
  '/terminos',
])

/**
 * Las direcciones de RUTAS_SITIO_NUEVO que NO se listan, con su razón: el carrito, el checkout y su resultado, la confirmación de la suscripción,
 * entrar y Mi cuenta (D-F7-03 a; el robots de hoy ya bloquea `/checkout/`, `/auth/` y `/usuario/`). Una dirección nueva tiene que caer en una de las dos.
 */
export const FUERA_DEL_SITEMAP: readonly string[] = Object.freeze([
  '/carrito',
  '/checkout',
  '/checkout/success',
  '/checkout/pending',
  '/checkout/failure',
  '/suscripciones/confirmacion',
  '/auth/signin',
  '/auth/recuperar',
  '/auth/restablecer',
  '/usuario/dashboard',
  '/usuario/suscripciones',
  '/usuario/pedidos',
  '/usuario/direcciones',
  '/usuario/perfil',
])

export default function sitemap(): MetadataRoute.Sitemap {
  return EN_EL_SITEMAP.map((direccion) => ({ url: direccion === '/' ? DOMINIO : `${DOMINIO}${direccion}` }))
}
