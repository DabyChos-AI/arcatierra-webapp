'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Truck, Clock, Calendar, CheckCircle, Leaf, Package, Star, Send } from 'lucide-react'

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
    { url: '/images/reparto-1.jpg', alt: 'Primera estrella verde en CDMX' },
    { url: '/images/reparto-2.jpg', alt: 'Entrega de productos agroecológicos' },
    { url: '/images/reparto-3.jpg', alt: 'Servicio de entrega a restaurantes' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl shadow-xl">
      {/* Placeholder para las imágenes */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#B15543] to-[#975543] flex items-center justify-center">
        <div className="text-white text-center p-8">
          <Truck className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Servicio de entrega directa del campo a tu cocina</p>
        </div>
      </div>
      
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

// Componente principal
export default function ServicioRestaurantes() {
  const [formData, setFormData] = useState({
    nombre: '',
    restaurante: '',
    email: '',
    telefono: '',
    mensaje: ''
  })

  const scrollToContactForm = () => {
    const contactSection = document.getElementById('contacto-formulario')
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const handleSubmit = () => {
    console.log('Formulario enviado:', formData)
    // Aquí iría la lógica de envío del formulario
    alert('¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.')
  }

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
            Llevamos lo mejor del campo regenerativo a las cocinas de la ciudad. Arca Tierra colabora con restaurantes que valoran la temporalidad, la trazabilidad y el sabor real de los alimentos. Ofrecemos proveeduría de frutas, verduras, granos y alimentos agroecológicos, exclusivamente en la Ciudad de México.
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
              text="Granos, cereales y tortillas nixtamalizadas" 
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

      {/* Experiencia BALDÍO */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={{ color: colors.verde.principal }}
            >
              Experiencia BALDÍO
            </h2>
            
            <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/images/baldio/experienciabaldio.png" 
                alt="Experiencia BALDÍO - Taquiza de cerdo con mole"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '600px' }}
              />
            </div>
            
            <div 
              className="mt-8 p-8 rounded-2xl shadow-lg max-w-4xl mx-auto"
              style={{ backgroundColor: 'white' }}
            >
              <p 
                className="text-lg md:text-xl leading-relaxed text-center"
                style={{ color: colors.verde.tipografia }}
              >
                Una experiencia gastronómica única que celebra los sabores tradicionales mexicanos con ingredientes agroecológicos de temporada. BALDÍO representa la perfecta armonía entre la cocina ancestral y la agricultura regenerativa.
              </p>
            </div>
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
            
            <div className="space-y-6 text-left">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                  style={{ 
                    borderColor: colors.neutros.beigeCalido,
                    backgroundColor: 'white',
                    color: colors.verde.tipografia
                  }}
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  onFocus={(e) => (e.target as HTMLElement).style.borderColor = colors.terracota.principal}
                  onBlur={(e) => (e.target as HTMLElement).style.borderColor = colors.neutros.beigeCalido}
                />
                <input
                  type="text"
                  placeholder="Nombre del restaurante"
                  className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                  style={{ 
                    borderColor: colors.neutros.beigeCalido,
                    backgroundColor: 'white',
                    color: colors.verde.tipografia
                  }}
                  value={formData.restaurante}
                  onChange={(e) => setFormData({...formData, restaurante: e.target.value})}
                  onFocus={(e) => (e.target as HTMLElement).style.borderColor = colors.terracota.principal}
                  onBlur={(e) => (e.target as HTMLElement).style.borderColor = colors.neutros.beigeCalido}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                  style={{ 
                    borderColor: colors.neutros.beigeCalido,
                    backgroundColor: 'white',
                    color: colors.verde.tipografia
                  }}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  onFocus={(e) => (e.target as HTMLElement).style.borderColor = colors.terracota.principal}
                  onBlur={(e) => (e.target as HTMLElement).style.borderColor = colors.neutros.beigeCalido}
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                  style={{ 
                    borderColor: colors.neutros.beigeCalido,
                    backgroundColor: 'white',
                    color: colors.verde.tipografia
                  }}
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  onFocus={(e) => (e.target as HTMLElement).style.borderColor = colors.terracota.principal}
                  onBlur={(e) => (e.target as HTMLElement).style.borderColor = colors.neutros.beigeCalido}
                />
              </div>
              <textarea
                placeholder="Cuéntanos sobre tu restaurante y qué buscas"
                rows={4}
                className="w-full px-6 py-4 rounded-lg border-2 focus:outline-none transition-all duration-300"
                style={{ 
                  borderColor: colors.neutros.beigeCalido,
                  backgroundColor: 'white',
                  color: colors.verde.tipografia
                }}
                value={formData.mensaje}
                onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                onFocus={(e) => e.target.style.borderColor = colors.terracota.principal}
                onBlur={(e) => e.target.style.borderColor = colors.neutros.beigeCalido}
              />
              <button 
                onClick={handleSubmit}
                className="w-full md:w-auto px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: colors.terracota.principal,
                  color: 'white'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = colors.terracota.oscuro}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = colors.terracota.principal}
              >
                Enviar mensaje
              </button>
            </div>
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
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Contramar"
            >
              <img src="/logos/restauranntes/contramar_logo.png" alt="Logo Contramar" className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.rosetta.com.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Rosetta"
            >
              <img src="/logos/restauranntes/rosetta_logo.png" alt="Logo Rosetta" className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.azulrestaurantes.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Azul Histórico"
            >
              <img src="/logos/restauranntes/azul_historico_logo.png" alt="Logo Azul Histórico" className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.baldio.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Baldío"
            >
              <img src="/logos/restauranntes/baldio_logo.png" alt="Logo Baldío" className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.grupomaximo.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Grupo Máximo"
            >
              <img src="/logos/restauranntes/grupo_maximo_logo.png" alt="Logo Grupo Máximo" className="max-w-full max-h-full object-contain" />
            </a>
            <a 
              href="https://www.tetetlan.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-40 h-40 flex items-center justify-center"
              aria-label="Visitar sitio web de Tetitlán"
            >
              <img src="/logos/restauranntes/tetetlan_logo.jpg" alt="Logo Tetitlán" className="max-w-full max-h-full object-contain" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}