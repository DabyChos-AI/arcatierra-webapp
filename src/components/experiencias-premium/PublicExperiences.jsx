'use client'

import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, useInView, useAnimation } from 'framer-motion'
import { ChevronRight, Calendar, Clock, Users, MapPin, Star } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules'

// Importar estilos de Swiper
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const PublicExperiences = () => {
  const ref = useRef(null);
  const calendarRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  const isCalendarInView = useInView(calendarRef, { once: true, margin: "-100px 0px" });
  const controls = useAnimation();
  const calendarControls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
    if (isCalendarInView) {
      calendarControls.start("visible");
    }
  }, [isInView, isCalendarInView, controls, calendarControls]);

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

  const calendarVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const publicExperiences = [
    {
      title: "Amanecer chinampero",
      image: "/images/experiencias/amanecer.jpg",
      description: "Contempla el amanecer desde los canales de Xochimilco y disfruta un desayuno de tres tiempos preparado con maíz nativo y vegetales frescos.",
      duration: "3 horas",
      participants: "2-12 personas",
      location: "Embarcadero Cuemanco, Xochimilco",
      rating: 4.9,
      price: "$850 por persona",
      dates: ["2025-07-13", "2025-07-20", "2025-07-27"]
    },
    {
      title: "Amanecer chinampero con The Curious Mexican",
      image: "/images/experiencias/amanecer-anais.jpg",
      description: "Amanecer chinampero con guía en inglés y español, y desayuno especial de chef invitado, curado por The Curious Mexican.",
      duration: "3.5 horas",
      participants: "4-10 personas",
      location: "Embarcadero Cuemanco, Xochimilco",
      rating: 5.0,
      price: "$980 por persona",
      dates: ["2025-07-20", "2025-08-03", "2025-08-17"]
    },
    {
      title: "Brunch chinampero",
      image: "/images/experiencias/brunch.jpg",
      description: "Un domingo al mes, vive una mañana deliciosa en la Chinampa del Sol con brunch, bebidas frías y un recorrido guiado por el campo regenerativo.",
      duration: "4 horas",
      participants: "4-15 personas",
      location: "Chinampa del Sol, Xochimilco",
      rating: 4.8,
      price: "$780 por persona",
      dates: ["2025-08-10", "2025-09-14", "2025-10-12"]
    },
    {
      title: "Chinampa en familia",
      image: "/images/experiencias/chinampa-familia.jpg",
      description: "Una experiencia pensada para las infancias: desayuno, recorrido por la chinampa y actividades agroecológicas divertidas para toda la familia.",
      duration: "3.5 horas",
      participants: "Familias (4-16 personas)",
      location: "Chinampa del Sol, Xochimilco",
      rating: 4.9,
      price: "$650 adultos | $450 niños",
      dates: ["2025-07-12", "2025-07-19", "2025-07-26"]
    },
    {
      title: "Comida Chinampera",
      image: "/images/experiencias/comida-chinampera.jpg",
      description: "Comidas únicas junto a chefs invitados de México y el mundo, en colaboración con Arca Tierra y la red de productores regenerativos.",
      duration: "5 horas",
      participants: "6-20 personas",
      location: "Chinampa del Sol, Xochimilco",
      rating: 4.9,
      price: "$1,250 por persona",
      dates: ["2025-08-02", "2025-08-16", "2025-08-30"]
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 md:px-8 bg-white overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-playfair text-verde-principal mb-8"
          variants={itemVariants}
        >
          Experiencias públicas
        </motion.h2>
        
        <motion.div 
          className="prose prose-lg mb-10 text-verde-tipografia"
          variants={itemVariants}
        >
          <p>
            Las experiencias abiertas al público tienen como objetivo mostrar a las personas interesadas los esfuerzos de conservación de la zona chinampera de Xochimilco mientras disfrutan de los canales, los paisajes y los alimentos cosechados en las chinampas y otras áreas donde se practica la agricultura regenerativa.
          </p>
          <p className="font-semibold">Este es el calendario para que apartes tu lugar:</p>
        </motion.div>
        
        {/* Calendario Estilizado */}
        <motion.div 
          ref={calendarRef}
          className="mb-16 rounded-2xl overflow-hidden shadow-2xl"
          variants={calendarVariants}
          initial="hidden"
          animate={calendarControls}
        >
          <div className="bg-verde-principal text-white p-6">
            <h3 className="text-2xl font-playfair mb-2">Calendario de Experiencias</h3>
            <p className="opacity-90">Selecciona una fecha para ver las experiencias disponibles</p>
          </div>
          
          <div className="bg-white p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              <div className="text-center text-verde-tipografia font-medium">Dom</div>
              <div className="text-center text-verde-tipografia font-medium">Lun</div>
              <div className="text-center text-verde-tipografia font-medium">Mar</div>
              <div className="text-center text-verde-tipografia font-medium">Mié</div>
              <div className="text-center text-verde-tipografia font-medium">Jue</div>
              <div className="text-center text-verde-tipografia font-medium">Vie</div>
              <div className="text-center text-verde-tipografia font-medium">Sáb</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const hasEvent = [6, 7, 13, 14, 20, 21, 27, 28].includes(day);
                return (
                  <div 
                    key={day}
                    className={`
                      h-14 rounded-lg flex items-center justify-center relative cursor-pointer
                      transition-all duration-200 hover:scale-105
                      ${hasEvent ? 'bg-terracota-principal/10 border border-terracota-principal' : 'bg-gray-50'}
                    `}
                  >
                    <span className={`font-medium ${hasEvent ? 'text-terracota-principal' : ''}`}>{day}</span>
                    {hasEvent && <div className="absolute bottom-2 w-1.5 h-1.5 bg-terracota-principal rounded-full"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-playfair text-verde-principal mb-8 text-center"
          variants={itemVariants}
        >
          Nuestras experiencias públicas
        </motion.h3>
        
        {/* Carrusel de Experiencias Públicas */}
        <motion.div
          className="mb-12"
          variants={itemVariants}
        >
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
            }}
            pagination={{ el: '.swiper-pagination', clickable: true }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            className="swiper-container"
          >
            {publicExperiences.map((exp, index) => (
              <SwiperSlide key={index} style={{ width: '350px', height: '600px' }} className="my-8 mx-2">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full transition-all duration-300 hover:shadow-2xl">
                  <div className="relative h-64">
                    <Image 
                      src={exp.image} 
                      alt={exp.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-terracota-principal text-white px-3 py-1 rounded-full text-sm font-medium">
                      {exp.price}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col h-[calc(100%-16rem)]">
                    <h4 className="text-xl font-semibold text-verde-principal mb-3 line-clamp-2">{exp.title}</h4>
                    <p className="text-verde-tipografia mb-4 line-clamp-3">{exp.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <Clock size={16} className="text-verde-suave" />
                      <span>{exp.duration}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <Users size={16} className="text-verde-suave" />
                      <span>{exp.participants}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <MapPin size={16} className="text-verde-suave" />
                      <span className="truncate">{exp.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{exp.rating}</span>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex gap-2 mb-4">
                        {exp.dates.slice(0, 3).map((date, i) => (
                          <div key={i} className="px-2 py-1 bg-verde-principal/10 text-verde-principal text-xs rounded">
                            {new Date(date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                          </div>
                        ))}
                      </div>
                      
                      <button className="w-full bg-terracota-principal hover:bg-terracota-oscuro text-white py-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2 hover:gap-3">
                        Reservar ahora <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            
            <div className="swiper-pagination"></div>
            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>
          </Swiper>
        </motion.div>
        
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <button className="bg-verde-principal hover:bg-verde-claro text-white px-8 py-3 rounded-lg transition-all duration-300 inline-flex items-center gap-2 hover:gap-3 font-medium shadow-md hover:shadow-xl">
            Ver todas las experiencias <ChevronRight size={20} />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PublicExperiences;
