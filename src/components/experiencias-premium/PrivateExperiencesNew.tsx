'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { Check, Calendar, Clock, Users } from 'lucide-react'
import ExperienceCard from '@/components/experiencias-premium/ExperienceCard'
import { toast } from 'react-hot-toast'

const PrivateExperiencesNew = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  const controls = useAnimation();
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const privateExperiences = [
    {
      title: "Recorrido por la Chinampa",
      image: "/images/experiencias/que_es_el_turismo_rural.jpg",
      description: "Una visita guiada por las chinampas donde conocerás el sistema agrícola milenario declarado Patrimonio de la Humanidad por la UNESCO.",
      duration: "2-3 horas",
      participants: "2-20 personas",
      location: "Chinampa del Sol, Xochimilco",
      rating: 4.8,
      price: "Desde $650 por persona"
    },
    {
      title: "Taller de cocina chinampera",
      image: "/images/experiencias/experiencias_chinampa_del_sol.jpg",
      description: "Aprende a cocinar platillos tradicionales usando ingredientes recién cosechados de la chinampa, guiado por chefs locales.",
      duration: "3-4 horas",
      participants: "4-12 personas",
      location: "Chinampa del Sol, Xochimilco",
      rating: 4.9,
      price: "Desde $850 por persona"
    },
    {
      title: "Celebración privada en la chinampa",
      image: "/images/experiencias/turismo_rural_xochimilco.jpg",
      description: "Un espacio único para celebraciones especiales con servicio de catering gourmet y actividades personalizadas para tus invitados.",
      duration: "4-6 horas",
      participants: "10-30 personas",
      location: "Chinampa del Sol, Xochimilco",
      rating: 5.0,
      price: "Cotización personalizada"
    }
  ];

  const handleRequestInfo = () => {
    toast.success('¡Gracias por tu interés! En breve nos pondremos en contacto contigo para darte más información sobre las experiencias privadas.', {
      duration: 5000,
      position: 'bottom-center',
      style: {
        background: '#f0f9eb',
        color: '#3c6142',
        border: '1px solid #3c6142',
        maxWidth: '500px'
      }
    });
  };

  return (
    <section ref={ref} className="py-20 px-4 md:px-8 bg-neutro-crema/30 overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-12" variants={containerVariants}>
          <motion.div className="md:w-1/2" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-playfair text-verde-principal mb-4">
              Experiencias privadas
            </h2>
            <div className="prose prose-lg text-verde-tipografia mb-8">
              <p>
                Diseña tu experiencia ideal según tus necesidades. Estas visitas son ideales para grupos, empresas y eventos especiales que desean una atención personalizada.
              </p>
              <p>
                Todas las experiencias pueden adaptarse a tus preferencias y se pueden programar en la fecha que mejor te convenga, sujetas a disponibilidad.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-verde-principal/20 flex items-center justify-center text-verde-principal">
                  <Check size={14} />
                </div>
                <p className="text-verde-tipografia">Visitas guiadas en cualquier día de la semana</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-verde-principal/20 flex items-center justify-center text-verde-principal">
                  <Check size={14} />
                </div>
                <p className="text-verde-tipografia">Menús personalizados según preferencias alimenticias</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-verde-principal/20 flex items-center justify-center text-verde-principal">
                  <Check size={14} />
                </div>
                <p className="text-verde-tipografia">Actividades adaptadas a tus intereses y necesidades</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-verde-principal/20 flex items-center justify-center text-verde-principal">
                  <Check size={14} />
                </div>
                <p className="text-verde-tipografia">Posibilidad de eventos especiales y celebraciones</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRequestInfo}
              className="mt-8 py-3 px-6 bg-verde-principal text-white rounded-md font-medium transition-colors hover:bg-verde-secundario flex items-center"
            >
              <Calendar size={18} className="mr-2" />
              Solicitar información
            </motion.button>
          </motion.div>
          
          <motion.div className="md:w-1/2 relative" variants={itemVariants}>
            <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
              <OptimizedImage 
                src="/images/experiencias/experiencias_de_turismo_gastronomico.tif" 
                alt="Experiencia privada en Chinampa" 
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-white space-y-2">
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-white/80" />
                    <span className="text-sm">Duración personalizada</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users size={16} className="text-white/80" />
                    <span className="text-sm">Grupos desde 2 personas</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex border-b">
                <button 
                  className={`pb-3 px-4 font-medium ${activeTab === 'details' ? 'text-verde-principal border-b-2 border-verde-principal' : 'text-neutral-500'}`} 
                  onClick={() => setActiveTab('details')}
                >
                  Detalles
                </button>
                <button 
                  className={`pb-3 px-4 font-medium ${activeTab === 'faq' ? 'text-verde-principal border-b-2 border-verde-principal' : 'text-neutral-500'}`} 
                  onClick={() => setActiveTab('faq')}
                >
                  FAQ
                </button>
              </div>
              
              <div className="py-4">
                {activeTab === 'details' ? (
                  <div className="space-y-3">
                    <p className="text-verde-tipografia">
                      Las experiencias privadas incluyen guía especializado, alimentos, bebidas y todas las actividades programadas. El transporte puede organizarse con costo adicional.
                    </p>
                    <p className="text-verde-tipografia">
                      Se requiere reservación con al menos 72 horas de anticipación para garantizar disponibilidad y preparar una experiencia a tu medida.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-verde-principal">¿Cuántas personas pueden participar?</h4>
                      <p className="text-sm text-verde-tipografia">Desde 2 personas hasta grupos de 50, dependiendo del tipo de experiencia.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-verde-principal">¿Se puede adaptar para eventos corporativos?</h4>
                      <p className="text-sm text-verde-tipografia">Sí, ofrecemos opciones especiales para team building y eventos empresariales.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-verde-principal">¿Tienen opciones para dietas especiales?</h4>
                      <p className="text-sm text-verde-tipografia">Adaptamos todos los menús según tus necesidades dietéticas (vegetarianos, veganos, sin gluten, etc).</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-playfair text-verde-principal mb-6"
          variants={itemVariants}
        >
          Experiencias que puedes personalizar
        </motion.h3>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {privateExperiences.map((experience, index) => (
            <ExperienceCard 
              key={index} 
              experience={experience} 
              onReserve={handleRequestInfo}
            />
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-12 p-6 bg-white rounded-lg shadow-md"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-verde-principal mb-4">¿Buscas algo específico?</h3>
          <p className="text-verde-tipografia mb-6">
            Si tienes en mente una experiencia particular o necesitas adaptaciones especiales para tu grupo, contáctanos y diseñaremos algo único para ti.
          </p>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); handleRequestInfo(); }}>
            <input 
              type="text" className="p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-principal"
            />
            <input 
              type="email" className="p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-principal"
            />
            <input 
              type="tel" className="p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-principal"
            />
            <input 
              type="text" className="p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-principal"
            />
            <textarea className="p-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-principal md:col-span-2 h-32"
            ></textarea>
            
            <div className="md:col-span-2 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="py-3 px-6 bg-verde-principal text-white rounded-md font-medium transition-colors hover:bg-verde-secundario"
              >
                Enviar solicitud
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PrivateExperiencesNew;
