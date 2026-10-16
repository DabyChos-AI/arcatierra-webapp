'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { aviso } from '@/components/ui/Avisos';

interface CorporateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// CORP1 (R11, C6): el formulario guarda la solicitud de verdad con el MISMO endpoint de /catering/contacto
// (POST /api/catering/solicitud, público, 5/min por IP; la fila cae en la bandeja de Catering y el backend avisa al equipo).
// Antes esperaba 1 s con un setTimeout y decía «enviado» sin llamar a nada. Sin cambio de backend: el modelo es
// `CateringSolicitudRequest` (extra="forbid"), así que lo que no tiene campo propio va doblado en `mensaje`.
// Colores: solo tokens de tailwind.config.ts (las clases `terracota-primary`, `neutral-light`, `verde-medium` y
// `verde-light` no existen: el botón de enviar quedaba blanco sobre blanco).
interface FormCorporativo {
  name: string;
  company: string;
  email: string;
  phone: string;
  eventType: string;
  attendees: string;
  date: string;
  message: string;
}
type CampoCorporativo = keyof FormCorporativo;

const FORM_VACIO: FormCorporativo = {
  name: '',
  company: '',
  email: '',
  phone: '',
  eventType: '',
  attendees: '',
  date: '',
  message: '',
};

const ASISTENTES: { valor: string; etiqueta: string }[] = [
  { valor: '10-30', etiqueta: '10-30 personas' },
  { valor: '31-50', etiqueta: '31-50 personas' },
  { valor: '51-100', etiqueta: '51-100 personas' },
  { valor: '101-200', etiqueta: '101-200 personas' },
  { valor: '201+', etiqueta: 'Más de 200 personas' },
];

// Topes: columnas de `solicitudes_catering` (nombre/empresa 255, tel 50) y `mensaje` ≤ 2000 en el modelo; el texto
// libre deja lugar a las líneas que se le anteponen.
const MAXIMO = { name: 120, company: 160, email: 254, phone: 30, message: 1800 } as const;
const MENSAJE_MAXIMO_API = 2000;

const CORREO_CATERING = 'catering@arcatierra.com';
const TEXTO_ENVIADA = 'Solicitud recibida. Te contactaremos pronto.';
const TEXTO_NO_ENVIADA = `No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos a ${CORREO_CATERING}.`;
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ETIQUETA_CAMPO_API: Record<string, string> = {
  nombre: 'tu nombre',
  email: 'el correo',
  telefono: 'el teléfono',
  empresa: 'la empresa',
  tipo_evento: 'el tipo de evento',
  fecha_evento: 'la fecha',
  mensaje: 'los detalles',
};

/** El primer dato que falta o está mal, o null si todo sirve (el backend valida igual). */
function campoInvalido(f: FormCorporativo): { campo: CampoCorporativo; motivo: string } | null {
  if (!f.name.trim()) return { campo: 'name', motivo: 'Escribe tu nombre.' };
  if (!f.company.trim()) return { campo: 'company', motivo: 'Escribe el nombre de la empresa.' };
  if (!CORREO_VALIDO.test(f.email.trim())) return { campo: 'email', motivo: 'Escribe un correo válido.' };
  if (!f.phone.trim()) return { campo: 'phone', motivo: 'Escribe tu teléfono.' };
  if (!f.eventType) return { campo: 'eventType', motivo: 'Elige el tipo de evento.' };
  if (!f.attendees) return { campo: 'attendees', motivo: 'Elige el número estimado de asistentes.' };
  return null;
}

/** `mensaje` = de dónde viene + los asistentes (rango: no cabe en `numero_personas`, que es un entero) + el texto libre. */
function mensajeParaApi(f: FormCorporativo): string {
  const asistentes = ASISTENTES.find((a) => a.valor === f.attendees)?.etiqueta ?? f.attendees;
  const lineas = ['Propuesta corporativa (formulario de /catering).', `Asistentes estimados: ${asistentes}.`];
  const libre = f.message.trim();
  if (libre) lineas.push('', libre);
  return lineas.join('\n').slice(0, MENSAJE_MAXIMO_API);
}

/** `detail` de FastAPI en texto: un 4xx lo trae como texto; un 422 de Pydantic, como lista de `{loc, msg}`. */
function detalleLegible(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const campos = detail
      .map((d) => {
        const loc = d && typeof d === 'object' && 'loc' in d ? (d as { loc: unknown }).loc : null;
        const campo = Array.isArray(loc) ? loc[loc.length - 1] : null;
        return typeof campo === 'string' && campo in ETIQUETA_CAMPO_API ? ETIQUETA_CAMPO_API[campo] : null;
      })
      .filter((c): c is string => c !== null);
    const unicos = Array.from(new Set(campos));
    if (unicos.length > 0) return `Revisa ${unicos.join(', ')}.`;
  }
  return 'Revisa los datos del formulario.';
}

const claseCampo =
  'w-full px-4 py-2 border rounded-lg text-verde-tipografia focus:ring-2 focus:ring-terracota focus:border-transparent outline-none transition';
const claseEtiqueta = 'block text-sm font-medium text-verde-principal mb-1';

export default function CorporateRequestModal({ isOpen, onClose }: CorporateRequestModalProps) {
  const [formData, setFormData] = useState<FormCorporativo>(FORM_VACIO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [invalido, setInvalido] = useState<CampoCorporativo | null>(null);
  // Candado contra doble clic: se pone ANTES del await (un solo POST) y se suelta en el finally.
  const enviandoRef = useRef(false);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    company: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    eventType: useRef<HTMLSelectElement>(null),
    attendees: useRef<HTMLSelectElement>(null),
    date: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsSubmitted(false);
        setInvalido(null);
        setFormData(FORM_VACIO);
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (invalido === name) setInvalido(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviandoRef.current) return;
    const falta = campoInvalido(formData);
    if (falta) {
      setInvalido(falta.campo);
      aviso.error(falta.motivo);
      refs[falta.campo].current?.focus();
      return;
    }
    const body = {
      nombre: formData.name.trim(),
      email: formData.email.trim(),
      telefono: formData.phone.trim() || null,
      tipo_evento: formData.eventType || null,
      fecha_evento: formData.date || null,
      numero_personas: null,
      empresa: formData.company.trim() || null,
      mensaje: mensajeParaApi(formData),
    };

    enviandoRef.current = true;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/catering/solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const datos: unknown = await res.json().catch(() => null);
      if (res.ok) {
        const message = datos && typeof datos === 'object' ? (datos as { message?: unknown }).message : null;
        aviso.exito(typeof message === 'string' && message.trim() ? message : TEXTO_ENVIADA);
        setInvalido(null);
        setIsSubmitted(true);
        return;
      }
      // El modal no se cierra en error: lo escrito se queda para reintentar.
      const detail = datos && typeof datos === 'object' ? (datos as { detail?: unknown }).detail : null;
      aviso.error(res.status >= 400 && res.status < 500 ? detalleLegible(detail) : TEXTO_NO_ENVIADA);
    } catch {
      aviso.error(TEXTO_NO_ENVIADA);
    } finally {
      enviandoRef.current = false;
      setIsSubmitting(false);
    }
  };

  const bordeCampo = (campo: CampoCorporativo) => (invalido === campo ? 'border-terracota' : 'border-neutro-borde');

  if (!isOpen) return null;

  return (
    // z-[950] y pt-36 como ProductQuickView (Z_INDEX_HIERARCHY.md, modales públicos): con z-50 el encabezado público (z 1000+)
    // tapaba el título y la burbuja de WhatsApp y el tirador del carrito quedaban encima del modal. Hace scroll el fondo.
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-[950] pt-36 px-4 pb-8 overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="corp-titulo"
        data-testid="corp-modal"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 id="corp-titulo" className="text-2xl font-bold text-verde-dark">
              {isSubmitted ? 'Solicitud Enviada' : 'Solicitar Propuesta Corporativa'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-verde-principal hover:text-terracota rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="text-center py-8" data-testid="corp-exito">
              <div className="w-16 h-16 bg-neutro-crema rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-verde-dark" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-verde-dark mb-2">¡Gracias por tu interés!</h3>
              <p className="text-verde-principal mb-6">
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
            <form onSubmit={handleSubmit} data-testid="corp-formulario">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className={claseEtiqueta}>Nombre completo*</label>
                  <input
                    ref={refs.name}
                    type="text"
                    id="name"
                    name="name"
                    data-testid="corp-nombre"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={MAXIMO.name}
                    aria-invalid={invalido === 'name'}
                    className={`${claseCampo} ${bordeCampo('name')}`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="company" className={claseEtiqueta}>Empresa*</label>
                  <input
                    ref={refs.company}
                    type="text"
                    id="company"
                    name="company"
                    data-testid="corp-empresa"
                    value={formData.company}
                    onChange={handleChange}
                    maxLength={MAXIMO.company}
                    aria-invalid={invalido === 'company'}
                    className={`${claseCampo} ${bordeCampo('company')}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="email" className={claseEtiqueta}>Correo electrónico*</label>
                  <input
                    ref={refs.email}
                    type="email"
                    id="email"
                    name="email"
                    data-testid="corp-email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={MAXIMO.email}
                    aria-invalid={invalido === 'email'}
                    className={`${claseCampo} ${bordeCampo('email')}`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={claseEtiqueta}>Teléfono*</label>
                  <input
                    ref={refs.phone}
                    type="tel"
                    id="phone"
                    name="phone"
                    data-testid="corp-telefono"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={MAXIMO.phone}
                    aria-invalid={invalido === 'phone'}
                    className={`${claseCampo} ${bordeCampo('phone')}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="eventType" className={claseEtiqueta}>Tipo de evento*</label>
                  <select
                    ref={refs.eventType}
                    id="eventType"
                    name="eventType"
                    data-testid="corp-tipo"
                    value={formData.eventType}
                    onChange={handleChange}
                    aria-invalid={invalido === 'eventType'}
                    className={`${claseCampo} ${bordeCampo('eventType')}`}
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
                  <label htmlFor="attendees" className={claseEtiqueta}>Número estimado de asistentes*</label>
                  <select
                    ref={refs.attendees}
                    id="attendees"
                    name="attendees"
                    data-testid="corp-personas"
                    value={formData.attendees}
                    onChange={handleChange}
                    aria-invalid={invalido === 'attendees'}
                    className={`${claseCampo} ${bordeCampo('attendees')}`}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    {ASISTENTES.map((a) => (
                      <option key={a.valor} value={a.valor}>{a.etiqueta}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="date" className={claseEtiqueta}>Fecha tentativa del evento</label>
                <input
                  ref={refs.date}
                  type="date"
                  id="date"
                  name="date"
                  data-testid="corp-fecha"
                  value={formData.date}
                  onChange={handleChange}
                  className={`${claseCampo} ${bordeCampo('date')}`}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className={claseEtiqueta}>Detalles adicionales</label>
                <textarea
                  ref={refs.message}
                  id="message"
                  name="message"
                  data-testid="corp-mensaje"
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={MAXIMO.message}
                  rows={4}
                  className={`${claseCampo} ${bordeCampo('message')}`}
                  placeholder="Cuéntanos más sobre tu evento, necesidades dietéticas especiales, ubicación, etc."
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  data-testid="corp-enviar"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className={`bg-terracota hover:bg-terracota-oscuro text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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
