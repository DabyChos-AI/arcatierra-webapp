'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, useInView, useAnimation } from 'framer-motion'

const TurismoRural = () => {
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
    <section ref={ref} className="py-20 px-4 md:px-8 bg-white overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <span className="inline-block px-4 py-2 rounded-full bg-terracota-principal/20 text-terracota-principal text-sm font-medium mb-4">
            TURISMO RURAL
          </span>
          <h2 className="text-3xl md:text-4xl font-playfair text-verde-principal mb-6">
            Turismo Regenerativo en Xochimilco
          </h2>
          <p className="text-lg text-verde-tipografia max-w-3xl mx-auto">
            Contribuye a la regeneración del ecosistema chinampero a través de un turismo consciente 
            que promueve la conservación de tradiciones ancestrales y la biodiversidad local.
          </p>
        </motion.div>
        
        {/* Sección de imágenes y beneficios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div 
            className="relative rounded-2xl overflow-hidden shadow-xl h-[400px] lg:h-[500px]"
            variants={itemVariants}
          >
            <Image 
              src="/images/experiencias/turismo_regenerativo.jpg" 
              alt="Turismo regenerativo en Xochimilco"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              className="hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
          
          <motion.div variants={containerVariants}>
            <motion.h3 
              className="text-2xl font-playfair text-verde-principal mb-6"
              variants={itemVariants}
            >
              Beneficios del turismo rural en las chinampas
            </motion.h3>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex gap-4 items-start"
                  variants={itemVariants}
                >
                  <div className="w-12 h-12 rounded-full bg-verde-claro/20 flex items-center justify-center flex-shrink-0 text-verde-principal">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-verde-principal mb-2">{benefit.title}</h4>
                    <p className="text-verde-tipografia">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Grid de imágenes */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {galleryImages.map((image, index) => (
            <motion.div 
              key={index}
              className="rounded-xl overflow-hidden shadow-lg h-64 relative group"
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Image 
                src={image.src} 
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                style={{ objectFit: 'cover' }}
                className="group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-verde-principal/80 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-4 text-white">
                  <h5 className="font-medium text-lg">{image.title}</h5>
                  <p className="text-sm text-white/90">{image.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

// Beneficios del turismo rural
const benefits = [
  {
    title: "Conservación del patrimonio",
    description: "El turismo rural promueve la preservación de las técnicas agrícolas chinamperas y el conocimiento tradicional transmitido por generaciones.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
  },
  {
    title: "Impacto económico local",
    description: "Generamos oportunidades económicas directas para los productores locales y sus familias, incentivando la continuidad de la agricultura tradicional.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  {
    title: "Regeneración ambiental",
    description: "Parte de los ingresos se destina a proyectos de conservación y regeneración del ecosistema de humedales de Xochimilco.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  }
];

// Imágenes de la galería
const galleryImages = [
  {
    src: "/images/experiencias/chinampas_1.jpg",
    alt: "Vista aérea de chinampas en Xochimilco",
    title: "Paisaje chinampero",
    description: "Un sistema agrícola único reconocido como Patrimonio de la Humanidad"
  },
  {
    src: "/images/experiencias/chinampas_2.jpg",
    alt: "Agricultor tradicional trabajando en la chinampa",
    title: "Agricultura tradicional",
    description: "Técnicas sostenibles transmitidas por generaciones"
  },
  {
    src: "/images/experiencias/chinampas_3.jpg",
    alt: "Productos frescos de la chinampa",
    title: "Del campo a la mesa",
    description: "Productos orgánicos cultivados con técnicas ancestrales"
  }
];

export default TurismoRural;
