'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ExperienceCardPro from './ExperienceCardPro';

interface ExperienceCarouselProps {
  experiences: Array<{
    title: string;
    image: string;
    description: string;
    duration: string;
    participants: string;
    location: string;
    rating: number;
    price: string;
    dates?: string[];
  }>;
  onReserve?: (experience: any) => void;
}

const ExperienceCarousel: React.FC<ExperienceCarouselProps> = ({ experiences, onReserve }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const innerCarouselRef = useRef<HTMLDivElement>(null);
  
  // Número de tarjetas visibles según el tamaño de pantalla
  const getVisibleCards = () => {
    if (isMobile) return 1;
    if (width < 1024) return 2;
    return 3;
  };

  useEffect(() => {
    // Inicializa el ancho y verifica el tamaño de la pantalla
    const handleResize = () => {
      setWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 640);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Actualiza el ancho del carrusel cuando cambia el tamaño o contenido
    if (carouselRef.current && innerCarouselRef.current) {
      const scrollWidth = innerCarouselRef.current.scrollWidth;
      const clientWidth = carouselRef.current.clientWidth;
      setWidth(scrollWidth - clientWidth);
    }
  }, [experiences, isMobile]);

  const next = () => {
    if (currentIndex < experiences.length - getVisibleCards()) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Efecto circular
      setCurrentIndex(0);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // Efecto circular
      setCurrentIndex(experiences.length - getVisibleCards());
    }
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-scroll con pausa al hover
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        next();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, isDragging, experiences.length]);

  return (
    <div className="relative w-full px-4 py-8">
      {/* Controles laterales */}
      <div className="hidden md:block absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
        <button 
          onClick={prev}
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-verde-principal hover:bg-verde-principal hover:text-white transition-all duration-300"
          aria-label="Anterior"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      
      <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
        <button 
          onClick={next}
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-verde-principal hover:bg-verde-principal hover:text-white transition-all duration-300"
          aria-label="Siguiente"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Contenedor principal del carrusel */}
      <div 
        ref={carouselRef}
        className="overflow-hidden relative"
        onMouseEnter={() => setIsDragging(true)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <motion.div
          ref={innerCarouselRef}
          className="flex"
          animate={{
            x: isMobile 
              ? `-${currentIndex * 100}%` 
              : `-${currentIndex * (100 / getVisibleCards())}%`
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100
          }}
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, info) => {
            setIsDragging(false);
            const threshold = 100;
            if (info.offset.x > threshold) {
              prev();
            } else if (info.offset.x < -threshold) {
              next();
            }
          }}
        >
          {experiences.map((experience, index) => (
            <motion.div
              key={index}
              className={`${
                isMobile ? 'w-full' : 'w-1/2 lg:w-1/3'
              } px-2 md:px-4 flex-shrink-0`}
              initial={{ scale: 0.98, opacity: 0.95 }}
              animate={{ 
                scale: currentIndex <= index && index < currentIndex + getVisibleCards() ? 1 : 0.98,
                opacity: currentIndex <= index && index < currentIndex + getVisibleCards() ? 1 : 0.95
              }}
              transition={{ duration: 0.3 }}
            >
              <ExperienceCardPro 
                experience={experience} 
                index={index}
                onReserve={onReserve} 
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Indicadores de posición */}
      <div className="flex justify-center mt-6 gap-1.5">
        {Array.from({ length: Math.max(1, experiences.length - getVisibleCards() + 1) }).map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-verde-principal scale-125' : 'bg-gray-300'
            }`}
            onClick={() => goToCard(index)}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Controles móviles */}
      <div className="flex justify-between mt-4 md:hidden">
        <button 
          onClick={prev}
          className="px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm flex items-center text-verde-principal text-sm"
        >
          <ChevronLeft size={16} className="mr-1" /> Anterior
        </button>
        <button 
          onClick={next}
          className="px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm flex items-center text-verde-principal text-sm"
        >
          Siguiente <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default ExperienceCarousel;
