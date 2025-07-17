'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, useInView, useAnimation } from 'framer-motion'
import { ArrowRight, Award, Leaf, Heart } from 'lucide-react'

const RuralTourism = () => {
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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  const benefitCards = [
    {
      icon: <Leaf className="text-white" />,
      title: "Sostenibilidad",
      description: "Apoya prácticas agrícolas sostenibles que conservan ecosistemas vitales para la ciudad."
    },
    {
      icon: <Heart className="text-white" />,
      title: "Comunidad Local",
      description: "Contribuye directamente a las comunidades locales y sus medios de vida tradicionales."
    },
    {
      icon: <Award className="text-white" />,
      title: "Patrimonio Cultural",
      description: "Ayuda a preservar técnicas agrícolas tradicionales reconocidas por la UNESCO."
    }
  ];

  return (
    <section ref={ref} className="py-24 px-4 md:px-8 bg-white overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div className="mb-16" variants={containerVariants}>
          <motion.h2 
            className="text-3xl md:text-4xl font-playfair text-verde-principal mb-6 text-center"
            variants={itemVariants}
          >
            ¿Qué es turismo rural?
          </motion.h2>
          
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-12"
            variants={itemVariants}
          >
            <p className="text-lg text-verde-tipografia">
              Una forma de turismo que te conecta con la naturaleza, las tradiciones y las personas que cuidan de nuestros territorios.
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div className="prose prose-lg text-verde-tipografia" variants={containerVariants}>
            <motion.p variants={itemVariants}>
              El turismo rural es una actividad turística que se realiza en espacios rurales, habitualmente en pequeñas localidades o fuera del casco urbano, donde puedes experimentar de primera mano las tradiciones, la cultura y la forma de vida locales.
            </motion.p>
            
            <motion.p variants={itemVariants}>
              La característica diferenciadora de productos de turismo rural es el deseo de facilitar al visitante un contacto personalizado, una impresión del entorno físico y humano de las zonas rurales y, dentro de lo posible, permitir su participación en actividades, costumbres y estilo de vida de la población.
            </motion.p>
            
            <motion.blockquote 
              className="border-l-4 border-terracota-principal pl-4 italic"
              variants={itemVariants}
            >
              "En este caso, te ofrecemos conocer la zona chinampera de Xochimilco, uno de los últimos bastiones de la agricultura tradicional en la Ciudad de México y un sistema agrícola reconocido como patrimonio de la humanidad por la UNESCO."
            </motion.blockquote>
            
            <motion.p variants={itemVariants}>
              Al participar en nuestras experiencias, contribuyes a la conservación de este sistema agrícola y apoyas directamente a las familias campesinas que lo mantienen vivo.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            variants={imageVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
            
            <Image 
              src="/images/experiencias/turismo_rural.JPG" 
              alt="Turismo rural en chinampas de Xochimilco"
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-8000 hover:scale-105"
            />
            
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <div className="text-white">
                <h3 className="text-2xl font-playfair mb-2">Patrimonio Cultural</h3>
                <p className="opacity-90 mb-3">Las chinampas son un método agrícola prehispánico que constituyen un Patrimonio Mundial de la UNESCO.</p>
                <div className="inline-flex items-center text-neutro-calido font-medium cursor-pointer group">
                  <span>Conoce más sobre este patrimonio</span>
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-playfair text-verde-principal mb-8 text-center"
          variants={itemVariants}
        >
          Beneficios de nuestro turismo rural
        </motion.h3>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          variants={containerVariants}
        >
          {benefitCards.map((card, index) => (
            <motion.div 
              key={index}
              className="bg-verde-principal rounded-xl p-8 text-white h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              variants={itemVariants}
            >
              <div className="w-14 h-14 bg-verde-claro rounded-full flex items-center justify-center mb-6">
                {card.icon}
              </div>
              <h4 className="text-xl font-semibold mb-3">{card.title}</h4>
              <p className="opacity-90">{card.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="flex justify-center"
          variants={itemVariants}
        >
          <button className="mt-6 bg-terracota-principal hover:bg-terracota-medio text-white px-6 py-3 rounded-lg transition-all duration-300 inline-flex items-center gap-2">
            Descubre nuestro impacto social
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default RuralTourism;
