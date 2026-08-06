const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
 output: 'standalone',
 eslint: {
    ignoreDuringBuilds: true, // Ignorar ESLint durante el build
  },
  images: {
    unoptimized: true, // Deshabilitar optimización para Netlify
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
    ]
  },
}

module.exports = nextConfig
