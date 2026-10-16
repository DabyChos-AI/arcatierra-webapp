'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Truck, Clock, Calendar, CheckCircle, Leaf, Package, Star, Send } from 'lucide-react'
import { aviso } from '@/components/ui/Avisos'
import { API_URL } from '@/lib/api'
import OptimizedImage from '@/components/ui/OptimizedImage'

// Definición de colores según manual de identidad
const colors = {
  terracota: {
    principal: '#B15543',
    medio: '#BA6440',
    oscuro: '#975543'
  },
  verde: {
    tipografia: '#3A4741',
    principal: '#33503E',
    claro: '#475A52',
    suave: '#748880'
  },
  neutros: {
    crema: '#E3DBCB',
    beigeMedio: '#CCBB9A',
    beigeCalido: '#DCB584',
    grisAzulado: '#C1CCCE'
  }
}

// Componente de carrusel de imágenes
const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const images = [
    { url: '/images/restaurantes/restaurantes_entrega_carrusel1.jpg', alt: 'Entrega de productos agroecológicos frescos' },
    { url: '/images/restaurantes/restaurantes_entrega_carrusel2.jpg', alt: 'Servicio de entrega directa del campo' },
    { url: '/images/restaurantes/restaurantes_entrega_carrusel3.jpg', alt: 'Productos frescos para restaurantes' },
    { url: '/images/restaurantes/Restaurantes_entrega_carrusel4.jpg', alt: 'Entrega de ingredientes de chinampas' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl shadow-xl">
      {/* Imágenes del carrusel */}
      {images.map((image, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-500 ${
            idx === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* IMG2 (R11): por el optimizador (AVIF/WebP); fotos de ~600 KB */}
          <OptimizedImage
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1536px) 1536px, 100vw"
            priority={idx === 0}
            style={{ objectFit: 'contain' }}
            className="object-contain"
          />
        </div>
      ))}
      
      {/* Controles del carrusel */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 hover:scale-110"
        style={{ color: colors.terracota.principal }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 hover:scale-110"
        style={{ color: colors.terracota.principal }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Interfaz para ServiceCard
interface ServiceCardProps {
  icon: React.ElementType;
  text: string;
}

// Componente de tarjeta de servicio
const ServiceCard = ({ icon: Icon, text }: ServiceCardProps) => (
  <div 
    className="flex items-start gap-4 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
    style={{ backgroundColor: colors.neutros.crema }}
  >
    <div 
      className="p-3 rounded-full"
      style={{ backgroundColor: colors.verde.principal }}
    >
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p style={{ color: colors.verde.tipografia }} className="flex-1 text-lg">
      {text}
    </p>
  </div>
)

// Interfaz para ProcessStep
interface ProcessStepProps {
  icon: React.ElementType;
  title: string;
  number: number;
}

// Componente de paso del proceso
const ProcessStep = ({ icon: Icon, title, number }: ProcessStepProps) => (
  <div className="text-center group">
    <div 
      className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
      style={{ backgroundColor: colors.verde.suave }}
    >
      <Icon className="w-10 h-10 text-white" />
    </div>
    <div 
      className="text-sm font-bold mb-2"
      style={{ color: colors.terracota.principal }}
    >
      Paso {number}
    </div>
    <p style={{ color: colors.verde.tipografia }} className="text-lg">
      {title}
    </p>
  </div>
)

const CORREO_RESTAURANTES = 'pedidos@arcatierra.com'

// REST1 (R11, L4): POST /api/restaurantes/solicitud (público, 5/min por IP). La fila cae en la bandeja de Catering y el
// backend avisa al equipo. Topes = los del modelo Pydantic (`routers/restaurantes.py`, extra="forbid").
interface FormRestaurante {
  nombre: string
  restaurante: string
  email: string
  telefono: string
  mensaje: string
}
type CampoRestaurante = keyof FormRestaurante

const FORM_VACIO: FormRestaurante = { nombre: '', restaurante: '', email: '', telefono: '', mensaje: '' }
const MAXIMO: Record<CampoRestaurante, number> = { nombre: 120, restaurante: 160, email: 254, telefono: 30, mensaje: 2000 }
const ETIQUETA_CAMPO: Record<CampoRestaurante, string> = {
  nombre: 'tu nombre',
  restaurante: 'el nombre del restaurante',
  email: 'el correo',
  telefono: 'el teléfono',
  mensaje: 'el mensaje',
}
const TEXTO_ENVIADA = 'Recibimos tu solicitud. Te escribimos pronto.'
const TEXTO_NO_ENVIADA = `No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos a ${CORREO_RESTAURANTES}.`
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** El primer dato que falta o está mal, o null si todo sirve (el backend valida igual). */
function campoInvalido(f: FormRestaurante): { campo: CampoRestaurante; motivo: string } | null {
  if (!f.nombre.trim()) return { campo: 'nombre', motivo: 'Escribe tu nombre.' }
  if (!f.restaurante.trim()) return { campo: 'restaurante', motivo: 'Escribe el nombre del restaurante.' }
  if (!CORREO_VALIDO.test(f.email.trim())) return { campo: 'email', motivo: 'Escribe un correo válido.' }
  return null
}

/** `detail` de FastAPI en texto: un 4xx lo trae como texto; un 422 de Pydantic, como lista de `{loc, msg}`. */
function detalleLegible(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const campos = detail
      .map((d) => {
        const loc = d && typeof d === 'object' && 'loc' in d ? (d as { loc: unknown }).loc : null
        const campo = Array.isArray(loc) ? loc[loc.length - 1] : null
        return typeof campo === 'string' && campo in ETIQUETA_CAMPO ? ETIQUETA_CAMPO[campo as CampoRestaurante] : null
      })
      .filter((c): c is string => c !== null)
    const unicos = Array.from(new Set(campos))
    if (unicos.length > 0) return `Revisa ${unicos.join(', ')}.`
  }
  return 'Revisa los datos del formulario.'
}

// Componente principal
export default function ServicioRestaurantes() {
  const [formData, setFormData] = useState<FormRestaurante>(FORM_VACIO)
  const [enviando, setEnviando] = useState(false)
  const [invalido, setInvalido] = useState<CampoRestaurante | null>(null)
  const enviandoRef = useRef(false)
  const refs = {
    nombre: useRef<HTMLInputElement>(null),
    restaurante: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    telefono: useRef<HTMLInputElement>(null),
    mensaje: useRef<HTMLTextAreaElement>(null),
  }

  const cambiar = (campo: CampoRestaurante, valor: string) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }))
    if (invalido === campo) setInvalido(null)
  }

  const scrollToContactForm = () => {
    const contactSection = document.getElementById('contacto-formulario')
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // REST1 (R11): el formulario guarda la solicitud de verdad (antes, R8, abría un `mailto`). El botón se puede pulsar
  // siempre: si falta un dato, dice cuál y enfoca el campo (s46). Candado contra doble clic: un solo POST.
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviandoRef.current) return
    const falta = campoInvalido(formData)
    if (falta) {
      setInvalido(falta.campo)
      aviso.error(falta.motivo)
      refs[falta.campo].current?.focus()
      return
    }
    const telefono = formData.telefono.trim()
    const mensaje = formData.mensaje.trim()
    const body = {
      nombre: formData.nombre.trim(),
      restaurante: formData.restaurante.trim(),
      email: formData.email.trim(),
      telefono: telefono || null,
      mensaje: mensaje || null,
    }
    enviandoRef.current = true
    setEnviando(true)
    try {
      const res = await fetch(`${API_URL}/api/restaurantes/solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const datos: unknown = await res.json().catch(() => null)
      if (res.ok) {
        const message = datos && typeof datos === 'object' ? (datos as { message?: unknown }).message : null
        aviso.exito(typeof message === 'string' && message.trim() ? message : TEXTO_ENVIADA)
        setFormData(FORM_VACIO)
        setInvalido(null)
        return
      }
      const detail = datos && typeof datos === 'object' ? (datos as { detail?: unknown }).detail : null
      aviso.error(res.status >= 400 && res.status < 500 ? detalleLegible(detail) : TEXTO_NO_ENVIADA)
    } catch {
      aviso.error(TEXTO_NO_ENVIADA)
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  const estiloCampo = (campo: CampoRestaurante): React.CSSProperties => ({
    borderColor: invalido === campo ? colors.terracota.principal : colors.neutros.beigeCalido,
    backgroundColor: 'white',
    color: colors.verde.tipografia,
  })

  return (
    <div style={{ backgroundColor: colors.neutros.crema }}>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <h1 
          className="text-4xl md:text-6xl font-bold text-center mb-4"
          style={{ color: colors.terracota.principal }}
        >
          Servicio a Restaurantes
        </h1>
        <h2 
          className="text-xl md:text-2xl text-center mb-12"
          style={{ color: colors.verde.tipografia }}
        >
          Del campo regenerativo a las mejores cocinas de la ciudad
        </h2>
        
        <ImageCarousel />
        
        <div 
          className="mt-12 p-8 rounded-2xl shadow-lg"
          style={{ backgroundColor: 'white' }}
        >
          <p 
            className="text-lg md:text-xl leading-relaxed text-center"
            style={{ color: colors.verde.tipografia }}
          >
            Llevamos lo mejor del campo regenerativo a las cocinas de la ciudad. Colabora con restaurantes que valoran la temporalidad, la trazabilidad y el sabor real de los alimentos. Ofrecemos proveeduría de frutas, verduras, granos y alimentos agroecológicos, exclusivamente en la Ciudad de México.
          </p>
        </div>
      </section>

      {/* Qué ofrecemos */}
      <section 
        className="py-16"
        style={{ backgroundColor: colors.neutros.beigeCalido }}
      >
        <div className="container mx-auto px-4">
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: colors.verde.principal }}
          >
            ¿Qué ofrecemos?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <ServiceCard 
              icon={Leaf} 
              text="Ingredientes agroecológicos de temporada" 
            />
            <ServiceCard 
              icon={Package} 
              text="Harinas, granos y cereales" 
            />
            <ServiceCard 
              icon={Star} 
              text="Alimentos artesanales de producción regenerativa" 
            />
            <ServiceCard 
              icon={Truck} 
              text="Entrega directa y frescura garantizada" 
            />
            <ServiceCard 
              icon={Calendar} 
              text="Planeación semanal con base en la cosecha real" 
            />
          </div>
        </div>
      </section>

      {/* Para quién es */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div 
            className="max-w-4xl mx-auto p-12 rounded-3xl shadow-xl"
            style={{ backgroundColor: colors.verde.principal }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Si tienes un proyecto gastronómico que:
            </h3>
            <ul className="space-y-4 text-white text-lg">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                <span>Busca ingredientes con trazabilidad y prácticas regenerativas.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                <span>Cocinas de acuerdo con lo que brinda cada temporada</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                <span>Están comprometidos con productores locales y comercio justo.</span>
              </li>
            </ul>
            <div className="mt-8 text-center">
              <button 
                onClick={scrollToContactForm}
                className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: colors.terracota.principal,
                  color: 'white'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = colors.terracota.oscuro}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = colors.terracota.principal}
              >
                ¡Únete a nuestra red!
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section 
        className="py-16"
        style={{ backgroundColor: colors.neutros.beigeCalido }}
      >
        <div className="container mx-auto px-4">
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: colors.verde.principal }}
          >
            Cómo funciona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <ProcessStep 
              icon={Send} 
              title="Te enviamos las existencias diarias" 
              number={1}
            />
            <ProcessStep 
              icon={Clock} 
              title="Haces tu pedido antes de las 2 pm" 
              number={2}
            />
            <ProcessStep 
              icon={Truck} 
              title="Entregamos de lunes a sábado" 
              number={3}
            />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto-formulario" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{ color: colors.terracota.principal }}
            >
              ¿Te interesa sumarte a la red?
            </h2>
            <p 
              className="text-lg mb-8"
              style={{ color: colors.verde.tipografia }}
            >
              Escríbenos o llena este breve formulario de contacto para empezar la conversación.
            </p>
            
            <form onSubmit={enviar} noValidate data-testid="rest-formulario" className="space-y-6 text-left">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rest-nombre" className="sr-only">Tu nombre</label>
                  <input
                    id="rest-nombre"
                    ref={refs.nombre}
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    maxLength={MAXIMO.nombre}
                    data-testid="rest-nombre"
                    aria-invalid={invalido === 'nombre' ? true : undefined}
                    className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                    style={estiloCampo('nombre')}
                    value={formData.nombre}
                    onChange={(e) => cambiar('nombre', e.target.value)}
                    onFocus={(e) => (e.target as HTMLElement).style.borderColor = colors.terracota.principal}
                    onBlur={(e) => (e.target as HTMLElement).style.borderColor = invalido === 'nombre' ? colors.terracota.principal : colors.neutros.beigeCalido}
                  />
                </div>
                <div>
                  <label htmlFor="rest-restaurante" className="sr-only">Nombre del restaurante</label>
                  <input
                    id="rest-restaurante"
                    ref={refs.restaurante}
                    name="restaurante"
                    type="text"
                    autoComplete="organization"
                    placeholder="Nombre del restaurante"
                    maxLength={MAXIMO.restaurante}
                    data-testid="rest-restaurante"
                    aria-invalid={invalido === 'restaurante' ? true : undefined}
                    className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                    style={estiloCampo('restaurante')}
                    value={formData.restaurante}
                    onChange={(e) => cambiar('restaurante', e.target.value)}
                    onFocus={(e) => (e.target as HTMLElement).style.borderColor = colors.terracota.principal}
                    onBlur={(e) => (e.target as HTMLElement).style.borderColor = invalido === 'restaurante' ? colors.terracota.principal : colors.neutros.beigeCalido}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rest-email" className="sr-only">Email</label>
                  <input
                    id="rest-email"
                    ref={refs.email}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    maxLength={MAXIMO.email}
                    data-testid="rest-email"
                    aria-invalid={invalido === 'email' ? true : undefined}
                    className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                    style={estiloCampo('email')}
                    value={formData.email}
                    onChange={(e) => cambiar('email', e.target.value)}
                    onFocus={(e) => (e.target as HTMLElement).style.borderColor = colors.terracota.principal}
                    onBlur={(e) => (e.target as HTMLElement).style.borderColor = invalido === 'email' ? colors.terracota.principal : colors.neutros.beigeCalido}
                  />
                </div>
                <div>
                  <label htmlFor="rest-telefono" className="sr-only">Teléfono</label>
                  <input
                    id="rest-telefono"
                    ref={refs.telefono}
                    name="telefono"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Teléfono"
                    maxLength={MAXIMO.telefono}
                    data-testid="rest-telefono"
                    aria-invalid={invalido === 'telefono' ? true : undefined}
                    className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                    style={estiloCampo('telefono')}
                    value={formData.telefono}
                    onChange={(e) => cambiar('telefono', e.target.value)}
                    onFocus={(e) => (e.target as HTMLElement).style.borderColor = colors.terracota.principal}
                    onBlur={(e) => (e.target as HTMLElement).style.borderColor = invalido === 'telefono' ? colors.terracota.principal : colors.neutros.beigeCalido}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="rest-mensaje" className="sr-only">Cuéntanos sobre tu restaurante y qué buscas</label>
                <textarea
                  id="rest-mensaje"
                  ref={refs.mensaje}
                  name="mensaje"
                  placeholder="Cuéntanos sobre tu restaurante y qué buscas"
                  rows={4}
                  maxLength={MAXIMO.mensaje}
                  data-testid="rest-mensaje"
                  className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                  style={estiloCampo('mensaje')}
                  value={formData.mensaje}
                  onChange={(e) => cambiar('mensaje', e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = colors.terracota.principal}
                  onBlur={(e) => e.target.style.borderColor = colors.neutros.beigeCalido}
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                aria-busy={enviando}
                data-testid="rest-enviar"
                className="inline-flex items-center justify-center gap-2 w-full md:w-auto text-center px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100"
                style={{ 
                  backgroundColor: colors.terracota.principal,
                  color: 'white'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = colors.terracota.oscuro}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = colors.terracota.principal}
              >
                <Send className="w-5 h-5" aria-hidden="true" />
                {enviando ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Logos de Restaurantes Colaboradores */}
      <section 
        className="py-16"
        style={{ backgroundColor: colors.neutros.beigeCalido }}
      >
        <div className="container mx-auto px-4">
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-8"
            style={{ color: colors.verde.principal }}
          >
            Restaurantes colaboradores
          </h2>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8 items-center justify-items-center">
            <a 
              href="https://www.contramar.com.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Contramar"
            >
              <OptimizedImage src="/logos/restauranntes/contramar_logo.png" alt="Logo Contramar" width={128} height={128} className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.rosetta.com.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Rosetta"
            >
              <OptimizedImage src="/logos/restauranntes/rosetta_logo.png" alt="Logo Rosetta" width={128} height={128} className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.azulrestaurantes.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Azul Histórico"
            >
              <OptimizedImage src="/logos/restauranntes/azul_historico_logo.png" alt="Logo Azul Histórico" width={128} height={128} className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.baldio.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Baldío"
            >
              <OptimizedImage src="/logos/restauranntes/baldio_logo.png" alt="Logo Baldío" width={128} height={128} className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.grupomaximo.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Grupo Máximo"
            >
              <OptimizedImage src="/logos/restauranntes/grupo_maximo_logo.png" alt="Logo Grupo Máximo" width={128} height={128} className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.tetetlan.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Tetitlán"
            >
              <OptimizedImage src="/logos/restauranntes/tetetlan_logo.jpg" alt="Logo Tetitlán" width={128} height={128} className="max-w-full max-h-full object-contain" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}