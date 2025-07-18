import { Metadata } from 'next'
import BaldioChinampasJourney from '@/components/baldio/BaldioChinampasJourney'
import BaldioCallToAction from '@/components/baldio/BaldioCallToAction'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Nuestras Chinampas | Baldío Restaurante',
  description: 'Descubre el sistema agrícola milenario de chinampas que abastece a nuestro restaurante Baldío. Agricultura regenerativa, ingredientes de temporada y trazabilidad completa.',
  openGraph: {
    title: 'Nuestras Chinampas | Baldío Restaurante',
    description: 'Descubre el sistema agrícola milenario de chinampas que abastece a nuestro restaurante Baldío. Agricultura regenerativa, ingredientes de temporada y trazabilidad completa.',
    url: 'https://arcatierra.com/baldio/chinampas',
    siteName: 'Arca Tierra',
    images: [
      {
        url: '/images/baldio/chinampas_cultivo.jpg',
        width: 1200,
        height: 630,
        alt: 'Chinampas de Baldío - Agricultura regenerativa',
      },
    ],
  },
}

export default function BaldioChinampas() {
  return (
    <main>
      <div className="pt-24 bg-gradient-to-br from-green-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-verde-principal mb-6 text-center">
            Las Chinampas de Baldío
          </h1>
          <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto">
            Un sistema agrícola milenario que nutre nuestra cocina con ingredientes 
            excepcionales, cultivados en armonía con la naturaleza.
          </p>
        </div>
      </div>

      <BaldioChinampasJourney />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-terracota text-center">
              Patrimonio Agrícola Vivo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
              <div>
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <OptimizedImage 
                    src="/images/baldio/chinampas_panoramica.jpg"
                    alt="Panorámica de chinampas" 
                    width={600} 
                    height={400} 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="prose prose-lg">
                <p>
                  Las chinampas son un sistema agrícola milenario desarrollado por las antiguas civilizaciones 
                  mesoamericanas. Estas "islas artificiales" creadas en los lagos de lo que hoy es la Ciudad de 
                  México representan uno de los sistemas agrícolas más productivos y sostenibles del mundo.
                </p>
                <p>
                  En Baldío, hemos recuperado y revitalizado este patrimonio cultural y agrícola, adaptándolo 
                  para satisfacer las necesidades de una cocina de vanguardia comprometida con la sostenibilidad.
                </p>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold mb-6 text-verde-principal">
              El Sistema Chinampero de Baldío
            </h3>
            
            <div className="space-y-8 mb-16">
              <div className="bg-green-50 rounded-xl p-6 border-l-4 border-verde-principal">
                <h4 className="font-bold text-lg mb-2">Biodiversidad</h4>
                <p>
                  Nuestras chinampas albergan más de 50 variedades de cultivos diferentes, muchos de ellos 
                  especies nativas y en peligro que estamos ayudando a conservar. Esta diversidad fortalece 
                  el ecosistema y enriquece nuestra oferta gastronómica.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6 border-l-4 border-verde-principal">
                <h4 className="font-bold text-lg mb-2">Ciclo Cerrado</h4>
                <p>
                  Implementamos un sistema de ciclo cerrado donde los residuos orgánicos del restaurante 
                  regresan a las chinampas como compost de alta calidad, cerrando el ciclo nutrientes 
                  y minimizando nuestro impacto ambiental.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6 border-l-4 border-verde-principal">
                <h4 className="font-bold text-lg mb-2">Gestión Inteligente del Agua</h4>
                <p>
                  El diseño de las chinampas permite un uso extremadamente eficiente del agua, aprovechando 
                  la humedad natural del subsuelo. Complementamos este sistema ancestral con técnicas modernas 
                  de captación de agua de lluvia y riego por goteo cuando es necesario.
                </p>
              </div>
            </div>
            
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold mb-6 text-terracota">
                Del Suelo a tu Plato
              </h3>
              <p className="text-lg text-gray-700">
                La cercanía de nuestras chinampas al restaurante nos permite cosechar ingredientes por la mañana 
                y servirlos ese mismo día, garantizando frescura incomparable y mínima huella de carbono. 
                Esta conexión directa entre cultivo y cocina es el corazón de la experiencia Baldío.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="rounded-lg overflow-hidden">
                  <OptimizedImage 
                    src={`/images/baldio/chinampa_producto_${num}.jpg`}
                    alt={`Producto de chinampa ${num}`} 
                    width={300} 
                    height={300} 
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BaldioCallToAction />
    </main>
  )
}
