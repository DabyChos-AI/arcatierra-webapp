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
    <div className="min-h-screen bg-white pt-[88px]">
      {/* Hero Section */}
      {/* pt-[88px] = 28px banner + 60px header */}
      <div className="bg-[#33503E] text-white pt-14 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#CCBB9A]">
              Nuestra Historia
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Misión y Visión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="bg-[#E3DBCB] rounded-lg p-6 sm:p-8">
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

          <div className="bg-[#CCBB9A] bg-opacity-30 rounded-lg p-6 sm:p-8">
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
        <div className="mb-12 md:mb-16">
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
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2010</h3>
                <p className="text-gray-700">
                  Arca Tierra nació en Xochimilco con las primeras entregas de alimentos cultivados en chinampas a restaurantes de la Ciudad de México. A partir de una pequeña red de diez familias productoras, comenzó un movimiento para recuperar la agricultura local y revalorar los ingredientes del territorio.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2011–2013</h3>
                <p className="text-gray-700">
                  Se implementó la primera chinampa modelo, integrando nuevas técnicas agroecológicas y diversificando los cultivos. El trabajo con las familias chinamperas se consolidó en el Grupo Chapín, una organización campesina que marcó el inicio de una red colaborativa. En esos años, los productos de Arca Tierra llegaron a más de 20 restaurantes de la ciudad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2014–2016</h3>
                <p className="text-gray-700">
                  Nace Iniciativa Agroecológica Xochimilco, A.C. como aliado clave en la misión de promover saberes y prácticas agroecológicas para dignificar la vida campesina. La red creció con fuerza: más chinampas en producción, un servicio de canastas agroecológicas a domicilio y los primeros talleres de capacitación para familias campesinas dentro y fuera de Xochimilco. En esta etapa, Arca Tierra comenzó a colaborar con comunidades de Hidalgo y otras regiones, ampliando su impacto más allá del Valle de México.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2017–2019</h3>
                <p className="text-gray-700">
                  Se implementaron los primeros biofiltros para limpiar el agua de los canales y se consolidó una red de más de 30 familias campesinas. Además de aumentar la producción de alimentos, se recuperaron chinampas abandonadas y se fortaleció la conexión entre productores y consumidores a través de experiencias educativas y cenas comunitarias.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2020–2022</h3>
                <p className="text-gray-700">
                  Durante los años más desafiantes, Arca Tierra en conjunto con Iniciativa Agroecológica Xochimilco, A.C. impulsó el programa de Comidas Solidarias, apoyando a hospitales, albergues y familias campesinas. En 2022 se puso en marcha la Escuela Campesina, un espacio de formación para jóvenes del campo que buscan regenerar sus territorios. La red siguió creciendo y sumó nuevas chinampas recuperadas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#B15543] rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#33503E] mb-2">2023–2025</h3>
                <p className="text-gray-700 mb-4">
                  Con más de 18 chinampas restauradas, 60 familias campesinas en la red y 300 hogares en la CDMX recibiendo canastas agroecológicas cada semana, Arca Tierra se ha consolidado como un modelo de agricultura regenerativa y comercio justo.
                </p>
                <p className="text-gray-700 mb-4">
                  La Escuela Campesina ha formado ya tres generaciones de estudiantes, y nuevos proyectos como las chinampas agroforestales medicinales y la colaboración con la UNAM fortalecen su compromiso con la ciencia, la educación y la sostenibilidad.
                </p>
                <p className="text-gray-700 mb-4">
                  En 2024, Arca Tierra abrió Baldío, su restaurante en Xochimilco, concebido como un espacio vivo para conectar la cocina con el campo. Baldío celebra el trabajo campesino, los ingredientes locales y la creatividad culinaria que surge cuando se cocina en diálogo con la tierra.
                </p>
                <p className="text-gray-700">
                  Hoy, Arca Tierra participa en redes internacionales de conservación, como Cultivating Resilience de World Monuments Fund, y continúa su misión de restaurar la relación entre las personas, los alimentos y la tierra.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-12 md:mb-16">
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
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33503E] mb-4">Nuestro Fundador</h2>
          </div>

          <div className="bg-[#E3DBCB] rounded-lg p-6 sm:p-8 max-w-4xl mx-auto">
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
                  de experiencia, ha dedicado su vida a recuperar las chinampas de Xochimilco y crear una red 
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
        <div className="mb-12 md:mb-16">
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
        <div className="bg-[#33503E] text-white rounded-lg p-6 sm:p-8 text-center">
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
            {/* Botón Conocer Chinampas - OCULTO por solicitud
            <Link
              href="/xochimilco"
              className="border-2 border-white text-white hover:bg-white hover:text-[#33503E] px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Conocer Chinampas
            </Link>
            */}
          </div>
        </div>
      </div>
    </div>
  )
}

