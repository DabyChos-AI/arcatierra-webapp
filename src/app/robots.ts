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
        ],
      },
    ],
    sitemap: 'https://www.arcatierra.com/sitemap.xml',
    host: 'https://www.arcatierra.com',
  }
}

