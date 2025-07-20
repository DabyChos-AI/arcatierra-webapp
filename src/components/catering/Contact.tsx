'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Mail, Phone, Instagram, MapPin, Download, Calendar, Users, CheckCircle } from 'lucide-react';
import QuoteRequestModal from './QuoteRequestModal';
import ServicesInfoModal from './ServicesInfoModal';

export default function CateringContact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

  const openQuoteModal = () => {
    setIsQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
  };

  const openServicesModal = () => {
    setIsServicesModalOpen(true);
  };

  const closeServicesModal = () => {
    setIsServicesModalOpen(false);
  };

  const openEmail = (email: string) => {
    const subject = encodeURIComponent('Consulta sobre servicios de catering');
    const body = encodeURIComponent('Hola, me interesa conocer más sobre sus servicios de catering para mi evento.');
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const openInstagram = () => {
    window.open('https://www.instagram.com/arca.tierra', '_blank');
  };

  const openGoogleMaps = () => {
    window.open('https://maps.google.com/?q=Xochimilco,+Ciudad+de+México', '_blank');
  };

  const team = [
    {
      name: "Sofia Santiago",
      role: "Coordinadora de Eventos",
      email: "sofia@arcatierra.com",
      phone: "+52 56 3985 1733"
    },
    {
      name: "Sofia Ortega", 
      role: "Ejecutiva en Catering",
      email: "sofortega@arcatierra.com",
      phone: "+52 56 1057 3296"
    }
  ];

  return (
    <section className="py-20 bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-verde-medium text-lg mb-4 font-medium"
          >
            Planifica tu evento
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-verde-dark mb-6"
          >
            Planifica tu evento con <br />
            Arca Tierra Catering
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-verde-medium max-w-3xl mx-auto"
          >
            Contáctanos y diseñemos juntos la experiencia gastronómica perfecta para tu evento
          </motion.p>
        </div>

        {/* Equipo */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-verde-dark mb-8">
              Nuestro equipo de especialistas
            </h3>
            <div className="space-y-6">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-neutral-light">
                  <h4 className="text-xl font-bold text-verde-dark mb-2">{member.name}</h4>
                  <p className="text-verde-medium mb-4">{member.role}</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => openEmail(member.email)}
                      className="flex items-center gap-2 text-verde-medium hover:text-terracota-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                      className="flex items-center gap-2 text-verde-medium hover:text-terracota-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {member.phone}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-verde-dark mb-8">
              Síguenos en redes sociales
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-light mb-8">
              <button
                onClick={openQuoteModal}
                className="flex items-center gap-2 text-verde-medium hover:text-terracota-primary transition-colors"
              >
                <Instagram className="w-6 h-6" />
                <span className="text-lg">@arca.tierra</span>
              </button>
            </div>

            <div className="bg-terracota-primary rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-4">Respuesta rápida garantizada</h4>
              <p className="text-white/90">
                Nos comprometemos a responder todas las consultas en menos de 24 horas.
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mb-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-light max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-verde-dark mb-4">
              ¿Listo para comenzar?
            </h3>
            <p className="text-xl text-verde-medium mb-8">
              Obtén tu cotización personalizada y descubre cómo podemos hacer de tu evento una experiencia inolvidable
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 text-verde-medium">
                <Calendar className="w-6 h-6 text-terracota-primary" />
                <span>Cotización gratuita en 24 horas</span>
              </div>
              <div className="flex items-center gap-3 text-verde-medium">
                <Users className="w-6 h-6 text-terracota-primary" />
                <span>Menús personalizados</span>
              </div>
              <div className="flex items-center gap-3 text-verde-medium">
                <CheckCircle className="w-6 h-6 text-terracota-primary" />
                <span>Ingredientes 100% orgánicos</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:gap-6">
              <button
                onClick={openQuoteModal}
                style={{
                  backgroundColor: '#B15543', /* terracota principal */
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 500,
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.3s',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#975543'} /* terracota oscuro */
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#B15543'} /* terracota principal */
              >
                <Users className="w-5 h-5" />
                Solicitar cotización
              </button>
              <button
                onClick={openServicesModal}
                style={{
                  backgroundColor: '#33503E', /* verde oscuro */
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.3s',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2A4435'} /* verde más oscuro */
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#33503E'} /* verde oscuro */
              >
                <Download className="w-5 h-5" />
                Conoce más detalles sobre nuestros servicios
              </button>
            </div>
          </div>
        </motion.div>

        {/* Ubicación */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-light max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-terracota-primary" />
              <h3 className="text-2xl font-bold text-verde-dark">
                Servicio en CDMX y área metropolitana
              </h3>
            </div>
            <p className="text-verde-medium mb-6">
              Especialistas en eventos dentro y fuera de las chinampas de Xochimilco
            </p>
            <button
              onClick={openGoogleMaps}
              className="text-terracota-primary hover:text-terracota-dark font-semibold transition-colors underline"
            >
              Haz clic para ver ubicación en Google Maps
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modales */}
      <QuoteRequestModal isOpen={isQuoteModalOpen} onClose={closeQuoteModal} />
      <ServicesInfoModal isOpen={isServicesModalOpen} onClose={closeServicesModal} />
    </section>
  );
}
