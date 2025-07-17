'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const carouselImages = [
  {
    src: '/images/experiencias/AMANECERCHINAMPERO.jpg',
    alt: 'Amanecer Chinampero - Paisaje al amanecer',
    title: 'Momentos Únicos',
    subtitle: 'Que Recordarás Siempre',
    cta: 'Explorar Experiencias'
  },
  {
    src: '/images/experiencias/DELCOMALALAHUERTA.jpg',
    alt: 'Del Comal a la Huerta - Experiencia gastronómica',
    title: 'Gastronomía Mexicana',
    subtitle: 'Del Campo a tu Mesa',
    cta: 'Ver Experiencias Gastronómicas'
  },
  {
    src: '/images/experiencias/CHINAMPAENFAMILIA.jpeg',
    alt: 'Chinampa en Familia - Experiencia familiar',
    title: 'Experiencias Familiares',
    subtitle: 'Conecta con la Naturaleza',
    cta: 'Experiencias para Familias'
  },
  {
    src: '/images/experiencias/DELCAMPOALABARRA.jpg',
    alt: 'Del Campo a la Barra - Degustación',
    title: 'Turismo Rural',
    subtitle: 'Tradición y Sustentabilidad',
    cta: 'Conocer Experiencias Privadas'
  },
  {
    src: '/images/experiencias/BRUNCHENDOMINGO.jpg',
    alt: 'Brunch en Domingo - Experiencia dominical',
    title: 'Experiencias Auténticas',
    subtitle: 'En las Chinampas de Xochimilco',
    cta: 'Ver Calendario'
  },
  {
    src: '/images/experiencias/ARCANOPORUNDIA.jpg',
    alt: 'Arcano Por Un Día - Experiencia inmersiva',
    title: 'Cultura Chinampera',
    subtitle: 'Tradición Ancestral',
    cta: 'Descubrir Experiencia'
  },
  {
    src: '/images/experiencias/COCINADETEMPORADA.jpg',
    alt: 'Cocina de Temporada - Experiencia culinaria',
    title: 'Sabores de Temporada',
    subtitle: 'Cocina Local Sustentable',
    cta: 'Conocer Experiencia'
  },
  {
    src: '/images/experiencias/COMIDASCHINAMPERAS.jpg',
    alt: 'Comidas Chinamperas - Experiencia gastronómica local',
    title: 'Gastronomía Chinampera',
    subtitle: 'Sabores Únicos',
    cta: 'Reservar Experiencia'
  },
  {
    src: '/images/experiencias/DELASCAZUELAS.jpg',
    alt: 'De Las Cazuelas - Experiencia culinaria tradicional',
    title: 'Recetas Tradicionales',
    subtitle: 'Sabores de Familia',
    cta: 'Explorar Experiencia'
  },
  // Imágenes eliminadas que no existían en el directorio
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
      setImageLoaded(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setImageLoaded(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    setImageLoaded(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    setImageLoaded(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <div className="relative h-[80vh] min-h-[600px] overflow-hidden rounded-3xl shadow-2xl mx-4 md:mx-8 mb-12 mt-20">
      {/* Imagen principal */}
      <div className="absolute inset-0">
        <Image
          src={carouselImages[currentIndex].src}
          alt={carouselImages[currentIndex].alt}
          fill
          className={`object-cover transition-opacity duration-1000 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          priority
          sizes="100vw"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay gradient mejorado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Contenido superpuesto */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white z-10 max-w-5xl px-6">
          {/* Logo Arca Tierra */}
          <div className="mb-8">
            <div className="relative w-48 h-20 mx-auto">
              <Image
                src="/images/experiencias/logo_arcatierra_blanco.png"
                alt="Arca Tierra"
                fill
                className="object-contain opacity-90"
                sizes="200px"
              />
            </div>
          </div>

          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-playfair font-bold mb-4 drop-shadow-2xl leading-tight">
            {carouselImages[currentIndex].title}
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 drop-shadow-lg font-light opacity-90">
            {carouselImages[currentIndex].subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/calendario"
              className="group bg-[#B15543] hover:bg-[#A03D2A] text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300"
            >
              <span>
                Calendario Experiencias Públicas
              </span>
            </Link>
            
            <Link 
              href="/experiencias-privadas"
              className="group bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 border border-white/50"
            >
              <span>
                Experiencias Privadas
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Controles de navegación mejorados */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Control de autoplay mejorado */}
      <button
        onClick={toggleAutoPlay}
        className="absolute top-24 right-6 bg-white/25 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300 shadow-lg z-20"
      >
        {isAutoPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      {/* Indicadores mejorados */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-300 ${
              index === currentIndex
                ? 'w-12 h-3 bg-[#B15543] rounded-full'
                : 'w-3 h-3 bg-white/50 hover:bg-white/75 rounded-full hover:scale-125'
            }`}
          >
          </button>
        ))}
      </div>

      {/* Barra de progreso mejorada */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            key={currentIndex}
            className="h-full bg-[#B15543] animate-progress"
          />
        </div>
      )}
    </div>
  );
}

