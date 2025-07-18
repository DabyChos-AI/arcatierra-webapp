'use client'

import React, { useRef, useEffect } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { motion, useInView, useAnimation } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const CTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section ref={ref} className="py-20 px-4 md:px-8 bg-gradient-to-b from-white to-neutro-crema overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div 
          className="rounded-3xl overflow-hidden relative bg-gradient-to-r from-verde-principal to-verde-claro"
          variants={itemVariants}
        >
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <OptimizedImage 
              src="/images/experiencias/experiencias_arca_tierra.jpg" 
              alt="Patrón de chinampas"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          <div className="relative z-10 p-12 md:p-16 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-playfair text-white mb-6">
                ¡Vive la magia de las chinampas!
              </h2>
              
              <p className="text-white/90 text-lg mb-8">
                Reserva ahora y vive una experiencia única en las chinampas de Xochimilco, un ecosistema único en el mundo que combina tradición, gastronomía y naturaleza.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/calendario" 
                  className="bg-white text-verde-principal hover:bg-neutro-claro px-6 py-3 rounded-lg transition-all duration-300 inline-flex items-center gap-2 hover:gap-3 shadow-lg font-medium"
                >
                  Ver calendario <ChevronRight size={18} />
                </Link>
                
                <Link 
                  href="/contacto" 
                  className="bg-terracota-principal hover:bg-terracota-oscuro text-white px-6 py-3 rounded-lg transition-all duration-300 inline-flex items-center gap-2 hover:gap-3 shadow-lg font-medium"
                >
                  Reservar ahora <ChevronRight size={18} />
                </Link>
              </div>
            </div>
            
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-xl transform -rotate-2 hover:rotate-0 transition-all duration-500">
              <OptimizedImage 
                src="/images/experiencias/turismo_rural_xochimilco.jpg" 
                alt="Vista aérea de las chinampas de Xochimilco"
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-20 text-center"
          variants={itemVariants}
        >
          <h3 className="text-2xl md:text-3xl font-playfair text-verde-principal mb-6">
            ¿Tienes preguntas sobre nuestras experiencias?
          </h3>
          
          <p className="text-verde-tipografia max-w-2xl mx-auto mb-8">
            Estamos aquí para ayudarte a planificar tu visita perfecta a las chinampas de Xochimilco.
            Contáctanos para obtener más información o resolver cualquier duda.
          </p>
          
          <div className="flex justify-center gap-6 flex-wrap">
            <Link 
              href="/preguntas-frecuentes" 
              className="bg-neutro-claro hover:bg-neutro-crema text-verde-tipografia px-6 py-3 rounded-lg transition-all duration-300 inline-flex items-center gap-2 hover:gap-3"
            >
              Preguntas frecuentes <ChevronRight size={18} />
            </Link>
            
            <Link 
              href="/contacto" 
              className="bg-verde-suave hover:bg-verde-claro text-white px-6 py-3 rounded-lg transition-all duration-300 inline-flex items-center gap-2 hover:gap-3"
            >
              Contacto <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTA;
