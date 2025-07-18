'use client'

import React, { useRef, useEffect } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { motion, useInView, useAnimation } from 'framer-motion'
import { ChevronRight, Clock, Users, MapPin, Star, CheckCircle } from 'lucide-react'

const PrivateExperiences = () => {
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

  const privateExperiences = [
    {
      id: "S-EXP-EVE-001",
      title: "Arcano por un día",
      category: "EXPERIENCIAS PRIVADAS",
      price: "$6,500 de 1 a 10 personas | $650 por persona adicional",
      image: "/images/experiencias/arcano.jpg",
      seoTitle: "Experiencia Privada Arcano por un día | Arca Tierra",
      description: "Recorre los canales de Xochimilco y conoce cómo funciona la chinampa, quiénes la trabajan y aprende de agroecología.",
      duration: "3 horas",
      availability: "Lunes a Sábado",
      includes: ["Recorrido guiado en trajinera", "Visita a la chinampa", "Taller de agroecología", "Guía especializado"],
      rating: 4.8
    },
    {
      id: "S-EXP-EVE-002",
      title: "DEL COMAL A LA HUERTA",
      category: "EXPERIENCIAS PRIVADAS",
      price: "$9,900 de 1 a 9 personas | $1,100 por persona adicional",
      image: "/images/experiencias/comal-huerta.jpg",
      seoTitle: "Experiencia del Comal a la Huerta en Xochimilco |Arca Tierra",
      description: "Vive la experiencia en las chinampas de Xochimilco y disfruta un desayuno o almuerzo preparado con maíz azul nativo de Xochimilco y la cosecha del día.",
      duration: "4 horas",
      availability: "Lunes a Sábado",
      includes: ["Recorrido guiado en trajinera", "Visita a la chinampa", "Desayuno o almuerzo gourmet", "Bebidas incluidas", "Demostración culinaria"],
      rating: 4.9
    },
    {
      id: "S-EXP-EVE-003",
      title: "DE LAS CAZUELAS",
      category: "EXPERIENCIAS PRIVADAS",
      price: "$9,900 de 1 a 9 personas | $1,100 por persona adicional",
      image: "/images/experiencias/cazuelas.jpg",
      seoTitle: "Experiencia De las Cazuelas | Arca Tierra",
      description: "Pasea por los canales de Xochimilco y disfruta una comida de tres tiempos preparada con ingredientes de la chinampa y de la red de productores regenerativos de México.",
      duration: "4 horas",
      availability: "Martes a Sábado",
      includes: ["Recorrido guiado en trajinera", "Visita a la chinampa", "Comida gourmet de 3 tiempos", "Bebidas artesanales", "Visita al proceso de cultivo"],
      rating: 4.8
    },
    {
      id: "S-EXP-EVE-004",
      title: "ATARDECER CHINAMPERO",
      category: "EXPERIENCIAS PRIVADAS",
      price: "$9,900 de 1 a 9 personas | $1,100 por persona adicional",
      image: "/images/experiencias/atardecer.jpg",
      seoTitle: "Atardecer Chinampero | Arca Tierra",
      description: "Disfruta el atardecer en los canales de Xochimilco con una tabla de quesos, charcutería, botanas y bebidas, mientras recorres la zona chinampera.",
      duration: "3 horas",
      availability: "Jueves a Sábado",
      includes: ["Recorrido en trajinera al atardecer", "Tabla de quesos y charcutería", "Bebidas seleccionadas", "Guía especializado", "Vistas panorámicas"],
      rating: 5.0
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 md:px-8 bg-gradient-to-b from-neutro-crema to-white overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-playfair text-verde-principal mb-12 text-center"
          variants={itemVariants}
        >
          Experiencias privadas
        </motion.h2>
        
        <motion.div 
          className="mb-8 max-w-3xl mx-auto text-center"
          variants={itemVariants}
        >
          <p className="text-lg text-verde-tipografia">
            Diseña tu propia aventura chinampera. Nuestras experiencias privadas están disponibles el día y horario que mejor te acomode, sujeto a disponibilidad.
          </p>
        </motion.div>
        
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {privateExperiences.map((exp, index) => (
            <motion.div 
              key={index}
              className="group"
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-xl h-full transition-all duration-300 hover:shadow-2xl border border-neutro-crema">
                <div className="relative h-64 overflow-hidden">
                  <OptimizedImage 
                    src={exp.image} 
                    alt={exp.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-verde-principal text-white text-xs uppercase tracking-wider font-medium rounded-full">
                    {exp.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-verde-tipografia">{exp.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{exp.title}</h3>
                    <p className="text-sm opacity-90">{exp.id}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-6 mb-5 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-terracota-principal" />
                      <span>{exp.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-terracota-principal" />
                      <span>Grupos privados</span>
                    </div>
                  </div>
                  
                  <p className="text-verde-tipografia mb-6">{exp.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-verde-principal mb-3">La experiencia incluye:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
                      {exp.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-verde-principal mt-1 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-verde-tipografia text-sm">
                      <span className="block opacity-80">Disponibilidad:</span>
                      <span className="font-medium">{exp.availability}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-70 mb-1">Desde</div>
                      <div className="text-terracota-principal font-bold text-lg">
                        {exp.price.split('|')[0].trim()}
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-terracota-principal hover:bg-terracota-oscuro text-white py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:gap-3 group">
                    <span>Reservar esta experiencia</span>
                    <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="flex flex-col items-center justify-center p-10 rounded-2xl bg-gradient-to-r from-verde-principal to-verde-claro text-white text-center"
          variants={itemVariants}
        >
          <h3 className="text-2xl md:text-3xl font-playfair mb-4">¿Buscas una experiencia personalizada?</h3>
          <p className="max-w-2xl mb-8 opacity-90">
            Podemos diseñar una experiencia a la medida para grupos corporativos, eventos especiales o celebraciones.
            Contáctanos para crear un momento único en las chinampas de Xochimilco.
          </p>
          <Link 
            href="/contacto" 
            className="inline-flex items-center gap-2 bg-white text-verde-principal hover:bg-neutro-crema px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 hover:gap-3 shadow-lg hover:shadow-xl"
          >
            Contáctanos para más información <ChevronRight size={20} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PrivateExperiences;
