'use client'

import React, { useRef, useEffect } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import ParallaxHero from '@/components/experiencias/ParallaxHero'

const Introduccion = () => {
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
    hidden: { opacity: 0, y: 20 },
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
    <>
      {/* Hero section con parallax */}
      <ParallaxHero 
        title="Experiencias"
        subtitle="Descubre nuestras experiencias de turismo rural y gastronómico en Xochimilco, conecta con la naturaleza y la tradición chinampera."
        imageSrc="/images/experiencias/hero-experiencias.jpg"
        height="90vh"
      />

      {/* Contenido informativo */}
      <section ref={ref} className="py-20 px-4 md:px-8 bg-gradient-to-b from-neutro-crema to-white overflow-hidden">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-playfair text-verde-principal mb-8 text-center"
            variants={itemVariants}
          >
            Arca Tierra: Experiencias de turismo rural y gastronómico en Xochimilco
          </motion.h2>
          
          <motion.div 
            className="prose prose-lg max-w-4xl mx-auto text-verde-tipografia"
            variants={containerVariants}
          >
            <motion.p variants={itemVariants}>
              En Arca Tierra te ofrecemos experiencias de turismo rural y gastronómico en Xochimilco. Hay experiencias <span className="text-terracota-principal font-semibold">públicas</span> a las cuales puedes acudir reservando tu lugar, y están publicadas en el Calendario de Experiencias; o <span className="text-verde-principal font-semibold">privadas</span>, a través de las cuales puedes acudir el día y horario que mejor te acomode sujeto a disponibilidad.
            </motion.p>
            
            <motion.p variants={itemVariants}>
              En ellas podrás conocer a las personas campesinas que producen alimentos naturales y de temporada, además de que comerás platillos frescos y deliciosos preparados por cocineros y cocineras mientras aprecias los paisajes chinamperos y aprendes sobre agricultura regenerativa en nuestras chinampas.
            </motion.p>
            
            <motion.div 
              className="my-8 p-6 bg-verde-principal/10 rounded-lg border-l-4 border-verde-principal"
              variants={itemVariants}
            >
              <p className="text-verde-principal text-lg italic">
                "Naturaleza y alimentación son los ejes de estas experiencias. Al ser parte de estas visitas ayudas a la preservación de saberes tradicionales agrícolas que hacen posible su existencia."
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10"
              variants={containerVariants}
            >
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-terracota-principal/20 rounded-full flex items-center justify-center mb-4 text-terracota-principal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-verde-principal mb-2">Conexión Local</h3>
                <p>Conoce a las personas que cultivan alimentos de forma sostenible en las chinampas de Xochimilco.</p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-verde-principal/20 rounded-full flex items-center justify-center mb-4 text-verde-principal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-verde-principal mb-2">Seguridad</h3>
                <p>Todas nuestras experiencias son seguras y están diseñadas para el disfrute de todos los participantes.</p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-terracota-principal/20 rounded-full flex items-center justify-center mb-4 text-terracota-principal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-verde-principal mb-2">Experiencia única</h3>
                <p>Vive momentos inolvidables en un ecosistema único y contribuye a la preservación de las tradiciones.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

export default Introduccion;
