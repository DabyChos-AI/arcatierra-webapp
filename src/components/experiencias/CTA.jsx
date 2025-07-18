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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 mt-10">
          {/* Características */}
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              variants={itemVariants}
            >
              <div className="w-12 h-12 mb-4 text-verde-principal">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

// Características destacadas
const features = [
  {
    title: "Experiencias auténticas",
    description: "Conecta con la naturaleza y la tradición chinampera en un entorno 100% auténtico.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" /><path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" /><path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" /></svg>
  },
  {
    title: "Gastronomía local",
    description: "Degusta platillos elaborados con ingredientes frescos cultivados en nuestras chinampas.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M15.75 8.25a.75.75 0 01.75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 11-.992-1.124A2.243 2.243 0 0015 9a.75.75 0 01.75-.75z" /><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.575 15.6a8.25 8.25 0 009.348 4.425 1.966 1.966 0 00-1.84-1.275.983.983 0 01-.97-.822l-.073-.437c-.094-.565.25-1.11.8-1.267l.99-.282c.427-.123.783-.418.982-.816l.036-.073a1.453 1.453 0 012.328-.377L16.5 15h.628a2.25 2.25 0 011.983 1.186 8.25 8.25 0 00-6.345-12.4c.044.262.18.503.389.676l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.575 15.6z" clipRule="evenodd" /></svg>
  },
  {
    title: "Aprendizaje vivencial",
    description: "Conoce y participa en técnicas agrícolas milenarias que han perdurado hasta nuestros días.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" /></svg>
  }
];

export default CTA;
