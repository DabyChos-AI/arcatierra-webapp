/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para producción
  output: 'standalone',
  
  // Optimizaciones de imagen
  images: {
    domains: [
      'arcatierra.com',
      'www.arcatierra.com',
      'localhost'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://arcatierra.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  },

  // Redirects para SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      {
        source: '/inicio',
        destination: '/',
        permanent: true
      }
    ];
  },

  // Rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health'
      }
    ];
  },

  // Configuración de compresión
  compress: true,

  // Configuración de PWA
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  },

  // Variables de entorno públicas
  env: {
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://arcatierra.com',
    GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  },

  // Configuración experimental
  experimental: {
    serverComponentsExternalPackages: ['pg', 'redis'],
    optimizePackageImports: ['@heroicons/react', 'lucide-react']
  },

  // Configuración de webpack para optimización
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      };
    }

    return config;
  },

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configuración de telemetría
  telemetry: false,
};

module.exports = nextConfig;

