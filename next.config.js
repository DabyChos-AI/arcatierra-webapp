const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
 output: 'standalone',
  // M6 (R3, 1-oct-2026): sin la cabecera `X-Powered-By: Next.js` (no anunciar el framework).
  poweredByHeader: false,
 eslint: {
    ignoreDuringBuilds: true, // Ignorar ESLint durante el build
  },
  // M5 (R7, 2-oct-2026): el optimizador de imágenes queda prendido (antes `unoptimized: true` «para
  // Netlify»). Sirve AVIF o WebP según lo que acepte el navegador; sharp viene con Node 22 (B2).
  // Las rutas locales (/images/**, /uploads/**) no necesitan patrón. `OptimizedImage` manda
  // `unoptimized` a lo que no esté en esta lista.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      { protocol: 'https', hostname: 'flagcdn.com', pathname: '**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '**' },
      { protocol: 'https', hostname: 'api.dabychos.com', pathname: '/uploads/**' },
    ],
  },
  // Configuración experimental para mejorar la resolución de módulos
  experimental: {
    esmExternals: 'loose',
  },
  // Configuración para suprimir warnings de hidratación causados por extensiones del navegador
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuración de webpack mejorada
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configurar alias de path
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/data': path.resolve(__dirname, 'src/data'),
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
    }
    
    // Configurar extensiones de archivos
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', ...config.resolve.extensions]
    
    // Configurar módulos de resolución
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      'node_modules',
      ...config.resolve.modules
    ]
    
    // Configurar externals para manejar módulos faltantes
    if (!config.externals) {
      config.externals = []
    }
    
    // Agregar el archivo de favicon URLs como externo si no se encuentra
    const originalExternals = config.externals
    config.externals = [...(Array.isArray(originalExternals) ? originalExternals : [originalExternals])]
    
    // Manejar módulos que pueden faltar durante el build
    config.externals.push({
      './webpack-generate-html-favicon-urls': 'commonjs ' + path.resolve(__dirname, 'webpack-generate-html-favicon-urls.js')
    })
    
    // Configurar fallbacks para módulos que pueden faltar
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }
    
    // Optimizar framer-motion para producción
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            framerMotion: {
              name: 'framer-motion',
              chunks: 'all',
              test: /[\/]node_modules[\/]framer-motion[\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    
    return config
  },

  // ── Páginas retiradas (R1 · sesión 41, decisiones de David) ──────────
  // DR2: /experiencias-antigua y /experiencias-privadas; C1 (12:16 UTC): /experiencias-premium, huérfana y con un
  // formulario que fingía enviar. Su código se queda (no se borra nada); el visitante y las ligas viejas llegan a
  // /experiencias. `permanent: true` = 308 (los buscadores cambian la liga guardada).
  async redirects() {
    return [
      { source: '/experiencias-antigua', destination: '/experiencias', permanent: true },
      { source: '/experiencias-privadas', destination: '/experiencias', permanent: true },
      { source: '/experiencias-premium', destination: '/experiencias', permanent: true },
      // R8 (sesión 48, DR22 y M3, decisión de David 2-oct 20:22 UTC): dos pantallas del panel que eran de adorno (Alertas con
      // recomendaciones inventadas; Configuración no guardaba nada). Sus archivos se movieron a ~/vps-stack/_archivo/.
      // Temporal (307): si un día vuelven con datos reales, no queda una redirección guardada en los navegadores.
      { source: '/admin/alertas', destination: '/admin', permanent: false },
      { source: '/admin/configuracion', destination: '/admin', permanent: false },
      // R8, 2.ª ronda (David ≈20:38 UTC): CAT3 /catering2 (copia vieja, sin ligas, su formulario fingía enviar) → /catering;
      // INI1 /admin/inicio (dashboard viejo fuera del menú; su API ya pide `dashboard`) → /admin. Archivos en ~/vps-stack/_archivo/.
      { source: '/catering2', destination: '/catering', permanent: true },
      { source: '/catering2/:ruta*', destination: '/catering', permanent: true },
      { source: '/admin/inicio', destination: '/admin', permanent: false },
      // R9 (sesión 49, decisiones de David 3-oct ≈01:09–01:11 UTC). R9-d: /user-dashboard/* eran pantallas de mentira
      // (reservas, favoritos y recomendaciones inventados) sin pedir sesión, ligadas desde el menú; lo real vive en
      // /usuario/*. R9-b: /admin/qr-codes generaba QR del sistema viejo, que nunca validó (el check-in es «Llegaron» en
      // Mi día y el QR del portal del cliente). Archivos en ~/vps-stack/_archivo/arcatierra-webapp-2026-10-03-r9/.
      { source: '/user-dashboard/reservations', destination: '/usuario/reservas', permanent: true },
      { source: '/user-dashboard', destination: '/usuario/dashboard', permanent: true },
      { source: '/user-dashboard/:ruta*', destination: '/usuario/dashboard', permanent: true },
      { source: '/admin/qr-codes', destination: '/admin', permanent: false },
    ]
  },

  // ── Headers de seguridad ─────────────────────────────────────────────
  // OJO: estos headers vivían en `next.config.ts`, pero Next da precedencia
  // a `.js` sobre `.ts`, así que NUNCA se aplicaron en producción (verificado
  // el 2026-08-04: la respuesta de arcatierra.dabychos.com no traía ninguno).
  // Por eso están aquí y no allá. Si algún día se unifica en un solo archivo,
  // este bloque tiene que viajar con él.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Nadie puede meter el sitio en un iframe (anti-clickjacking).
          { key: 'X-Frame-Options', value: 'DENY' },
          // Equivalente moderno de lo anterior; lo respetan navegadores que
          // ya ignoran X-Frame-Options.
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          // El navegador no adivina el tipo de archivo (anti MIME-sniffing).
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // No filtrar la URL completa a terceros.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Solo HTTPS durante 2 años. Sin `preload` a propósito: eso es una
          // decisión difícil de revertir y hay que pedirla explícitamente.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          // `microphone=(self)` porque la búsqueda por voz lo usa
          // (src/hooks/useVoiceSearch.ts). Cerrarlo la rompería en silencio.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(self), payment=(self)',
          },
        ],
      },
      // ── Service worker de la app instalable (A10, Fase 3) ──────────────
      // Nunca en caché (ni navegador ni Cloudflare): si hay que apagarlo, el kill-switch
      // (`public/sw-apagar.js` copiado sobre `sw.js`) tiene que llegar en la siguiente visita.
      // Entradas aparte: el bloque de seguridad de arriba se sigue aplicando a estos archivos.
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        source: '/sw-apagar.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ]
  },
}

module.exports = nextConfig
