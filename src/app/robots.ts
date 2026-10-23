import { MetadataRoute } from 'next'

// ROB1 (R11b, DR57 con el OK de David, 22-oct-2026): el ÚNICO robots del sitio. Hasta R11a producción servía
// `public/robots.txt` (ganaba sobre este archivo y sus bloqueos solo aplicaban a Slurp); se borró. Un grupo para todos con
// los bloqueos; no cambia si el sitio se indexa (IDX1 es de David) ni el sitemap/host.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard',
          '/checkout/',
          '/auth/',
          '/usuario/',
          '/perfil',
          // R9 (G1): el link del portal del cliente es una credencial; nunca se indexa (la página también lleva noindex).
          '/reserva/',
          '/mis-*',
        ],
      },
    ],
    sitemap: 'https://www.arcatierra.com/sitemap.xml',
    host: 'https://www.arcatierra.com',
  }
}
