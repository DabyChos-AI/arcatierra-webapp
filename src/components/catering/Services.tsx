'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Coffee, Utensils, Users, Clock, Leaf, ChefHat } from 'lucide-react';
import QuoteRequestModal from './QuoteRequestModal';

export default function CateringServices() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const openQuoteModal = () => {
    setIsQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
  };

  const openWhatsApp = () => {
    const phoneNumber = '525639851733';
    const message = encodeURIComponent('Hola, me interesa conocer más sobre sus servicios de catering');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const services = [
    {
      title: "Family Style",
      description: "Platillos servidos al centro para crear un ambiente relajado y de convivencia.",
      icon: <Users className="w-8 h-8" />,
      image: "/images/catering/family-style.jpg"
    },
    {
      title: "Canapés",
      description: "Selección canapés salados y dulces.",
      icon: <Utensils className="w-8 h-8" />,
      image: "/images/catering/canapes.jpg"
    },
    {
      title: "Emplatado",
      description: "Menú individual donde cada platillo servido de forma elegante y personalizada.",
      icon: <ChefHat className="w-8 h-8" />,
      image: "/images/catering/emplatado.jpg"
    },
    {
      title: "Desayuno y Coffee Break",
      description: "Ya sea emplatado o estilo buffet. Ofrecemos una gran variedad de opciones tales como fruta, granola, pan dulce, platillos tradicionales, guisados, tortillas hechas a mano, café, infusiones, galletas y agua fresca.",
      icon: <Coffee className="w-8 h-8" />,
      image: "/images/catering/coffee-break.jpg"
    },
    {
      title: "Menú por estaciones",
      description: "Estaciones de antojitos mexicanos y platillos para servicio self-service.",
      icon: <Clock className="w-8 h-8" />,
      image: "/images/catering/estaciones.jpg"
    },
    {
      title: "Menús de temporada",
      description: "Diseñamos menús de temporada con ingredientes frescos y locales, garantizando sabores deliciosos y responsables. Trabajamos de la mano de nuestros chefs para ofrecer platillos inspirados en la temporada.",
      icon: <Leaf className="w-8 h-8" />,
      image: "/images/catering/menu-temporada.jpg"
    }
  ];

  return (
    <>
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-verde-medium text-lg mb-4 font-medium"
          >
            Nuestros servicios
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-verde-dark mb-6"
          >
            Nos adaptamos a tus necesidades
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-verde-medium max-w-3xl mx-auto"
          >
            Además de hacer menús a la medida, ofrecemos todo tipo de servicio
          </motion.p>
        </div>

        {/* Grid de servicios */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Imagen de fondo */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: `url(${service.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              
              {/* Contenido */}
              <div className="relative z-10 p-6 h-80 flex flex-col justify-end">
                <div className="text-white mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-light max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-verde-dark mb-4">
              ¿Listo para planificar tu evento?
            </h3>
            <p className="text-verde-medium mb-6">
              Contáctanos y diseñemos juntos el menú perfecto para tu ocasión especial
            </p>
            <button
              onClick={openQuoteModal}
              style={{
                backgroundColor: '#B15543', /* terracota principal */
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '9999px',
                fontSize: '1.125rem',
                fontWeight: 600,
                transition: 'all 0.3s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
              Solicitar cotización
            </button>
          </div>
        </motion.div>
      </div>
    </section>
    
    {/* Modal de solicitud de cotización */}
    <QuoteRequestModal 
      isOpen={isQuoteModalOpen} 
      onClose={closeQuoteModal} 
    />
    </>
  );
}
