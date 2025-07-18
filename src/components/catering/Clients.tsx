'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Star, Building, Users, TrendingUp } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import CorporateRequestModal from './CorporateRequestModal';

export default function CateringClients() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openRequestModal = () => {
    setIsModalOpen(true);
  };
  
  const closeRequestModal = () => {
    setIsModalOpen(false);
  };

  const clients = [
    {
      name: "Rólex",
      category: "Lujo",
      logo: "",
      hasLogo: false
    },
    {
      name: "Google",
      category: "Tecnología", 
      logo: "/images/catering/logos/google-logo.png",
      hasLogo: true
    },
    {
      name: "Spotify",
      category: "Entretenimiento",
      logo: "/images/catering/logos/spotify-logo.png",
      hasLogo: true
    },
    {
      name: "Santander",
      category: "Financiero",
      logo: "/images/catering/logos/santander-logo.png",
      hasLogo: true
    },
    {
      name: "Waverley Street Foundation",
      category: "Fundación",
      hasLogo: false
    },
    {
      name: "Fundación Herdez",
      category: "Fundación",
      hasLogo: false
    },
    {
      name: "Mandoka",
      category: "Corporativo",
      hasLogo: false
    },
    {
      name: "CENTRO",
      category: "Cultural",
      hasLogo: false
    }
  ];

  const testimonials = [
    {
      text: "La experiencia con Arca Tierra fue excepcional. Los ingredientes frescos y la presentación impecable hicieron de nuestro evento corporativo un éxito total.",
      author: "Evento Corporativo",
      company: "Cliente Satisfecho",
      rating: 5
    },
    {
      text: "Su compromiso con la sustentabilidad y la calidad de los alimentos orgánicos se refleja en cada platillo. Altamente recomendado para eventos especiales.",
      author: "Evento Privado", 
      company: "Cliente Frecuente",
      rating: 5
    }
  ];

  const stats = [
    {
      icon: <Building className="w-8 h-8" />,
      number: "8+",
      label: "Clientes corporativos"
    },
    {
      icon: <Users className="w-8 h-8" />,
      number: "95%",
      label: "Satisfacción del cliente"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      number: "100+",
      label: "Eventos corporativos"
    }
  ];

  return (
    <section className="py-20 cream-section bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-lg mb-4 font-medium text-verde-medium"
          >
            Confianza empresarial
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-verde-dark"
          >
            Clientes destacados
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto text-verde-medium"
          >
            Empresas líderes confían en nosotros para sus eventos más importantes
          </motion.p>
        </div>

        {/* Grid de clientes */}
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {clients.map((client, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center border border-neutral-light"
            >
              {client.hasLogo && client.logo ? (
                <div className="h-16 flex items-center justify-center mb-4">
                  <OptimizedImage
                    src={client.logo}
                    alt={`${client.name} logo`}
                    width={120}
                    height={60}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="h-16 flex items-center justify-center mb-4">
                  <h3 className="text-lg font-bold text-verde-dark">{client.name}</h3>
                </div>
              )}
              <p className="text-sm font-medium text-verde-medium">{client.category}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-neutral-light relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-terracota-primary to-terracota-light"></div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg text-verde-dark mb-6 leading-relaxed relative z-10">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>
              
              <div className="relative z-10">
                <p className="font-semibold text-verde-dark">{testimonial.author}</p>
                <p className="text-verde-medium text-sm">{testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Corporativo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-light max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-verde-dark mb-4">
              ¿Tu empresa será la siguiente?
            </h3>
            <p className="text-verde-medium mb-6">
              Únete a las empresas líderes que confían en Arca Tierra para sus eventos corporativos y celebraciones especiales
            </p>
            <button
              onClick={openRequestModal}
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
              Solicitar propuesta corporativa
            </button>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-terracota-primary rounded-full text-white mb-4">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold text-verde-dark mb-2">{stat.number}</h3>
              <p className="text-verde-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Modal de solicitud corporativa */}
      <CorporateRequestModal 
        isOpen={isModalOpen} 
        onClose={closeRequestModal} 
      />
    </section>
  );
}
