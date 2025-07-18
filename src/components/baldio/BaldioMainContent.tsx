'use client'

import { motion, useInView } from 'framer-motion'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { useRef, useState, useEffect } from 'react'
import InstagramEmbed from './InstagramEmbed'
import { Leaf, Award, Users, Clock, Coffee, UtensilsCrossed, Wine, X } from 'lucide-react'

export default function BaldioMainContent() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isClient, setIsClient] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const openModal = () => {
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden' // Prevent background scrolling
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = 'auto' // Restore scrolling
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  }

  return (
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-16"
        >
          {/* Sección principal */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-[#B15543] mb-6"
            >
              Una Estrella que Ilumina Nuestro Camino
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-[#3A4741]/80"
            >
              En Baldío, la cocina es nuestra forma de contar historias. Historias de la tierra, 
              de nuestros productores, y de un profundo respeto por los ciclos naturales. 
              Nuestro menú es un homenaje a la riqueza gastronómica mexicana con un enfoque contemporáneo 
              y sostenible que nos ha llevado a recibir una estrella Michelin.
            </motion.p>
          </div>

          {/* Pilares */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Pilar 1 */}
            <motion.div
              variants={itemVariants}
              className="bg-[#E3DBCB]/30 p-8 rounded-lg text-center"
            >
              <div className="bg-[#B15543] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#3A4741] mb-3">Ingredientes Locales</h3>
              <p className="text-[#3A4741]/70">
                Trabajamos con productores locales que comparten nuestra filosofía, 
                priorizando ingredientes de nuestras propias chinampas.
              </p>
            </motion.div>

            {/* Pilar 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-[#E3DBCB]/30 p-8 rounded-lg text-center"
            >
              <div className="bg-[#B15543] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#3A4741] mb-3">Cocina de Autor</h3>
              <p className="text-[#3A4741]/70">
                Cada plato es una expresión creativa que respeta el producto y 
                busca maximizar sus cualidades naturales.
              </p>
            </motion.div>

            {/* Pilar 3 */}
            <motion.div
              variants={itemVariants}
              className="bg-[#E3DBCB]/30 p-8 rounded-lg text-center"
            >
              <div className="bg-[#B15543] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#3A4741] mb-3">Temporalidad</h3>
              <p className="text-[#3A4741]/70">
                Nuestro menú evoluciona con las estaciones, celebrando cada 
                ingrediente en su mejor momento.
              </p>
            </motion.div>

            {/* Pilar 4 */}
            <motion.div
              variants={itemVariants}
              className="bg-[#E3DBCB]/30 p-8 rounded-lg text-center"
            >
              <div className="bg-[#B15543] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#3A4741] mb-3">Cero Desperdicio</h3>
              <p className="text-[#3A4741]/70">
                Aprovechamos cada parte del ingrediente, minimizando el desperdicio 
                y maximizando su potencial.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Nueva sección de experiencia gastronómica */}
        <motion.div
          variants={containerVariants}
          className="mt-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants} className="order-2 lg:order-1">
              <span className="text-[#B15543] font-medium mb-2 block">EXPERIENCIA BALDÍO</span>
              <h3 className="text-3xl font-bold mb-6 text-[#3A4741]">
                Más que una comida, una experiencia sensorial completa
              </h3>
              
              <div className="space-y-6 text-[#3A4741]/80">
                <p>
                  En Baldío, cada visita es una inmersión en la rica biodiversidad de las chinampas y la creatividad
                  de nuestra cocina. Nuestro menú degustación es un viaje por sabores, texturas y aromas que cuentan
                  la historia de nuestro territorio y sus ciclos naturales.
                </p>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="bg-[#E3DBCB]/50 p-3 rounded-lg mr-4">
                    <UtensilsCrossed className="h-6 w-6 text-[#B15543]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A4741]">Menú Degustación</h4>
                    <p className="text-[#3A4741]/70">Un recorrido de 7 tiempos por los sabores de temporada.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#E3DBCB]/50 p-3 rounded-lg mr-4">
                    <Wine className="h-6 w-6 text-[#B15543]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A4741]">Maridaje Único</h4>
                    <p className="text-[#3A4741]/70">Vinos naturales, destilados mexicanos y fermentos artesanales</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#E3DBCB]/50 p-3 rounded-lg mr-4">
                    <Coffee className="h-6 w-6 text-[#B15543]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3A4741]">Experiencias Sensoriales</h4>
                    <p className="text-[#3A4741]/70">Cada plato evoca un momento y una historia de nuestra tierra</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-64 h-64 bg-[#E3DBCB]/50 rounded-full -z-10"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-transform hover:scale-105" onClick={openModal}>
                  <OptimizedImage
                    src="/images/baldio/experienciabaldio.png"
                    alt="Experiencia Baldío - Más que una comida, una experiencia sensorial completa"
                    width={600}
                    height={800}
                    className="w-full h-[800px] object-contain"
                    quality={100}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                      <span className="text-sm font-medium text-gray-800">Click para ampliar</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#B15543]/20 rounded-full -z-10"></div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Modal para imagen ampliada */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <OptimizedImage
                src="/images/baldio/experienciabaldio.png"
                alt="Experiencia Baldío - Más que una comida, una experiencia sensorial completa"
                width={1200}
                height={800}
                className="w-full h-auto object-contain max-h-[80vh]"
                quality={100}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
