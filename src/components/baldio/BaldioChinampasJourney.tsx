'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function BaldioChinampasJourney() {
  return (
    <section className="py-20 bg-verde-claro/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-terracota font-medium mb-4">DEL AGUA A LA MESA</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-verde-principal">
            El Viaje de Nuestras Chinampas
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Descubre cómo llevamos los ingredientes más frescos y sostenibles
            de nuestras chinampas directamente a tu mesa, preservando
            tradiciones milenarias con técnicas modernas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Etapa 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl overflow-hidden shadow-lg"
          >
            <div className="relative h-64">
              <Image
                src="/images/baldio/cultivo_en_chinampas.png"
                alt="Cultivo en Chinampas"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-semibold text-xl">Cultivo Ancestral</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Nuestros agricultores utilizan técnicas chinamperas ancestrales,
                un sistema prehispánico reconocido por la UNESCO que maximiza
                la biodiversidad y produce alimentos sin químicos.
              </p>
              <div className="flex items-center text-verde-principal font-medium">
                <span className="mr-2">Agricultura regenerativa</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Etapa 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl overflow-hidden shadow-lg"
          >
            <div className="relative h-64">
              <Image
                src="/images/baldio/seleccion_de_ingredientes.png"
                alt="Selección de Ingredientes"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-semibold text-xl">Selección Minuciosa</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Nuestro equipo trabaja directamente con los chinamperos para seleccionar
                los ingredientes en su punto óptimo. Cada hortaliza es cosechada 
                el mismo día en que llegará a nuestra cocina.
              </p>
              <div className="flex items-center text-verde-principal font-medium">
                <span className="mr-2">Ingredientes de temporada</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Etapa 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-xl overflow-hidden shadow-lg"
          >
            <div className="relative h-64">
              <Image
                src="/images/baldio/cocina_de_baldio.png"
                alt="Cocina de Baldío"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-semibold text-xl">Transformación Culinaria</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                En nuestra cocina, estos ingredientes excepcionales son tratados con respeto
                y transformados en platos innovadores que resaltan sus sabores naturales,
                siguiendo la filosofía de cero desperdicio.
              </p>
              <div className="flex items-center text-verde-principal font-medium">
                <span className="mr-2">Del campo al plato</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <Link 
            href="/baldio/chinampas"
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-oscuro text-white px-8 py-3 rounded-lg transition-colors"
          >
            <span>Conoce más sobre nuestras chinampas</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
