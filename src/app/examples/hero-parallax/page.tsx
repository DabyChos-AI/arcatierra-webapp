import React from 'react';
import HeroParallax from '@/app/components/HeroParallax';

export default function HeroParallaxExample() {
  // Definimos las imágenes para el efecto parallax utilizando imágenes existentes
  const backgroundImages = [
    {
      src: "/images/nosotros/amanecer_chinampas_xochimilco.JPG", // Imagen de fondo
      alt: "Amanecer en las chinampas de Xochimilco",
      speed: 0.1, // Velocidad más lenta para el fondo
      zIndex: 1,
      opacity: 1
    },
    {
      src: "/images/home/chinampas_xochimilco.png", // Capa intermedia
      alt: "Chinampas de Xochimilco",
      speed: 0.2,
      zIndex: 2,
      opacity: 0.9
    },
    {
      src: "/images/home/alimentos_mexicanos_naturales_cdmx.jpg", // Primer plano
      alt: "Alimentos naturales mexicanos",
      speed: 0.4, // Velocidad más rápida para el primer plano
      zIndex: 3,
      opacity: 0.7
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Sección Hero con Parallax */}
      <HeroParallax
        title="Naturaleza y Armonía"
        subtitle="Descubre la conexión con la tierra a través de nuestras experiencias y productos orgánicos"
        ctaText="Explorar Ahora"
        ctaUrl="#experiencias"
        backgroundImages={backgroundImages}
        height="90vh"
      />
      
      {/* Contenido adicional para demostrar el efecto scroll */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl mb-8">Nuestras Experiencias</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Estas tarjetas serán reemplazadas en la siguiente fase con las Tarjetas de Experiencia Avanzadas */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="card card-highlight">
                <h3 className="text-xl mb-2">Experiencia {item}</h3>
                <p className="text-gray-600 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
                </p>
                <a href="#" className="animated-link">Saber más</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
