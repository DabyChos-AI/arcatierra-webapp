'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

const CateringAbout = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-neutral-light cream-section">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-verde-medium mb-4 font-medium">Nuestra propuesta</p>
          <h2 className="text-4xl md:text-5xl font-bold text-verde-dark mb-6">
            Catering consciente<br />
            para eventos únicos
          </h2>
          <p className="text-xl text-verde-medium max-w-4xl mx-auto leading-relaxed">
            Queremos estar más cerca de ustedes y sus momentos más especiales. Llevamos hasta ustedes 
            los mejores ingredientes. Nuestra propuesta de catering consciente es única ya que trabajamos 
            con ingredientes 100 por ciento orgánicos, frescos, locales y de temporada.
          </p>
          <p className="text-lg text-verde-medium max-w-3xl mx-auto mt-6">
            Somos conscientes de que la mejor calidad en alimentos puede tener un impacto positivo 
            en el medio ambiente.
          </p>
        </motion.div>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-12 items-center mb-20"
        >
          {/* Image */}
          <div className="relative">
            <Image
              src="/images/catering/about-catering.jpg"
              alt="Catering consciente Arca Tierra"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-verde-light/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-terracota-primary mb-1">10+</div>
                <div className="text-sm text-verde-medium">Años de experiencia</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-3xl font-bold text-verde-dark mb-6">
              Experiencia comprobada
            </h3>
            <h4 className="text-xl font-semibold text-verde-medium mb-4">
              Más de 10 años de experiencia
            </h4>
            <p className="text-verde-medium mb-6 leading-relaxed">
              Respaldamos nuestra propuesta con más de 10 años de experiencia en eventos dentro y fuera 
              de las chinampas de Xochimilco. Contamos con un equipo sólido, ingredientes de la más alta 
              calidad y la creatividad para diseñar menús únicos en cualquier tipo de evento:
            </p>
            
            {/* Event Types */}
            <div className="flex flex-wrap gap-3 mb-6">
              {['Bodas', 'Corporativos', 'Cumpleaños', 'Activaciones', 'Conferencias'].map((type) => (
                <span 
                  key={type}
                  className="bg-verde-dark/10 text-verde-dark px-4 py-2 rounded-full text-sm font-medium border border-verde-dark/20"
                >
                  {type}
                </span>
              ))}
            </div>
            
            <p className="text-lg font-semibold text-terracota-primary">
              ¡Invítanos a servir tu próximo evento!
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: '🏆', number: '10+', label: 'Años de experiencia' },
            { icon: '🎉', number: '500+', label: 'Eventos realizados' },
            { icon: '🌱', number: '100%', label: 'Ingredientes orgánicos' },
            { icon: '📍', number: 'CDMX', label: 'Xochimilco y más' }
          ].map((stat, index) => (
            <div key={index} className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-verde-light/20">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-terracota-primary mb-2">{stat.number}</div>
              <div className="text-sm text-verde-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CateringAbout;
