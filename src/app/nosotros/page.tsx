import type { Metadata } from 'next'
import { Users, Heart, Leaf, Award, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nosotros | Arca Tierra - Historia, Misión y Equipo',
  description: 'Conoce la historia de Arca Tierra, nuestra misión de regenerar suelos y conservar chinampas con más de 50 familias campesinas. Agricultura regenerativa desde 2009.',
  keywords: ['arca tierra historia', 'agricultura regenerativa', 'chinampas xochimilco', 'familias campesinas', 'comercio justo', 'lucio usobiaga', 'fundador arca tierra'],
  openGraph: {
    title: 'Nosotros | Arca Tierra - Historia, Misión y Equipo',
    description: 'Conoce la historia de Arca Tierra, nuestra misión de regenerar suelos y conservar chinampas con más de 50 familias campesinas.',
    url: 'https://www.arcatierra.com/nosotros',
    images: [
      {
        url: '/logo-arcatierra.png',
        width: 1200,
        height: 630,
        alt: 'Equipo Arca Tierra en las chinampas de Xochimilco',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.arcatierra.com/nosotros',
  },
}

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-[#33503E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#CCBB9A]">
              Nuestra Historia
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Desde 2009, trabajamos con más de 50 familias campesinas para regenerar suelos, 
              conservar chinampas y producir alimentos agroecológicos de la más alta calidad.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Misión y Visión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-[#E3DBCB] rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-[#B15543]" />
              <h2 className="text-2xl font-bold text-[#33503E]">Nuestra Misión</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Regenerar los suelos, conservar las chinampas de Xochimilco y producir alimentos 
              agroecológicos de la más alta calidad, trabajando de la mano con familias campesinas 
              para crear un sistema alimentario justo y sustentable.
            </p>
          </div>

          <div className="bg-[#CCBB9A] bg-opacity-30 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="w-8 h-8 text-[#B15543]" />
              <h2 className="text-2xl font-bold text-[#33503E]">Nuestra Visión</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Ser la red líder en México de agricultura regenerativa y comercio justo, 
              conectando productores locales con consumidores conscientes para crear 
              un futuro más sustentable y equitativo.
            </p>
          </div>
        </div>

        {/* Historia */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Nuestra Historia</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un viaje de más de 15 años trabajando por la agricultura sustentable en México
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2009 - Los Inicios</h3>
                <p className="text-gray-700">
                  Lucio Usobiaga funda Arca Tierra con la visión de rescatar las chinampas de Xochimilco 
                  y crear una red de agricultura sustentable. Comenzamos trabajando con 5 familias campesinas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2012-2015 - Crecimiento</h3>
                <p className="text-gray-700">
                  Expandimos nuestra red a 25 familias productoras. Implementamos técnicas de agricultura 
                  regenerativa y comenzamos a ofrecer experiencias educativas en las chinampas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2018-2020 - Reconocimiento</h3>
                <p className="text-gray-700">
                  Recibimos reconocimientos por nuestro trabajo en conservación de chinampas. 
                  Lanzamos nuestro programa de catering sustentable y alcanzamos 40 familias productoras.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2021-Presente - Innovación</h3>
                <p className="text-gray-700">
                  Hoy trabajamos con más de 50 familias campesinas. Lanzamos nuestra plataforma digital 
                  y expandimos nuestros servicios de suscripciones y entregas sustentables en toda la CDMX.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Nuestros Valores</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los principios que guían nuestro trabajo diario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#33503E] mb-2">Sustentabilidad</h3>
              <p className="text-gray-600 text-sm">
                Cuidamos el medio ambiente en cada decisión que tomamos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#33503E] mb-2">Comercio Justo</h3>
              <p className="text-gray-600 text-sm">
                Pagamos precios justos y apoyamos el desarrollo de las comunidades
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#33503E] mb-2">Calidad</h3>
              <p className="text-gray-600 text-sm">
                Ofrecemos productos de la más alta calidad, frescos y nutritivos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#33503E] mb-2">Transparencia</h3>
              <p className="text-gray-600 text-sm">
                Conoces el origen de cada producto y el impacto de tu compra
              </p>
            </div>
          </div>
        </div>

        {/* Equipo Fundador */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Nuestro Fundador</h2>
          </div>

          <div className="bg-[#E3DBCB] rounded-lg p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-[#33503E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">LU</span>
                </div>
                <h3 className="text-xl font-bold text-[#33503E]">Lucio Usobiaga</h3>
                <p className="text-[#B15543] font-medium">Fundador y Director</p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Lucio Usobiaga es un visionario de la agricultura sustentable en México. Con más de 15 años 
                  de experiencia, ha dedicado su vida a rescatar las chinampas de Xochimilco y crear una red 
                  de comercio justo que beneficie tanto a productores como a consumidores.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Su trabajo ha sido reconocido por organizaciones nacionales e internacionales por su 
                  contribución a la conservación del patrimonio agrícola mexicano y el desarrollo de 
                  sistemas alimentarios sustentables.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Impacto */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Nuestro Impacto</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los números que reflejan nuestro compromiso con la sustentabilidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl font-bold text-[#B15543] mb-2">50+</div>
              <p className="text-gray-600">Familias Campesinas</p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl font-bold text-[#B15543] mb-2">200+</div>
              <p className="text-gray-600">Hectáreas Regeneradas</p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl font-bold text-[#B15543] mb-2">15</div>
              <p className="text-gray-600">Años de Experiencia</p>
            </div>

            <div className="text-center bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl font-bold text-[#B15543] mb-2">5000+</div>
              <p className="text-gray-600">Clientes Satisfechos</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#33503E] text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-white">Únete a Nuestra Misión</h3>
          <p className="text-[#CCBB9A] mb-6 max-w-2xl mx-auto">
            Forma parte de la red de agricultura regenerativa más importante de México. 
            Cada compra que haces apoya directamente a las familias campesinas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tienda"
              className="bg-[#B15543] hover:bg-[#9a4a3a] text-white hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Comprar Productos
            </Link>
            <Link
              href="/xochimilco"
              className="border-2 border-white text-white hover:bg-white hover:text-[#33503E] px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Conocer Chinampas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

