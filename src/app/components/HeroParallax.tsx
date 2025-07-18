"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface HeroParallaxProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImages: {
    src: string;
    alt: string;
    speed: number;
    zIndex: number;
    opacity?: number;
  }[];
  height?: string;
}

const HeroParallax: React.FC<HeroParallaxProps> = ({
  title,
  subtitle,
  ctaText,
  ctaUrl = '#',
  backgroundImages,
  height = '90vh',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Estado para tracking del ancho de la pantalla
  const [isMobile, setIsMobile] = useState(false);

  // Efecto para detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Crear transformaciones para cada imagen fuera del render
  const parallaxLayers = useMemo(() => {
    return backgroundImages.map((img, index) => {
      // Reducir el efecto parallax en móviles
      const speed = isMobile ? img.speed * 0.3 : img.speed;
      
      // Crear transformación para esta imagen
      const y = useTransform(
        scrollYProgress, 
        [0, 1], 
        ['0%', `${speed * 100}%`]
      );
      
      return {
        img,
        y,
        index
      };
    });
  }, [backgroundImages, scrollYProgress, isMobile]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{ height, width: '100%' }}
    >
      {/* Capas de parallax */}
      {parallaxLayers.map(({ img, y, index }) => (
        <motion.div
          key={index}
          style={{ 
            y,
            zIndex: img.zIndex,
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: img.opacity || 1
          }}
          className="w-full h-full"
        >
          <OptimizedImage             src={img.src}
            alt={img.alt}
            fill
            style={{ objectFit: 'cover' }} ={index === 0} />
        </motion.div>
      ))}
      
      {/* Overlay de gradiente para mejorar legibilidad del texto */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3) 50%, rgba(0,0,0,0))' }}
      ></div>
      
      {/* Contenido */}
      <motion.div 
        className="absolute bottom-0 inset-x-0 p-8 md:p-16 z-20 text-white"
        style={{ 
          y: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
          opacity: useTransform(scrollYProgress, [0, 0.8], [1, 0]) 
        }}
      >
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl mb-8 max-w-2xl text-white/90 drop-shadow-md">
              {subtitle}
            </p>
          )}
          {ctaText && (
            <a
              href={ctaUrl}
              className="btn-primary btn-ripple inline-block"
            >
              {ctaText}
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HeroParallax;
