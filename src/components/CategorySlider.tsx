'use client';

import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { categories } from '@/data/categories';

export default function CategorySlider() {
  // Autoplay plugin con delay de 4 segundos
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: false })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      skipSnaps: false,
      dragFree: false,
    },
    [autoplayPlugin.current]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      autoplayPlugin.current.stop(); // Detener autoplay al hacer click
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      autoplayPlugin.current.stop(); // Detener autoplay al hacer click
    }
  }, [emblaApi]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Compra por categoría
          </h2>
          <p className="text-xl text-gray-600">
            Encuentra lo que necesitas para tu mesa
          </p>
        </div>

        {/* Slider Container con flechas externas */}
        <div className="relative px-12 lg:px-14">
          {/* Navigation Arrows - Fuera del contenedor */}
          <button
            onClick={scrollPrev}
            className="
              hidden lg:flex
              absolute -left-2 top-1/2 -translate-y-1/2 z-10
              bg-white hover:bg-gray-50 
              rounded-full p-3 shadow-lg
              transition-all hover:scale-110
              border border-gray-200
            "
            aria-label="Categoría anterior"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>

          <button
            onClick={scrollNext}
            className="
              hidden lg:flex
              absolute -right-2 top-1/2 -translate-y-1/2 z-10
              bg-white hover:bg-gray-50
              rounded-full p-3 shadow-lg
              transition-all hover:scale-110
              border border-gray-200
            "
            aria-label="Siguiente categoría"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>

          {/* Embla Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pr-4 lg:pr-6"
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 group overflow-hidden border-0 bg-white rounded-2xl">
                    {/* Image - CUADRADA (1:1) más grande */}
                    <div className="relative aspect-square overflow-hidden bg-white rounded-t-2xl">
                      <OptimizedImage
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      />
                    </div>

                    {/* Content - Texto DEBAJO de la imagen */}
                    <CardContent className="p-6 lg:p-8 text-center">
                      {/* Category name - Sentence case, tamaño igual a virtudes */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-5 text-sm">
                        {category.description}
                      </p>

                      <Link href={category.link} className="block">
                        <Button
                          variant="outline"
                          className="w-full border-terracota text-terracota hover:bg-terracota hover:text-white transition-colors group/btn text-sm py-2.5 rounded-full font-semibold"
                        >
                          <span>Ver productos</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint - Mobile only */}
        <div className="lg:hidden text-center mt-6 text-sm text-gray-500">
          Desliza para ver más categorías →
        </div>
      </div>
    </section>
  );
}
