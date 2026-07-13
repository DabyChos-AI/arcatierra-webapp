'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { heroSlides, HeroSlide } from '@/data/heroSlides';

export default function HeroSlideshow() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 30 
    },
    [Autoplay({ delay: 7000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative min-h-screen overflow-hidden mt-[-88px]">
      {/* Embla Viewport */}
      <div className="overflow-hidden h-screen" ref={emblaRef}>
        <div className="flex h-full">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <OptimizedImage
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={slide.id === 1}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div 
                    className={`
                      max-w-2xl
                      ${slide.overlayPosition === 'left' ? 'text-left' : ''}
                      ${slide.overlayPosition === 'center' ? 'mx-auto text-center' : ''}
                      ${slide.overlayPosition === 'right' ? 'ml-auto text-right' : ''}
                    `}
                  >
                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                      {slide.subtitle}
                    </p>

                    {/* CTA Button */}
                    <Link href={slide.ctaLink}>
                      <Button 
                        size="lg" 
                        className="bg-terracota hover:bg-terracota-dark text-white px-8 py-6 text-lg font-semibold group"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="
          absolute left-4 top-1/2 -translate-y-1/2 z-20
          bg-white/20 hover:bg-white/30 backdrop-blur-sm
          rounded-full p-3 transition-all
          text-white hover:scale-110
        "
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={scrollNext}
        className="
          absolute right-36 md:right-28 lg:right-16 top-1/2 -translate-y-1/2 z-20
          bg-white/20 hover:bg-white/30 backdrop-blur-sm
          rounded-full p-3 transition-all
          text-white hover:scale-110
        "
        aria-label="Siguiente slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Scroll Indicator (only on first slide) */}
      {selectedIndex === 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
          </div>
        </div>
      )}
    </section>
  );
}
