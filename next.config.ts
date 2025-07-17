import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configuración para Docker
  output: 'standalone',
  
  // Configuración de imágenes
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  
  // Configuración para desarrollo - permitir acceso desde red local
  allowedDevOrigins: ['192.168.31.212'],
  
  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: 'arcatierra',
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

