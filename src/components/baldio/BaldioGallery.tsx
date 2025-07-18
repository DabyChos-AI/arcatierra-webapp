'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'

export default function BaldioGallery() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8 }
    }
  }

  const images = [
    {
      src: '/images/baldio/exterior_logo_baldio.jpg',
      alt: 'Exterior de Baldío Restaurante con logo',
      title: 'Nuestro Espacio',
      description: 'Un ambiente acogedor que refleja nuestra filosofía',
      link: 'https://www.baldio.mx/home/'
    },
    {
      src: '/images/baldio/platillo.jpg',
      alt: 'Platillo signature de Baldío',
      title: 'Cocina de Autor',
      description: 'Cada platillo es una obra de arte culinaria',
      link: 'https://www.baldio.mx/menu/'
    },
    {
      src: '/images/baldio/bebida.jpg',
      alt: 'Bebida artesanal de Baldío',
      title: 'Mixología Artesanal',
      description: 'Cócteles únicos con ingredientes locales',
      link: 'https://www.baldio.mx/bebidas/'
    }
  ]

  return (
    <section ref={ref} className="py-16 px-4 bg-[#E3DBCB]/20">
      <div className="container mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-12"
        >
          <div className="text-center">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-[#3A4741] mb-6"
            >
              La Experiencia Baldío
            </motion.h2>
            <motion.div 
              variants={itemVariants}
              className="h-1 w-20 bg-[#B15543] mx-auto mb-8"
            />
            <motion.p 
              variants={itemVariants}
              className="text-[#3A4741]/80 max-w-2xl mx-auto"
            >
              Cada visita a Baldío es un viaje sensorial que combina sabores, texturas y aromas 
              que celebran la riqueza gastronómica mexicana con un toque contemporáneo.
            </motion.p>
          </div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-lg overflow-hidden shadow-md"
              >
                <a 
                  href={image.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block transition-transform hover:scale-105 duration-300"
                >
                  <div className="relative h-64 w-full">
                    <OptimizedImage 
                      src={image.src} 
                      alt={image.alt} 
                      fill 
                      className="object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#3A4741] mb-2">{image.title}</h3>
                    <p className="text-[#3A4741]/70">{image.description}</p>
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
