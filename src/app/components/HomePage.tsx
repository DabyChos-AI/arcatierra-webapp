'use client';

import React from 'react';
import HeroParallax from './HeroParallax';
import ScrollAnimation from '@/components/ui/ScrollAnimation';

export default function HomePage() {
  // Configuración del Hero Parallax con imágenes existentes
  const backgroundImages = [
    {
      src: "/images/nosotros/amanecer_chinampas_xochimilco.JPG", 
      alt: "Amanecer en las chinampas de Xochimilco",
      speed: 0.1,
      zIndex: 1,
      opacity: 1
    },
    {
      src: "/images/home/chinampas_xochimilco.png",
      alt: "Chinampas de Xochimilco",
      speed: 0.25,
      zIndex: 2,
      opacity: 0.9
    },
    {
      src: "/images/home/alimentos_mexicanos_naturales_cdmx.jpg",
      alt: "Alimentos naturales mexicanos",
      speed: 0.4,
      zIndex: 3,
      opacity: 0.7
    }
  ];

  return (
    <main className="min-h-screen bg-arcatierra-beige-bg">
      {/* Hero Section con Parallax */}
      <HeroParallax
        title="Alimentos Mexicanos Naturales"
        subtitle="Conectando comunidades agrícolas con conciencia y sabor"
        ctaText="Descubre nuestras experiencias"
        ctaUrl="/experiencias"
        backgroundImages={backgroundImages}
        height="90vh"
      />
      
      {/* Sección de Bienvenida */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <ScrollAnimation animation="fadeUp" delay={0.2} className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl mb-6 font-playfair text-verde-principal">Bienvenidos a Arca Tierra</h2>
            <p className="mb-8 text-lg text-verde-tipografia">
              Somos una empresa mexicana dedicada a la producción y distribución de alimentos naturales,
              cultivados con prácticas regenerativas y en colaboración con comunidades agrícolas.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <ScrollAnimation animation="fadeRight" delay={0.4}>
                <a href="/productos" className="btn-primary btn-ripple">Ver productos</a>
              </ScrollAnimation>
              <ScrollAnimation animation="fadeLeft" delay={0.6}>
                <a href="/nosotros" className="btn-outline">Conoce nuestra historia</a>
              </ScrollAnimation>
            </div>
          </ScrollAnimation>
        </div>
      </section>
      
      {/* Sección de Destacados con tarjetas avanzadas */}
      <section className="py-16 px-4 bg-neutro-crema/30">
        <div className="container mx-auto">
          <ScrollAnimation animation="fadeIn" className="mb-12">
            <h2 className="text-3xl text-center font-playfair text-verde-principal">Experiencias Destacadas</h2>
          </ScrollAnimation>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Estas tarjetas serán reemplazadas en la siguiente fase con las Tarjetas de Experiencia Avanzadas */}
            {[
              { 
                title: "Catering Orgánico", 
                desc: "Servicio de catering con productos 100% orgánicos para eventos especiales.",
                animation: "fadeUp"
              },
              { 
                title: "Talleres Gastronómicos", 
                desc: "Aprende a cocinar con ingredientes naturales y técnicas tradicionales.",
                animation: "scale"
              },
              { 
                title: "Visita a Chinampas", 
                desc: "Conoce los métodos ancestrales de cultivo en Xochimilco.",
                animation: "fadeUp"
              }
            ].map((item, index) => (
              <ScrollAnimation 
                key={index} 
                animation={item.animation as 'fadeUp' | 'scale'} 
                delay={0.2 * (index + 1)}
              >
                <div className="card card-highlight h-full bg-white shadow-lg rounded-lg p-6 border-l-4 border-dorado-oscuro hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl mb-3 font-playfair text-verde-principal">{item.title}</h3>
                  <p className="text-verde-tipografia mb-4">
                    {item.desc}
                  </p>
                  <a href="#" className="text-dorado-oscuro hover:text-terracota transition-colors duration-300 flex items-center group">
                    Descubrir más
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
