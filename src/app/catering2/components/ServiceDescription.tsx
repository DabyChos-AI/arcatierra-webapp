'use client';

import React from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

export default function ServiceDescription() {
  return (
    <section className="py-16 md:py-24 bg-crema-principal">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          {/* Texto descriptivo */}
          <motion.div variants={fadeIn('right', 0.3)}>
            <h2 className="text-3xl md:text-4xl font-bold text-verde-tipografia mb-6">
              Catering consciente con más de 10 años de experiencia
            </h2>
            
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              Queremos estar más cerca de ustedes y sus momentos más especiales. Llevamos hasta ustedes los mejores ingredientes. Nuestra propuesta de catering consciente es única ya que trabajamos con ingredientes 100 por ciento orgánicos, frescos, locales y de temporada.
            </p>
            
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Somos conscientes de que la mejor calidad en alimentos puede tener un impacto positivo en el medio ambiente.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-terracota-principal rounded-full"></div>
                <span className="font-medium">100% Orgánico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-terracota-principal rounded-full"></div>
                <span className="font-medium">Local</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-terracota-principal rounded-full"></div>
                <span className="font-medium">De Temporada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-terracota-principal rounded-full"></div>
                <span className="font-medium">Sostenible</span>
              </div>
            </div>
          </motion.div>
          
          {/* Imagen */}
          <motion.div
            variants={fadeIn('left', 0.3)}
            className="relative h-[500px] rounded-lg overflow-hidden"
          >
            <OptimizedImage
              src="/catering/chef-preparando.jpg"
              alt="Chef preparando platillos con ingredientes orgánicos"
              fill
              className="object-cover rounded-lg"
            />
            
            {/* Badge con años de experiencia */}
            <div className="absolute -bottom-5 -left-5 bg-terracota-principal text-white p-4 rounded-full h-32 w-32 flex flex-col items-center justify-center transform rotate-[-10deg] shadow-xl">
              <span className="text-3xl font-bold">10+</span>
              <span className="text-sm text-center">años de experiencia</span>
            </div>
            
            {/* Badge flotante */}
            <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-verde-tipografia">Agricultura regenerativa</span>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={fadeIn('up', 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 p-8 bg-white rounded-xl shadow-lg max-w-3xl mx-auto text-center"
        >
          <h3 className="text-2xl font-bold text-verde-tipografia mb-4">
            Respaldamos nuestra propuesta con experiencia
          </h3>
          
          <p className="text-gray-700">
            Contamos con un equipo sólido, ingredientes de la más alta calidad y la creatividad para diseñar menús únicos en cualquier tipo de evento: bodas, corporativos, cumpleaños, activaciones, conferencias... 
            ¡Invítanos a servir tu próximo evento!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
