'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeIn } from '@/lib/animations';

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[85vh] overflow-hidden">
      {/* Imagen de fondo con efecto parallax */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/catering/evento-corporativo.jpg" 
          alt="Catering consciente para eventos únicos en CDMX" 
          fill 
          priority
          className="object-cover object-center"
          style={{ 
            transform: "scale(1.05)",
            filter: "brightness(0.7)"
          }}
        />
      </div>
      
      {/* Overlay con gradiente */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-10"
      />
      
      {/* Contenido principal */}
      <div className="relative z-20 container mx-auto h-full flex flex-col justify-center items-center text-center px-4">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={fadeIn('up', 0.2)}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Catering consciente para eventos únicos en CDMX
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Menús agroecológicos con alimentos frescos, locales y de agricultura regenerativa.
            Experiencia en eventos corporativos, bodas y celebraciones especiales.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              className="bg-terracota hover:bg-terracota-oscuro text-white"
              onClick={() => document.getElementById('request-quote')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Solicitar cotización
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => document.getElementById('menus')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver menús de temporada
            </Button>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-8 h-12 border-2 border-white rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
