'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import { faqData, FaqCategory } from '@/data/faq';

export default function FAQPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<FaqCategory>('reservas');
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);

  const togglePregunta = (id: number) => {
    setPreguntaAbierta(preguntaAbierta === id ? null : id);
  };

  const categorias = Object.keys(faqData) as FaqCategory[];
  const datosCategoria = faqData[categoriaActiva];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-terracota-600 via-terracota-700 to-terracota-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-neutral-100" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-playfair font-bold mb-6"
          >
            Preguntas Frecuentes
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-neutral-100 mb-8 max-w-3xl mx-auto"
          >
            Encuentra respuestas a las preguntas más comunes sobre nuestras experiencias
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de categorías */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 sticky top-8"
            >
              <h3 className="font-bold text-neutral-800 mb-4 text-lg">Categorías</h3>
              <div className="space-y-2">
                {categorias.map((categoria) => {
                  const datos = faqData[categoria];
                  const isActive = categoriaActiva === categoria;
                  
                  return (
                    <button
                      key={categoria}
                      onClick={() => setCategoriaActiva(categoria)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-terracota-100 text-terracota-700 border border-terracota-200'
                          : 'hover:bg-neutral-50 text-neutral-600 hover:text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{datos.icon}</span>
                        <div>
                          <div className="font-medium">{datos.title}</div>
                          <div className="text-sm opacity-75">
                            {datos.questions.length} preguntas
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <motion.div
              key={categoriaActiva}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header de la categoría */}
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-terracota-500 to-terracota-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{datosCategoria.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">{datosCategoria.title}</h2>
                    <p className="text-neutral-600">{datosCategoria.questions.length} preguntas en esta categoría</p>
                  </div>
                </div>
              </div>

              {/* Preguntas */}
              <div className="space-y-4">
                {datosCategoria.questions.map((pregunta, index) => (
                  <motion.div
                    key={pregunta.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden"
                  >
                    <button
                      onClick={() => togglePregunta(pregunta.id)}
                      className="w-full p-6 text-left hover:bg-neutral-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-neutral-800 text-lg pr-4">
                          {pregunta.question}
                        </h3>
                        <div className="flex-shrink-0">
                          {preguntaAbierta === pregunta.id ? (
                            <ChevronUp className="w-5 h-5 text-terracota-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-terracota-600" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    <motion.div
                      initial={false}
                      animate={{
                        height: preguntaAbierta === pregunta.id ? 'auto' : 0,
                        opacity: preguntaAbierta === pregunta.id ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t border-neutral-200 pt-4">
                          <p className="text-neutral-700 leading-relaxed">
                            {pregunta.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sección de contacto */}
      <div className="bg-gradient-to-r from-terracota-600 to-terracota-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-xl text-neutral-100 mb-8">
              Nuestro equipo está aquí para ayudarte con cualquier pregunta adicional
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <Phone className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Teléfono</h3>
              <p className="text-neutral-100">+52 55 1234 5678</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <Mail className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-neutral-100">hola@arcatierra.com</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <MessageCircle className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-neutral-100">+52 55 9876 5432</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <a
              href="/experiencias"
              className="bg-white text-terracota-700 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105 inline-block"
            >
              Ver Experiencias
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

