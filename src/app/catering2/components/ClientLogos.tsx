'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

// Lista de clientes del CSV
const CLIENTS = [
  "Rólex", 
  "Google", 
  "Spotify", 
  "Santander", 
  "Waverley Street Foundation", 
  "Fundación Herdez", 
  "Mandoka", 
  "CENTRO"
];

export default function ClientLogos() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeIn('up', 0.3)}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-verde-tipografia mb-6">
            Clientes que confían en nosotros
          </h2>
          <div className="w-16 h-1 bg-terracota-principal mx-auto mb-6"></div>
        </motion.div>
        
        {/* Logos de clientes con efecto hover */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center items-center">
          {CLIENTS.map((client, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn('up', 0.1 * (index + 1))}
              className="w-full"
            >
              <div 
                className="bg-gray-50 h-24 flex items-center justify-center rounded-lg px-4
                           hover:shadow-lg transition-all duration-300 group"
              >
                <p className="text-gray-600 font-semibold text-lg text-center
                              group-hover:text-terracota-principal transition-colors duration-300">
                  {client}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Estadísticas */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeIn('up', 0.5)}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          <div className="text-center p-4">
            <p className="text-4xl font-bold text-terracota-principal">10+</p>
            <p className="text-gray-600">Años de experiencia</p>
          </div>
          <div className="text-center p-4">
            <p className="text-4xl font-bold text-terracota-principal">500+</p>
            <p className="text-gray-600">Eventos realizados</p>
          </div>
          <div className="text-center p-4">
            <p className="text-4xl font-bold text-terracota-principal">100%</p>
            <p className="text-gray-600">Ingredientes orgánicos</p>
          </div>
          <div className="text-center p-4">
            <p className="text-4xl font-bold text-terracota-principal">50+</p>
            <p className="text-gray-600">Productores locales</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
