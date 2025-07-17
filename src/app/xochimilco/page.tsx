import type { Metadata } from 'next'
import { MapPin, Calendar, Users, Leaf, Camera, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Chinampas de Xochimilco | Arca Tierra - Patrimonio Agrícola Mexicano',
  description: 'Descubre las chinampas de Xochimilco, patrimonio de la humanidad. Conoce este sistema agrícola ancestral mexicano y cómo Arca Tierra las conserva con agricultura regenerativa.',
  keywords: ['chinampas xochimilco', 'patrimonio humanidad', 'agricultura ancestral', 'sistema agrícola mexicano', 'trajineras xochimilco', 'agricultura prehispánica', 'conservación chinampas'],
  openGraph: {
    title: 'Chinampas de Xochimilco | Arca Tierra - Patrimonio Agrícola Mexicano',
    description: 'Descubre las chinampas de Xochimilco, patrimonio de la humanidad. Sistema agrícola ancestral mexicano conservado por Arca Tierra.',
    url: 'https://www.arcatierra.com/xochimilco',
    images: [
      {
        url: '/chinampas_xochimilco.png',
        width: 1200,
        height: 630,
        alt: 'Chinampas de Xochimilco - Patrimonio agrícola mexicano',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.arcatierra.com/xochimilco',
  },
}

export default function XochimilcoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-[#33503E] text-white py-20">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chinampas de Xochimilco
            </h1>
            <p className="text-xl md:text-2xl text-[#CCBB9A] max-w-3xl mx-auto mb-8">
              Patrimonio de la Humanidad • Sistema Agrícola Ancestral • Conservación Activa
            </p>
            <p className="text-lg max-w-4xl mx-auto">
              Descubre el sistema agrícola más innovador de la época prehispánica, 
              que hoy conservamos y regeneramos para las futuras generaciones.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ¿Qué son las Chinampas? */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">¿Qué son las Chinampas?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un sistema agrícola único en el mundo, desarrollado por nuestros ancestros
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 leading-relaxed mb-6">
                Las chinampas son islas artificiales construidas sobre los lagos de Xochimilco, 
                creadas por los pueblos originarios hace más de 1,000 años. Este ingenioso sistema 
                agrícola convierte zonas lacustres en tierras altamente productivas.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Cada chinampa es una parcela rectangular de tierra fértil, rodeada de canales que 
                proporcionan agua constante y permiten el transporte en trajineras. El sistema 
                combina agricultura, acuacultura y manejo forestal de manera sustentable.
              </p>
              <div className="bg-[#E3DBCB] p-6 rounded-lg">
                <h3 className="font-bold text-[#33503E] mb-3">Reconocimiento UNESCO</h3>
                <p className="text-gray-700 text-sm">
                  En 1987, Xochimilco fue declarado Patrimonio Cultural y Natural de la Humanidad 
                  por la UNESCO, reconociendo su valor histórico, cultural y ecológico único.
                </p>
              </div>
            </div>
            
            <div className="bg-[#CCBB9A] bg-opacity-30 rounded-lg p-8">
              <h3 className="text-xl font-bold text-[#33503E] mb-6">Características Únicas</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-[#B15543] mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Sistema de riego natural por capilaridad</span>
                </li>
                <li className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-[#B15543] mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Suelos extremadamente fértiles y ricos en nutrientes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-[#B15543] mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Microclima ideal para cultivos de alta calidad</span>
                </li>
                <li className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-[#B15543] mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Biodiversidad única con especies endémicas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-[#B15543] mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Captura natural de carbono y purificación del agua</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Historia y Tradición */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Historia y Tradición</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Más de mil años de sabiduría agrícola ancestral
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#33503E] mb-3">Época Prehispánica</h3>
              <p className="text-gray-600 text-sm">
                Los pueblos originarios desarrollan este sistema para cultivar en los lagos 
                del Valle de México, creando una de las agriculturas más productivas del mundo.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#33503E] mb-3">Época Colonial</h3>
              <p className="text-gray-600 text-sm">
                A pesar de los cambios, las chinampas continúan siendo fundamentales para 
                alimentar a la Ciudad de México, adaptándose a nuevas condiciones.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#33503E] mb-3">Actualidad</h3>
              <p className="text-gray-600 text-sm">
                Arca Tierra y las familias chinamperas trabajan para conservar y regenerar 
                este patrimonio, combinando tradición con técnicas modernas sustentables.
              </p>
            </div>
          </div>
        </div>

        {/* El Trabajo de Arca Tierra */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Nuestro Trabajo en las Chinampas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cómo conservamos y regeneramos este patrimonio de la humanidad
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-[#33503E] mb-3">Agricultura Regenerativa</h3>
                <p className="text-gray-700 text-sm">
                  Implementamos técnicas que mejoran la salud del suelo, aumentan la biodiversidad 
                  y capturan carbono, respetando los métodos tradicionales.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-[#33503E] mb-3">Apoyo a Chinamperos</h3>
                <p className="text-gray-700 text-sm">
                  Trabajamos directamente con familias chinamperas, garantizando precios justos 
                  y apoyo técnico para mantener viva esta tradición ancestral.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-[#33503E] mb-3">Conservación del Ecosistema</h3>
                <p className="text-gray-700 text-sm">
                  Protegemos la flora y fauna endémica, incluyendo especies en peligro de extinción 
                  como el ajolote de Xochimilco.
                </p>
              </div>
            </div>

            <div className="bg-[#E3DBCB] rounded-lg p-8">
              <h3 className="text-xl font-bold text-[#33503E] mb-6">Impacto de Nuestro Trabajo</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Chinampas activas:</span>
                  <span className="font-bold text-[#B15543]">25 hectáreas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Familias beneficiadas:</span>
                  <span className="font-bold text-[#B15543]">15 familias</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Especies cultivadas:</span>
                  <span className="font-bold text-[#B15543]">40+ variedades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">CO₂ capturado anual:</span>
                  <span className="font-bold text-[#B15543]">150 toneladas</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "Cada producto que compras de nuestras chinampas contribuye directamente 
                  a la conservación de este patrimonio de la humanidad."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Productos de las Chinampas */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Productos de las Chinampas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Alimentos únicos cultivados en este sistema ancestral
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Verdolagas', description: 'Rica en omega-3 y minerales' },
              { name: 'Quelites', description: 'Hojas verdes tradicionales mexicanas' },
              { name: 'Romeritos', description: 'Planta endémica de gran valor nutricional' },
              { name: 'Berros', description: 'Cultivados en agua pura de manantial' },
              { name: 'Acelgas', description: 'Hojas tiernas y tallos crujientes' },
              { name: 'Espinacas', description: 'Variedades criollas de sabor intenso' },
              { name: 'Lechugas', description: 'Múltiples variedades de textura única' },
              { name: 'Hierbas aromáticas', description: 'Cilantro, perejil, hierbabuena' }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#33503E] mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Experiencias en las Chinampas */}
        <div className="mb-16">
          <div className="bg-[#33503E] text-white rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Vive la Experiencia Chinampa</h2>
              <p className="text-[#CCBB9A] max-w-2xl mx-auto">
                Conoce de primera mano este patrimonio de la humanidad con nuestras experiencias educativas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Camera className="w-12 h-12 text-[#CCBB9A] mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Tour en Trajinera</h3>
                <p className="text-[#CCBB9A] text-sm">
                  Recorre los canales históricos y conoce el sistema de chinampas desde el agua
                </p>
              </div>

              <div className="text-center">
                <Users className="w-12 h-12 text-[#CCBB9A] mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Taller con Chinamperos</h3>
                <p className="text-[#CCBB9A] text-sm">
                  Aprende técnicas ancestrales directamente de las familias que mantienen viva la tradición
                </p>
              </div>

              <div className="text-center">
                <Clock className="w-12 h-12 text-[#CCBB9A] mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Cosecha Participativa</h3>
                <p className="text-[#CCBB9A] text-sm">
                  Participa en la cosecha y llévate productos frescos directamente de la chinampa
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                href="/experiencias"
                className="bg-[#B15543] hover:bg-[#9a4a3a] text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Reservar Experiencia
              </Link>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Ubicación</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Las chinampas de Arca Tierra se encuentran en la zona lacustre de Xochimilco
            </p>
          </div>

          <div className="bg-[#E3DBCB] rounded-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-[#B15543]" />
                  <h3 className="text-xl font-bold text-[#33503E]">Xochimilco, Ciudad de México</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Nuestras chinampas se ubican en la zona de conservación ecológica de Xochimilco, 
                  en el sureste de la Ciudad de México, dentro del área declarada Patrimonio de la Humanidad.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Acceso:</strong> Embarcadero Cuemanco y Embarcadero Fernando Celada</p>
                  <p><strong>Horarios:</strong> Martes a domingo, 9:00 AM - 5:00 PM</p>
                  <p><strong>Transporte:</strong> Metro Tasqueña + Tren Ligero hasta Xochimilco</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-bold text-[#33503E] mb-4">Cómo llegar</h4>
                <ol className="text-sm text-gray-700 space-y-2">
                  <li>1. Metro hasta estación Tasqueña (Línea 2)</li>
                  <li>2. Tren Ligero hasta estación Xochimilco</li>
                  <li>3. Caminar 10 minutos al embarcadero</li>
                  <li>4. Contactar a Arca Tierra para coordinar visita</li>
                </ol>
                <div className="mt-4 p-3 bg-[#E3DBCB] rounded">
                  <p className="text-xs text-gray-600">
                    <strong>Importante:</strong> Las visitas a las chinampas requieren reservación previa 
                    para garantizar la mejor experiencia y el cuidado del ecosistema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#33503E] mb-4">
            Apoya la Conservación de las Chinampas
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Cada producto que compras y cada experiencia que vives contribuye directamente 
            a la conservación de este patrimonio de la humanidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tienda"
              className="bg-[#B15543] hover:bg-[#9a4a3a] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Comprar Productos de Chinampas
            </Link>
            <Link
              href="/experiencias"
              className="border-2 border-[#B15543] text-[#B15543] hover:bg-[#B15543] hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Vivir la Experiencia
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

