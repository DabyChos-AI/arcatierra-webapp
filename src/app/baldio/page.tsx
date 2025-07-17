import { Metadata } from 'next'
import BaldioHero from '@/components/baldio/BaldioHero'
import BaldioMainContent from '@/components/baldio/BaldioMainContent'
import BaldioGallery from '@/components/baldio/BaldioGallery'
import BaldioSustainabilityStory from '@/components/baldio/BaldioSustainabilityStory'
import BaldioChinampasJourney from '@/components/baldio/BaldioChinampasJourney'
import BaldioCallToAction from '@/components/baldio/BaldioCallToAction'

export const metadata: Metadata = {
  title: 'Baldío Restaurante | Primera Estrella Verde Michelin en México',
  description: 'Baldío es un restaurante galardonado con Estrella Michelin y primera Estrella Verde en México, dedicado a la cocina sostenible con ingredientes de chinampas y cero desperdicio.',
  keywords: 'Baldío restaurante, Estrella Verde Michelin México, cocina sostenible CDMX, cero desperdicio, chinampas, Arca Tierra, restaurante Condesa, cocina de temporada, trazabilidad alimentos',
  openGraph: {
    title: 'Baldío Restaurante | Primera Estrella Verde Michelin en México',
    description: 'Descubre Baldío, el restaurante de Arca Tierra con Estrella Michelin y primera Estrella Verde en México. Cocina sostenible, ingredientes de chinampas y experiencia gastronómica excepcional.',
    url: 'https://arcatierra.com/baldio',
    siteName: 'Arca Tierra',
    images: [
      {
        url: '/images/baldio/exterior_logo_baldio.jpg',
        width: 1200,
        height: 630,
        alt: 'Baldío Restaurante - Primera Estrella Verde Michelin México',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baldío Restaurante | Primera Estrella Verde Michelin México',
    description: 'Descubre el primer restaurante en México con Estrella Verde Michelin, reconocido por sus prácticas sostenibles, ingredientes de chinampas y cocina de cero desperdicio.',
    images: ['/images/baldio/exterior_logo_baldio.jpg'],
  },
  alternates: {
    canonical: 'https://arcatierra.com/baldio',
  },
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": "Baldío Restaurante",
      "description": "Primer restaurante en México con Estrella Verde Michelin. Cocina sostenible con cero desperdicio e ingredientes de chinampas.",
      "url": "https://arcatierra.com/baldio",
      "telephone": "+52-55-XXXX-XXXX",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Arca Tierra, Colonia Condesa",
        "addressLocality": "Ciudad de México",
        "addressRegion": "CDMX",
        "addressCountry": "MX"
      },
      "servesCuisine": "Cocina Mexicana Contemporánea Sostenible",
      "priceRange": "$$$",
      "acceptsReservations": true,
      "hasMenu": "https://arcatierra.com/baldio/menu",
      "award": ["Estrella Michelin", "Estrella Verde Michelin"],
      "starRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "author": {
          "@type": "Organization",
          "name": "Guía Michelin"
        },
        "reviewBody": "Excepcional compromiso con la sostenibilidad y excelencia culinaria."
      },
      "specialties": ["Cocina de cero desperdicio", "Ingredientes de chinampas", "Menú degustación de temporada"],
      "image": "https://arcatierra.com/images/baldio/exterior_logo_baldio.jpg",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "19.4173",
        "longitude": "-99.1682"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "13:00",
          "closes": "23:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Sunday"],
          "opens": "13:00",
          "closes": "18:00"
        }
      ],
      "parentOrganization": {
        "@type": "Organization",
        "name": "Arca Tierra"
      }
    })
  }
}

export default function BaldioPage() {
  return (
    <main className="min-h-screen">
      <BaldioHero />
      <BaldioMainContent />
      <BaldioSustainabilityStory />
      <BaldioChinampasJourney />
      <BaldioGallery />
      <BaldioCallToAction />
    </main>
  )
}
