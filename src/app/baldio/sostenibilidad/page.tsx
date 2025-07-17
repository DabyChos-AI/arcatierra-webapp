import { Metadata } from 'next'
import BaldioSustainabilityStory from '@/components/baldio/BaldioSustainabilityStory'
import BaldioChinampasJourney from '@/components/baldio/BaldioChinampasJourney'
import BaldioCallToAction from '@/components/baldio/BaldioCallToAction'

export const metadata: Metadata = {
  title: 'Sostenibilidad en Baldío | Primera Estrella Verde Michelin en México',
  description: 'Conoce nuestro compromiso con la sostenibilidad en Baldío, primer restaurante en México en recibir la prestigiosa Estrella Verde Michelin por nuestras prácticas regenerativas y de cero desperdicio.',
  openGraph: {
    title: 'Sostenibilidad en Baldío | Primera Estrella Verde Michelin en México',
    description: 'Conoce nuestro compromiso con la sostenibilidad en Baldío, primer restaurante en México en recibir la prestigiosa Estrella Verde Michelin por nuestras prácticas regenerativas y de cero desperdicio.',
    url: 'https://arcatierra.com/baldio/sostenibilidad',
    siteName: 'Arca Tierra',
    images: [
      {
        url: '/images/baldio/sostenibilidad_baldio.jpg',
        width: 1200,
        height: 630,
        alt: 'Prácticas sostenibles en Baldío - Estrella Verde Michelin',
      },
    ],
  },
}

export default function BaldioSostenibilidad() {
  return (
    <main>
      <div className="pt-24 bg-gradient-to-br from-green-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-verde-principal mb-6 text-center">
            Sostenibilidad en Baldío
          </h1>
          <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto">
            Descubre por qué somos el primer restaurante en México en recibir la prestigiosa 
            Estrella Verde Michelin, reconocimiento a nuestro compromiso excepcional con 
            la sostenibilidad gastronómica.
          </p>
        </div>
      </div>

      <BaldioSustainabilityStory />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-terracota text-center">
              Nuestro Compromiso con la Tierra
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                En Baldío, entendemos que la gastronomía sostenible va mucho más allá de simplemente 
                usar ingredientes orgánicos. Se trata de un enfoque holístico que considera el 
                impacto ambiental, social y económico de cada decisión que tomamos.
              </p>
              
              <p>
                Nuestra cocina de cero desperdicio está fundamentada en el aprovechamiento máximo 
                de cada ingrediente. Cada parte que tradicionalmente podría considerarse "descarte" 
                se transforma en un elemento valioso: desde fermentos y vinagres hasta salsas y caldos 
                de profundo sabor que potencian nuestros platos.
              </p>
              
              <h3>Trazabilidad Total</h3>
              <p>
                Conocemos el origen exacto de cada ingrediente que utilizamos. Trabajamos directamente 
                con agricultores chinamperos y otros productores locales que comparten nuestra visión 
                de regeneración y cuidado del territorio. Esta conexión directa nos permite garantizar 
                que cada ingrediente no solo sea de la más alta calidad, sino que su producción haya 
                contribuido positivamente a su ecosistema.
              </p>
              
              <h3>Impacto Social</h3>
              <p>
                Nuestra labor va más allá de la cocina. A través de programas educativos y colaboraciones 
                comunitarias, buscamos difundir conocimientos sobre prácticas sostenibles, recuperar técnicas 
                tradicionales y empoderar a los productores locales. Creemos firmemente en la creación de un 
                sistema alimentario más justo y regenerativo.
              </p>
              
              <h3>El Reconocimiento Michelin</h3>
              <p>
                La Estrella Verde Michelin es un reconocimiento que se otorga a restaurantes que se destacan 
                por sus excepcionales prácticas sostenibles. Ser el primer restaurante en México en recibir 
                esta distinción es un honor que nos llena de orgullo y nos motiva a seguir innovando y mejorando 
                nuestro impacto positivo en el planeta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BaldioChinampasJourney />
      <BaldioCallToAction />
    </main>
  )
}
