'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Award, Leaf, Sprout, MapPin } from 'lucide-react'

export default function BaldioHero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Imagen de fondo con parallax */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10"></div>
        <Image 
          src="/images/baldio/exterior_logo_baldio.jpg" 
          alt="Baldío Restaurante" 
          fill 
          className="object-cover object-[70%_40%]"
          sizes="100vw"
          quality={100}
          priority
        />
      </motion.div>

      {/* Contenido superpuesto */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 container mx-auto h-full flex items-center px-4 md:px-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          {/* Badges de Michelin */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Star className="text-green-400" size={16} />
              <span className="text-sm font-medium text-white">Estrella Verde Michelin 2025</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-green-800/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Leaf className="text-green-400" size={16} />
              <span className="text-sm font-medium text-white">Primera Estrella Verde en CDMX</span>
              <Sprout className="text-green-400" size={16} />
            </motion.div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">Baldío Restaurante</h1>
          <p className="text-lg mb-4 text-white/90">Una experiencia gastronómica única que celebra la sostenibilidad y la riqueza de nuestras chinampas con ingredientes de temporada y cero desperdicio.</p>
          
          <div className="flex items-center gap-2 mb-8 text-white/80">
            <MapPin className="w-5 h-5" />
            <a 
              href="https://maps.app.goo.gl/oxatP8cP2kdsWE4j8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-white hover:text-white/90 transition-colors no-underline"
            >
              Baldío Restaurante, Ciudad de México
            </a>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/baldio/menu" className="bg-terracota hover:bg-terracota-oscuro text-white px-6 py-3 rounded-lg transition-colors">
              Ver menú
            </Link>
            <Link href="/baldio/reservas" className="bg-transparent border border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Reservar
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
