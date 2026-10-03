import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/checkout/',
          '/auth/',
          '/mis-pedidos/',
          '/mis-reservas/',
          '/perfil/',
          '/_next/',
          '/private/',
          // R9 (G1): el link del portal del cliente es una credencial; nunca se indexa (la página también lleva noindex).
          '/reserva/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/checkout/',
          '/auth/',
          '/mis-pedidos/',
          '/mis-reservas/',
          '/perfil/',
          '/reserva/',
        ],
      },
    ],
    sitemap: 'https://www.arcatierra.com/sitemap.xml',
    host: 'https://www.arcatierra.com',
  }
}

