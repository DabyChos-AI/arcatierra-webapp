'use client'

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="bg-verde-principal py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para vivir una experiencia inolvidable?
          </h2>
          <p className="text-lg md:text-xl text-white opacity-90 mb-10">
            Explora la rica tradición chinampera, disfruta de la gastronomía local y conéctate con la naturaleza en una experiencia única en Arca Tierra.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contacto" className="inline-flex items-center px-6 py-3 rounded-full bg-white text-verde-principal font-semibold hover:bg-gray-100 transition-colors">
              Contactanos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/productos" className="inline-flex items-center px-6 py-3 rounded-full bg-transparent border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors">
              Ver Productos
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
