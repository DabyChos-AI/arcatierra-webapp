import { Metadata } from 'next'
import BaldioMenu from '@/components/baldio/BaldioMenu'
import BaldioCallToAction from '@/components/baldio/BaldioCallToAction'

export const metadata: Metadata = {
  title: 'Menú | Baldío Restaurante | Arca Tierra',
  description: 'Descubre nuestro menú de temporada con estrella Michelin, elaborado con ingredientes locales y técnicas contemporáneas. Incluye secciones de comida, vinos exclusivos y bebidas artesanales.',
  openGraph: {
    title: 'Menú | Baldío Restaurante | Arca Tierra',
    description: 'Descubre nuestro menú de temporada con estrella Michelin, elaborado con ingredientes locales y técnicas contemporáneas. Incluye secciones de comida, vinos exclusivos y bebidas artesanales.',
    url: 'https://arcatierra.com/baldio/menu',
    siteName: 'Arca Tierra',
    images: [
      {
        url: '/images/baldio/menu_header.jpg',
        width: 1200,
        height: 630,
        alt: 'Menú Baldío Restaurante',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  alternates: {
    canonical: 'https://arcatierra.com/baldio/menu',
  },
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Menu",
      "name": "Menú Baldío",
      "description": "Menú de cocina sostenible con ingredientes de nuestras chinampas",
      "url": "https://arcatierra.com/baldio/menu",
      "inLanguage": "es-MX",
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Experiencias",
          "hasMenuItem": [
            {
              "@type": "MenuItem",
              "name": "Experiencia Baldío",
              "description": "Menú degustación completo",
              "offers": {
                "@type": "Offer",
                "price": "1500.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Experiencia Baldío + Maridaje",
              "description": "Maridaje x Tierra de Peña x Bichi",
              "offers": {
                "@type": "Offer",
                "price": "2600.00",
                "priceCurrency": "MXN"
              }
            }
          ]
        },
        {
          "@type": "MenuSection",
          "name": "Entradas",
          "hasMenuItem": [
            {
              "@type": "MenuItem",
              "name": "Focaccia de Maíz",
              "description": "Aceite de cilantro, puré de cebolla con chintextle",
              "offers": {
                "@type": "Offer",
                "price": "180.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Tostada de calabaza",
              "description": "'Guaca brócoli', gusano de maguey, flores chinamperas",
              "offers": {
                "@type": "Offer",
                "price": "220.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Esquites",
              "description": "Epazote & machaca de búfalo",
              "offers": {
                "@type": "Offer",
                "price": "220.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Vegetales Chinamperos",
              "description": "Pipián verde, ajo negro",
              "suitableForDiet": "https://schema.org/VegetarianDiet",
              "offers": {
                "@type": "Offer",
                "price": "300.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Crudo de Pesca del Día",
              "description": "Leche de tigre, salsa macha y pepino",
              "offers": {
                "@type": "Offer",
                "price": "400.00",
                "priceCurrency": "MXN"
              }
            }
          ]
        },
        {
          "@type": "MenuSection",
          "name": "Platos Fuertes",
          "hasMenuItem": [
            {
              "@type": "MenuItem",
              "name": "Tamal y Barbacoa de Hongos",
              "description": "Con guacachile, salsa borracha y acompañamiento de verduras encurtidas",
              "suitableForDiet": "https://schema.org/VegetarianDiet",
              "offers": {
                "@type": "Offer",
                "price": "320.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Trucha Nemi Natura",
              "description": "En su propio caramelo con tomate rostizado",
              "offers": {
                "@type": "Offer",
                "price": "400.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Lomo de Cerdo Pelón Mexicano",
              "description": "Mole de guayaba y hojas de la chinampa",
              "offers": {
                "@type": "Offer",
                "price": "450.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Cerdo Pelón con Mole de Tamarindo",
              "description": "Para taquear en lechugas chinamperas y kimchi casero (para compartir)",
              "offers": {
                "@type": "Offer",
                "price": "600.00",
                "priceCurrency": "MXN"
              }
            }
          ]
        },
        {
          "@type": "MenuSection",
          "name": "Postres",
          "hasMenuItem": [
            {
              "@type": "MenuItem",
              "name": "Helado de Yogurt y Betabel",
              "description": "Betabeles de la chinampa encurtidos, shiso",
              "offers": {
                "@type": "Offer",
                "price": "195.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Helado de horchata",
              "description": "Merengue de elote",
              "offers": {
                "@type": "Offer",
                "price": "195.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Sandwich de chocolate",
              "description": "Mermelada de chipotle",
              "offers": {
                "@type": "Offer",
                "price": "220.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Bizcocho de Maíz",
              "description": "Helado & praline de mezquite, galleta de amaranto, pixtle & rosita de cacao",
              "offers": {
                "@type": "Offer",
                "price": "220.00",
                "priceCurrency": "MXN"
              }
            }
          ]
        },
        {
          "@type": "MenuSection",
          "name": "Extras",
          "hasMenuItem": [
            {
              "@type": "MenuItem",
              "name": "Orden de tostadas",
              "description": "4 piezas",
              "offers": {
                "@type": "Offer",
                "price": "50.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Orden de tortillas",
              "description": "4 piezas",
              "offers": {
                "@type": "Offer",
                "price": "50.00",
                "priceCurrency": "MXN"
              }
            },
            {
              "@type": "MenuItem",
              "name": "Orden de focaccia de maíz",
              "description": "",
              "offers": {
                "@type": "Offer",
                "price": "90.00",
                "priceCurrency": "MXN"
              }
            }
          ]
        }
      ],
      "provider": {
        "@type": "Restaurant",
        "name": "Baldío Restaurante",
        "servesCuisine": "Cocina Mexicana Contemporánea Sostenible",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Arca Tierra, Colonia Condesa",
          "addressLocality": "Ciudad de México",
          "addressRegion": "CDMX",
          "addressCountry": "MX"
        },
        "telephone": "+52-55-XXXX-XXXX"
      }
    })
  }
}

export default function BaldioMenuPage() {
  return (
    <main className="min-h-screen">
      <div className="py-28 px-4 bg-[#3A4741] text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Nuestro Menú</h1>
          <p className="text-xl text-[#E3DBCB] max-w-2xl mx-auto">
            Una exploración gastronómica que evoluciona con la temporada y honra los sabores de nuestra tierra
          </p>
        </div>
      </div>
      <BaldioMenu />
      <BaldioCallToAction />
    </main>
  )
}
