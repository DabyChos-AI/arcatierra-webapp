'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Clock, Send, CheckCircle } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuoteRequestModal({ isOpen, onClose }: QuoteRequestModalProps) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    guestCount: '',
    eventDate: '',
    eventLocation: '',
    message: '',
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validacion cliente basica
    const nombre = formState.name.trim();
    const email = formState.email.trim();
    if (!nombre) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const guests = formState.guestCount ? Number(formState.guestCount) : NaN;
    const numeroPersonas = Number.isFinite(guests) && guests > 0 ? Math.floor(guests) : null;
    const mensaje =
      [
        formState.eventLocation ? `Ubicación: ${formState.eventLocation}` : '',
        formState.message,
      ]
        .filter(Boolean)
        .join('\n') || null;

    const body = {
      nombre,
      email,
      telefono: formState.phone || null,
      tipo_evento: formState.eventType || null,
      fecha_evento: formState.eventDate || null,
      numero_personas: numeroPersonas,
      mensaje,
    };

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/catering/solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const detail =
          data && typeof data === 'object' && 'detail' in data
            ? (data as { detail?: unknown }).detail
            : null;
        throw new Error(
          typeof detail === 'string'
            ? detail
            : 'No se pudo enviar la solicitud, intenta de nuevo.',
        );
      }
      const data = (await res.json()) as { success?: boolean; message?: string };
      setSuccessMessage(data.message ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo enviar la solicitud, intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  const closeModal = () => {
    onClose();
    // Retraso para resetear el estado después de que se cierre la animación
    setTimeout(() => {
      if (submitted) setSubmitted(false);
      setError(null);
      setSuccessMessage(null);
    }, 300);
  };
  
  const eventTypes = [
    'Boda',
    'Corporativo',
    'Cumpleaños',
    'Aniversario',
    'Baby shower',
    'Bridal shower',
    'Otro'
  ];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-screen flex items-start justify-center pt-36 px-4 pb-8"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto max-h-[calc(100vh-180px)] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-verde-medium to-verde-dark p-6 text-white relative">
                <button 
                  onClick={closeModal}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    padding: '4px',
                    border: '1px solid white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  aria-label="Cerrar modal"
                >
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold">Cotiza tu evento</h3>
                <p style={{ color: 'white', fontWeight: '500' }}>
                  Obtén una cotización personalizada para tu evento en menos de 24 horas
                </p>
              </div>
              
              {/* Content */}
              <div className="p-6" style={{ color: '#1F2937' }}>
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div
                        role="alert"
                        className="rounded-lg border px-4 py-3 text-sm"
                        style={{ backgroundColor: '#FEE2E2', borderColor: '#DC2626', color: '#991B1B' }}
                      >
                        {error}
                      </div>
                    )}
                    {/* Información personal */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold" style={{ color: 'white', fontWeight: '700' }}>Tu información</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: '#33503E', fontWeight: '600' }}>
                            Nombre completo *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formState.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-verde-medium focus:border-transparent outline-none transition"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#33503E', fontWeight: '600' }}>
                            Correo electrónico *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formState.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-verde-medium focus:border-transparent outline-none transition"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: '#33503E', fontWeight: '600' }}>
                            Teléfono *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={formState.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-verde-medium focus:border-transparent outline-none transition"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Información del evento */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold" style={{ color: 'white', fontWeight: '700' }}>Información del evento</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="eventType" className="block text-sm font-medium mb-1" style={{ color: '#33503E', fontWeight: '600' }}>
                            Tipo de evento *
                          </label>
                          <select
                            id="eventType"
                            name="eventType"
                            required
                            value={formState.eventType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-verde-medium focus:border-transparent outline-none transition"
                          >
                            <option value="" style={{ color: '#1F2937' }}>Selecciona una opción</option>
                            {eventTypes.map((type) => (
                              <option key={type} value={type} style={{ color: '#1F2937' }}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="guestCount" className="block text-sm font-medium mb-1" style={{ color: '#33503E', fontWeight: '600' }}>
                            Número de invitados *
                          </label>
                          <input
                            type="number"
                            id="guestCount"
                            name="guestCount"
                            required
                            min="1"
                            value={formState.guestCount}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-verde-medium focus:border-transparent outline-none transition"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="eventDate" className="block text-sm font-medium mb-1" style={{ color: '#33503E', fontWeight: '600' }}>
                            Fecha del evento
                          </label>
                          <input
                            type="date"
                            id="eventDate"
                            name="eventDate"
                            value={formState.eventDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-verde-medium focus:border-transparent outline-none transition"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="eventLocation" className="block text-sm font-medium mb-1" style={{ color: '#33503E', fontWeight: '600' }}>
                            Lugar del evento
                          </label>
                          <input
                            type="text"
                            id="eventLocation"
                            name="eventLocation"
                            value={formState.eventLocation}
                            onChange={handleChange}
                            placeholder="Ciudad o ubicación"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-verde-medium focus:border-transparent outline-none transition placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1" style={{ color: '#33503E', fontWeight: '600' }}>
                          Detalles adicionales
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={3}
                          value={formState.message}
                          onChange={handleChange}
                          placeholder="Cuéntanos más sobre tu evento, requerimientos especiales, etc."
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-verde-medium focus:border-transparent outline-none transition resize-none placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    
                    {/* Footer con beneficios */}
                    <div className="pt-4 border-t border-neutral-200">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2" style={{ color: '#1F2937', fontWeight: '600' }}>
                          <Clock className="w-5 h-5" style={{ color: '#B15543' }} />
                          <span>Respuesta en 24h</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: '#1F2937', fontWeight: '600' }}>
                          <Users className="w-5 h-5" style={{ color: '#B15543' }} />
                          <span>Evento a tu medida</span>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          backgroundColor: '#B15543', /* terracota principal */
                          color: 'white',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          fontWeight: 500,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'background-color 0.3s',
                          border: 'none',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          opacity: submitting ? 0.6 : 1,
                        }}
                        onMouseOver={(e) => {if (!submitting) e.currentTarget.style.backgroundColor = '#975543'}} /* terracota oscuro */
                        onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#B15543'}} /* terracota principal */
                      >
                        <Send className="w-5 h-5" />
                        {submitting ? 'Enviando…' : 'Solicitar cotización gratuita'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-light rounded-full text-verde-dark mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2" style={{ color: '#33503E' }}>¡Gracias por contactarnos!</h4>
                    <p className="mb-6" style={{ color: '#1F2937', fontWeight: '500' }}>
                      {successMessage ??
                        'Hemos recibido tu solicitud de cotización. Nuestro equipo te contactará en menos de 24 horas con una propuesta personalizada.'}
                    </p>
                    <button
                      onClick={closeModal}
                      style={{
                        backgroundColor: '#33503E', /* verde oscuro */
                        color: 'white',
                        padding: '0.75rem 2rem',
                        borderRadius: '0.5rem',
                        fontWeight: 500,
                        transition: 'background-color 0.3s',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#2A4435'}} /* verde más oscuro */
                      onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#33503E'}} /* verde oscuro */
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
