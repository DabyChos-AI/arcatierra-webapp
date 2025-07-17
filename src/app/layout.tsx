import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import TransparentHeader from "@/components/layout/TransparentHeader";
import Footer from "@/components/Layout/Footer";
import AuthProvider from '@/components/AuthProvider'
import { NotificationProvider } from '@/components/NotificationSystem'
import WhatsAppChat from '@/components/WhatsAppChat'
import ClientLayout from './client-layout'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Arca Tierra | Agricultura regenerativa, chinampas y alimentos agroecológicos",
    template: "%s | ArcaTierra"
  },
  description: "En Arca Tierra regeneramos suelos, conservamos chinampas y producimos alimentos agroecológicos con más de 50 familias campesinas. Conoce quiénes somos.",
  keywords: ["arca tierra", "alimentos mexicanos", "alimentos mexicanos naturales", "chinampas de xochimilco", "agricultura campesina", "productos orgánicos", "agricultura regenerativa", "comercio justo"],
  authors: [{ name: "ArcaTierra" }],
  creator: "ArcaTierra",
  publisher: "ArcaTierra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.arcatierra.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://www.arcatierra.com',
    siteName: 'ArcaTierra',
    title: 'Arca Tierra | Agricultura regenerativa, chinampas y alimentos agroecológicos',
    description: 'En Arca Tierra regeneramos suelos, conservamos chinampas y producimos alimentos agroecológicos con más de 50 familias campesinas.',
    images: [
      {
        url: '/logo-arcatierra.png',
        width: 1200,
        height: 630,
        alt: 'ArcaTierra - Productos Orgánicos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arca Tierra | Agricultura regenerativa, chinampas y alimentos agroecológicos',
    description: 'En Arca Tierra regeneramos suelos, conservamos chinampas y producimos alimentos agroecológicos con más de 50 familias campesinas.',
    images: ['/logo-arcatierra.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preload recursos críticos */}
        <link rel="preload" href="/logo-arcatierra.png" as="image" />
        <link rel="preload" href="/logo-arcatierra-blanco.png" as="image" />
        
        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Viewport meta tag mejorado */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        
        {/* Theme color para navegadores móviles */}
        <meta name="theme-color" content="#B15543" />
        <meta name="msapplication-TileColor" content="#B15543" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Structured Data para la organización */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ArcaTierra",
              "alternateName": "Arca Tierra",
              "description": "Red local de agricultura regenerativa y comercio justo de alimentos mexicanos naturales",
              "url": "https://www.arcatierra.com",
              "logo": "https://www.arcatierra.com/logo-arcatierra.png",
              "foundingDate": "2009",
              "founder": {
                "@type": "Person",
                "name": "Lucio Usobiaga"
              },
              "location": {
                "@type": "Place",
                "name": "Chinampas de Xochimilco",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Xochimilco",
                  "addressRegion": "CDMX",
                  "addressCountry": "MX"
                }
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+52-55-1234-5678",
                "contactType": "customer service",
                "email": "info@arcatierra.com",
                "availableLanguage": ["es-MX"]
              },
              "sameAs": [
                "https://www.facebook.com/arcatierra",
                "https://www.instagram.com/arcatierra"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Productos Orgánicos ArcaTierra",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Canastas de Temporada",
                      "description": "Canastas con productos orgánicos de temporada directamente de las chinampas"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Experiencias Gastronómicas",
                      "description": "Experiencias de turismo rural y gastronómico en las chinampas de Xochimilco"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Catering Consciente",
                      "description": "Servicios de catering con productos agroecológicos para eventos"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-neutro-crema text-verde-tipografia min-h-screen flex flex-col`}>
        <AuthProvider>
          <NotificationProvider>
            {/* Header Transparente */}
            <TransparentHeader />
            
            {/* Contenido Principal envuelto en ClientLayout */}
            <ClientLayout>
              <div className="flex-1">
                {children}
              </div>
            </ClientLayout>
            
            {/* Footer Oficial */}
            <Footer />
            
            {/* WhatsApp Chat Flotante */}
            <WhatsAppChat />
          </NotificationProvider>
        </AuthProvider>
        
        {/* Scripts de análisis y tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Google Analytics 4 placeholder
              // window.dataLayer = window.dataLayer || [];
              // function gtag(){dataLayer.push(arguments);}
              // gtag('js', new Date());
              // gtag('config', 'GA_MEASUREMENT_ID');
              
              // Event tracking para conversiones
              window.addEventListener('load', function() {
                // Track page load
                console.log('ArcaTierra - Page loaded:', window.location.pathname);
                
                // Track CTA clicks
                document.querySelectorAll('a[href*="/tienda"], a[href*="/experiencias"], a[href*="/catering"]').forEach(function(link) {
                  link.addEventListener('click', function() {
                    console.log('ArcaTierra - CTA clicked:', this.href);
                  });
                });
              });
            `
          }}
        />
      </body>
    </html>
  );
}

