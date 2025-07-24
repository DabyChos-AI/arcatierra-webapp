import type { Metadata } from 'next';

// Esta función se ejecuta en el servidor
export async function generateMetadata(): Promise<Metadata> {
  // El catálogo ahora es estático y se carga automáticamente desde productos.ts
  
  const title = 'Tienda de Alimentos Agroecológicos 100% Mexicanos | Arca Tierra';
  const description = 'Alimentos agroecológicos directo del campo mexicano. Compra canastas frescas de Xochimilco, Huasca de Ocampo y Amanalco. Hiperlocalidad regenerativa que apoya a 60+ familias campesinas.';
  const url = 'https://arcatierra.com/tienda';
  const siteName = 'Arca Tierra';
  
  return {
    title,
    description,
    keywords: [
      'productos orgánicos México',
      'alimentos agroecológicos',
      'canastas verduras frescas',
      'agricultura regenerativa',
      'Xochimilco chinampas',
      'Huasca de Ocampo verduras',
      'Amanalco frutas orgánicas',
      'comercio justo campesino',
      'hiperlocalidad alimentaria',
      'suscripción canasta orgánica',
      'trazabilidad alimentos',
      'productores locales México',
      'CDMX delivery orgánico',
      'agricultura sin químicos'
    ].join(', '),
    authors: [{ name: 'Red Arca Tierra' }],
    creator: 'Arca Tierra',
    publisher: 'Red de Agricultura Regenerativa Arca Tierra',
    robots: 'index, follow, max-image-preview:large',
    category: 'Ecommerce Alimentario',
    
    // Open Graph para redes sociales
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: 'website',
      locale: 'es_MX',
      images: [
        {
          url: '/images/tienda-og.jpg',
          width: 1200,
          height: 630,
          alt: 'Canastas de productos orgánicos y agroecológicos Arca Tierra',
        },
        {
          url: '/images/productores-og.jpg',
          width: 1200,
          height: 630,
          alt: 'Agricultores de la Red Arca Tierra en Huasca de Ocampo y Xochimilco',
        },
      ],
    },
    
    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@arcatierra',
      creator: '@arcatierra',
      images: ['/images/tienda-twitter.jpg'],
    },
    
    // Canonical y alternativas
    alternates: {
      canonical: url,
      languages: {
        'es-MX': url,
        'es': url,
      },
    },
    
    // Viewport y mobile
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    
    // Color de tema para navegadores
    themeColor: '#B15543',
    
    // Metadatos adicionales
    other: {
      'geo.region': 'MX-CMX',
      'geo.placename': 'Ciudad de México',
      'geo.position': '19.432608;-99.133209',
      'ICBM': '19.432608, -99.133209',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  };
}

// Este es un componente de servidor que carga los datos
export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
