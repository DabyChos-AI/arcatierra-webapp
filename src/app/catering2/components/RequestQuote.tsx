'use client';

import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Users, CalendarDays, Send, ShoppingCart } from 'lucide-react';
import { useQuoteCart } from '../context/QuoteCartContext';
import { useToast } from '@/components/ui/Toast';

export default function RequestQuote() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { items, totalEstimate, clearCart } = useQuoteCart();
  const toast = useToast();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoEvento: '',
    fecha: '',
    hora: '',
    invitados: '',
    mensaje: '',
    aceptaPromos: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      aceptaPromos: checked
    }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Preparar los datos para enviar a la API
    const quoteData = {
      contactInfo: { ...formData },
      items: items,
      totalEstimate: totalEstimate,
      timestamp: new Date().toISOString()
    };
    
    // Simular envío a API/n8n
    console.log('Enviando datos a la API:', quoteData);
    
    try {
      // Aquí iría la llamada real a la API o n8n
      // await fetch('api/quote-request', { method: 'POST', body: JSON.stringify(quoteData) });
      
      // Simulación de envío exitoso
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
        
        // Mostrar notificación de éxito
        toast.success('Te contactaremos pronto con tu cotización personalizada.', {
          title: '¡Cotización enviada!'
        });
        
        // Limpiar el carrito después del envío exitoso
        clearCart();
        
        // Reset form después de 3 segundos
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            nombre: '',
            email: '',
            telefono: '',
            tipoEvento: '',
            fecha: '',
            hora: '',
            invitados: '',
            mensaje: '',
            aceptaPromos: false
          });
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('Error al enviar la cotización:', error);
      setSubmitting(false);
      toast.error('Hubo un problema al enviar tu cotización. Inténtalo nuevamente.', {
        title: 'Error'
      });
    }
  };

  return (
    <section id="request-quote" className="py-24 bg-verde-principal">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Formulario de contacto */}
          <motion.div 
            variants={fadeIn('right', 0.3)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-3xl font-bold text-verde-tipografia mb-6">
                Solicita tu cotización personalizada
              </h2>
              
              <p className="text-gray-600 mb-8">
                Cuéntanos sobre tu evento y nuestro equipo se pondrá en contacto contigo para ofrecerte un servicio a la medida de tus necesidades.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                    <Input 
                      id="nombre"
                      name="nombre"
                      type="text" 
                      placeholder="Tu nombre" 
                      required 
                      className="w-full"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="tu@email.com" 
                      required 
                      className="w-full"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <Input 
                      id="telefono"
                      name="telefono"
                      type="tel" 
                      placeholder="Tu número de contacto" 
                      required 
                      className="w-full"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="tipoEvento" className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento</label>
                    <select 
                      id="tipoEvento"
                      name="tipoEvento"
                      required 
                      className="w-full h-10 px-3 rounded-md border border-input bg-white text-sm"
                      value={formData.tipoEvento}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="boda">Boda</option>
                      <option value="corporativo">Evento corporativo</option>
                      <option value="cumpleanos">Cumpleaños</option>
                      <option value="social">Evento social</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Fecha del evento</span>
                    </label>
                    <Input 
                      id="fecha"
                      name="fecha"
                      type="date" 
                      className="w-full"
                      value={formData.fecha}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Clock size={14} />
                      <span>Hora</span>
                    </label>
                    <Input 
                      id="hora"
                      name="hora" 
                      type="time" 
                      className="w-full"
                      value={formData.hora}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="invitados" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Users size={14} />
                      <span>Número de invitados</span>
                    </label>
                    <Input 
                      id="invitados"
                      name="invitados" 
                      type="number" 
                      placeholder="0" 
                      min="1"
                      className="w-full"
                      value={formData.invitados}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">Detalles adicionales</label>
                  <textarea 
                    id="mensaje"
                    name="mensaje" 
                    rows={4} 
                    placeholder="Cuéntanos más sobre tu evento, necesidades dietéticas especiales, etc." 
                    className="w-full px-3 py-2 rounded-md border border-input resize-none"
                    value={formData.mensaje}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={formData.aceptaPromos}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Acepto recibir información sobre servicios y promociones de Arca Tierra
                  </label>
                </div>
                
                {/* Resumen de la cotización actual si hay elementos */}
                {items.length > 0 && (
                  <div className="mb-4 p-4 bg-terracota-claro/10 rounded-lg border border-terracota-claro/20">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <ShoppingCart size={16} />
                      Resumen de tu cotización actual
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">Items seleccionados: {items.length}</p>
                    <p className="text-sm font-medium">Estimado total: ${totalEstimate.toLocaleString('es-MX')}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-terracota-principal hover:bg-terracota-oscuro text-white"
                  disabled={submitting || submitted}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></span>
                      Enviando...
                    </span>
                  ) : submitted ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      ¡Enviado con éxito!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={16} />
                      {items.length > 0 ? 'Enviar cotización' : 'Solicitar información'}
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
          
          {/* Información complementaria */}
          <motion.div 
            variants={fadeIn('left', 0.3)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-white"
          >
            <h3 className="text-2xl font-bold mb-6">¿Por qué elegir nuestro servicio de catering?</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-terracota-principal flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Planificación perfecta</h4>
                  <p className="text-white/80">Coordinamos cada detalle para que tu evento sea perfecto, desde la selección de ingredientes hasta la presentación final.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-terracota-principal flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Sostenibilidad en acción</h4>
                  <p className="text-white/80">Cada evento es una oportunidad para demostrar que la gastronomía de alta calidad puede ser también respetuosa con el medio ambiente.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-terracota-principal flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Servicio rápido y eficiente</h4>
                  <p className="text-white/80">Respondemos a todas las solicitudes en menos de 24 horas con una cotización personalizada para tu evento.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <h4 className="text-xl font-semibold mb-3">Horario de atención</h4>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Lunes a Viernes</span>
                  <span>9:00 - 18:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sábados</span>
                  <span>10:00 - 14:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Domingos</span>
                  <span>Cerrado</span>
                </li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span>+52 55 1234 5678</span>
                </p>
                <p className="flex items-center gap-2 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>catering@arcatierra.com</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
