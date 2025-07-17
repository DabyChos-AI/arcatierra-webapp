'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Calendar } from 'lucide-react'

export default function BaldioCallToAction() {
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  }

  return (
    <section ref={ref} className="py-20 px-4 bg-[#3A4741]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center text-white"
        >
          {/* Título principal */}
          <motion.div
            variants={itemVariants}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Reserva Tu Experiencia Verde Michelin
            </h2>
            <p className="text-xl text-[#E3DBCB] max-w-3xl mx-auto leading-relaxed">
              Vive una experiencia gastronómica única en Baldío. Cada reserva es una 
              invitación a descubrir los sabores auténticos de nuestra tierra.
            </p>
          </motion.div>

          {/* Información y reserva */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            {/* Información de contacto */}
            <motion.div
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm p-8 rounded-lg text-left"
            >
              <h3 className="text-2xl font-semibold text-[#E3DBCB] mb-6">Información de Contacto</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="bg-[#B15543] rounded-full p-2 mt-1">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#E3DBCB]">Teléfono</p>
                    <p className="text-white/80">+52 (55) 1234 5678</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-[#B15543] rounded-full p-2 mt-1">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#E3DBCB]">Correo</p>
                    <p className="text-white/80">reservas@baldiorestaurante.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-[#B15543] rounded-full p-2 mt-1">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#E3DBCB]">Dirección</p>
                    <p className="text-white/80">Av. de la Tierra 123, Col. Chinampa<br/>Xochimilco, CDMX, 16600</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-[#B15543] rounded-full p-2 mt-1">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#E3DBCB]">Horario</p>
                    <p className="text-white/80">
                      Martes a Domingo<br/>
                      13:00 - 17:00 | 19:00 - 23:00
                    </p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Llamado a la acción */}
            <motion.div
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm p-8 rounded-lg text-center flex flex-col justify-center"
            >
              <h3 className="text-2xl font-semibold text-[#E3DBCB] mb-6">¿Listo para visitarnos?</h3>
              <p className="text-white/80 mb-8">
                Reserva ahora y prepárate para un viaje gastronómico que despertará todos tus sentidos.
                Tenemos disponibilidad limitada, así que te recomendamos hacer tu reservación con anticipación.
              </p>
              <div className="space-y-4">
                <Link 
                  href="/baldio/reservas" 
                  className="bg-[#B15543] hover:bg-[#B15543]/90 transition-colors text-white px-8 py-3 rounded-md text-lg font-medium inline-flex items-center justify-center w-full"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Hacer reservación
                </Link>
                <Link 
                  href="/baldio/menu" 
                  className="bg-white/10 hover:bg-white/20 transition-colors text-white px-8 py-3 rounded-md text-lg font-medium inline-block w-full"
                >
                  Ver nuestro menú
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
