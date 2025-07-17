'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CorporateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CorporateRequestModal({ isOpen, onClose }: CorporateRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    eventType: '',
    attendees: '',
    date: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          eventType: '',
          attendees: '',
          date: '',
          message: '',
        });
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Aquí se implementaría la lógica real de envío del formulario
      // Por ahora, simulamos un envío exitoso después de 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En un caso real, aquí se enviaría el formulario a una API
      console.log('Formulario enviado:', formData);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-verde-dark">
              {isSubmitted ? 'Solicitud Enviada' : 'Solicitar Propuesta Corporativa'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-verde-medium hover:text-terracota-primary rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-verde-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-verde-dark" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-verde-dark mb-2">¡Gracias por tu interés!</h3>
              <p className="text-verde-medium mb-6">
                Hemos recibido tu solicitud y nos pondremos en contacto contigo en las próximas 24 horas para proporcionarte una propuesta personalizada.
              </p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#B15543', /* terracota principal */
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  fontWeight: 500,
                  transition: 'background-color 0.3s',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#975543'} /* terracota oscuro */
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#B15543'} /* terracota principal */
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-verde-medium mb-1">Nombre completo*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-verde-light focus:border-verde-medium outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-verde-medium mb-1">Empresa*</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-verde-light focus:border-verde-medium outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-verde-medium mb-1">Correo electrónico*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-verde-light focus:border-verde-medium outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-verde-medium mb-1">Teléfono*</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-verde-light focus:border-verde-medium outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-verde-medium mb-1">Tipo de evento*</label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-verde-light focus:border-verde-medium outline-none transition"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Corporativo">Evento corporativo</option>
                    <option value="Celebración">Celebración privada</option>
                    <option value="Lanzamiento">Lanzamiento de producto</option>
                    <option value="Conferencia">Conferencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="attendees" className="block text-sm font-medium text-verde-medium mb-1">Número estimado de asistentes*</label>
                  <select
                    id="attendees"
                    name="attendees"
                    value={formData.attendees}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-verde-light focus:border-verde-medium outline-none transition"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="10-30">10-30 personas</option>
                    <option value="31-50">31-50 personas</option>
                    <option value="51-100">51-100 personas</option>
                    <option value="101-200">101-200 personas</option>
                    <option value="201+">Más de 200 personas</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-verde-medium mb-1">Fecha tentativa del evento</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-verde-light focus:border-verde-medium outline-none transition"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-verde-medium mb-1">Detalles adicionales</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-verde-light focus:border-verde-medium outline-none transition"
                  placeholder="Cuéntanos más sobre tu evento, necesidades dietéticas especiales, ubicación, etc."
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-terracota-primary hover:bg-terracota-dark text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
