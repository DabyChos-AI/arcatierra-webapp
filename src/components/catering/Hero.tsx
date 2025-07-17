'use client';

import { motion } from 'framer-motion';
import { Calendar, ChefHat, Leaf, Users } from 'lucide-react';

export default function CateringHero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = '5219982270070';
    const message = encodeURIComponent('Hola, me interesa cotizar un evento con Arca Tierra Catering');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/catering/hero-background.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <p className="text-white/90 text-lg mb-4 font-medium">
            Catering consciente y sustentable
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Catering consciente CDMX
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto font-light">
            Nuestra propuesta
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Menús agroecológicos con alimentos frescos, locales y de agricultura regenerativa. 
            <span className="font-semibold text-white"> Experiencia en eventos únicos.</span>
          </p>
        </motion.div>

        {/* Botones principales */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button
            onClick={openWhatsApp}
            style={{
              backgroundColor: '#B15543', /* terracota principal */
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              fontSize: '1.125rem',
              fontWeight: 600,
              transition: 'all 0.3s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#975543'; /* terracota oscuro */
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#B15543'; /* terracota principal */
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Calendar className="w-5 h-5" />
            Cotizar mi evento
          </button>
          <button
            onClick={() => scrollToSection('servicios')}
            style={{
              backgroundColor: '#B15543', /* terracota principal */
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              fontSize: '1.125rem',
              fontWeight: 600,
              transition: 'all 0.3s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#975543'; /* terracota oscuro */
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#B15543'; /* terracota principal */
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChefHat className="w-5 h-5" />
            Ver servicios
          </button>
        </motion.div>

        {/* Tarjetas de valores */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >
          {[
            {
              icon: <Leaf className="w-8 h-8" />,
              title: "10+",
              subtitle: "Años de experiencia"
            },
            {
              icon: <ChefHat className="w-8 h-8" />,
              title: "500+",
              subtitle: "Eventos realizados"
            },
            {
              icon: <Leaf className="w-8 h-8" />,
              title: "100%",
              subtitle: "Ingredientes orgánicos"
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "CDMX",
              subtitle: "Xochimilco y más"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-white mb-3 flex justify-center">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-white/80 text-sm">{item.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
