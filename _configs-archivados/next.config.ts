import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configuración para Docker
  output: 'standalone',
  
  // Configuración de imágenes - OPTIMIZACIÓN ACTIVADA
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'arcatierra.dabychos.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configuración para desarrollo - permitir acceso desde red local
  allowedDevOrigins: ['192.168.31.212'],
  
  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: 'arcatierra',
  },
  
  // Rewrite para servir uploads desde el backend
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://arca-api:8000/uploads/:path*',
      },
    ];
  },

  // Configuración de headers para seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configuración de Webpack para asegurar compatibilidad
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configuraciones adicionales de webpack si es necesario
    return config;
  },
};

export default nextConfig;

