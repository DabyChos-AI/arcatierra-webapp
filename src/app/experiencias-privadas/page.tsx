'use client';

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Mail, 
  Phone,
  ChefHat,
  Utensils,
  Heart,
  Gift,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'

const experienciasPrivadas = [
  {
    id: 1,
    titulo: "Cena Romántica en Chinampa",
    descripcion: "Una experiencia íntima para dos personas con cena gourmet bajo las estrellas",
    imagen: "/images/experiencias/cena-romantica.jpg",
    duracion: "3 horas",
    capacidad: "2-4 personas",
    precio: "Desde $3,500",
    incluye: ["Cena de 5 tiempos", "Vinos maridados", "Decoración especial", "Música en vivo"],
    categoria: "Romántica",
    icon: "💕"
  },
  {
    id: 2,
    titulo: "Celebración de Cumpleaños",
    descripcion: "Festeja tu día especial con una experiencia personalizada en las chinampas",
    imagen: "/images/experiencias/cumpleanos.jpg",
    duracion: "4 horas",
    capacidad: "8-20 personas",
    precio: "Desde $2,800",
    incluye: ["Menú personalizado", "Decoración temática", "Pastel artesanal", "Actividades especiales"],
    categoria: "Celebración",
    icon: "🎂"
  },
  {
    id: 3,
    titulo: "Evento Corporativo",
    descripcion: "Team building y eventos empresariales en un entorno natural único",
    imagen: "/images/experiencias/corporativo.jpg",
    duracion: "5 horas",
    capacidad: "15-50 personas",
    precio: "Desde $2,200",
    incluye: ["Menú ejecutivo", "Actividades de integración", "Espacio privado", "Servicio completo"],
    categoria: "Corporativo",
    icon: "🏢"
  },
  {
    id: 4,
    titulo: "Aniversario Especial",
    descripcion: "Celebra momentos importantes con una experiencia gastronómica memorable",
    imagen: "/images/experiencias/aniversario.jpg",
    duracion: "3.5 horas",
    capacidad: "2-12 personas",
    precio: "Desde $3,200",
    incluye: ["Menú degustación", "Fotografía profesional", "Recuerdos personalizados", "Servicio premium"],
    categoria: "Aniversario",
    icon: "💍"
  },
  {
    id: 5,
    titulo: "Reunión Familiar",
    descripcion: "Reúne a toda la familia en un ambiente natural y acogedor",
    imagen: "/images/experiencias/familiar.jpg",
    duracion: "4 horas",
    capacidad: "10-30 personas",
    precio: "Desde $1,800",
    incluye: ["Menú familiar", "Actividades para niños", "Espacio amplio", "Servicio personalizado"],
    categoria: "Familiar",
    icon: "👨‍👩‍👧‍👦"
  },
  {
    id: 6,
    titulo: "Propuesta de Matrimonio",
    descripcion: "El momento perfecto para la pregunta más importante de tu vida",
    imagen: "/images/experiencias/propuesta.jpg",
    duracion: "2.5 horas",
    capacidad: "2 personas",
    precio: "Desde $4,500",
    incluye: ["Cena íntima", "Decoración romántica", "Fotografía del momento", "Champagne premium"],
    categoria: "Romántica",
    icon: "💎"
  }
]

export default function ExperienciasPrivadasPage() {
  const [experienciaSeleccionada, setExperienciaSeleccionada] = useState<any>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#E8E4DF]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B15543] via-[#A0493A] to-[#8B3E31] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#F5F3F0]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-white"
          >
            Experiencias Privadas
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-[#F5F3F0] mb-8 max-w-3xl mx-auto"
          >
            Momentos únicos diseñados especialmente para ti y tus seres queridos
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
              <div className="flex items-center gap-2 text-[#F5F3F0]">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Eventos Personalizados</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
              <div className="flex items-center gap-2 text-[#F5F3F0]">
                <ChefHat className="w-5 h-5" />
                <span className="font-semibold">Menús Exclusivos</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Experiencias Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experienciasPrivadas.map((experiencia, index) => (
            <motion.div
              key={experiencia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-[#CCBB9A]/30 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Imagen */}
              <div className="relative h-48 bg-gradient-to-br from-[#B15543]/20 to-[#D4735E]/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">{experiencia.icon}</div>
                </div>
                
                {/* Badge de categoría */}
                <div className="absolute top-4 left-4 bg-[#B15543] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {experiencia.categoria}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#3A4741] mb-2">
                  {experiencia.titulo}
                </h3>
                
                <p className="text-[#475A52] mb-4 text-sm leading-relaxed">
                  {experiencia.descripcion}
                </p>

                {/* Detalles */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[#475A52]">
                    <Clock className="w-4 h-4 text-[#B15543]" />
                    <span>{experiencia.duracion}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-[#475A52]">
                    <Users className="w-4 h-4 text-[#B15543]" />
                    <span>{experiencia.capacidad}</span>
                  </div>
                </div>

                {/* Precio */}
                <div className="text-2xl font-bold text-[#B15543] mb-4">
                  {experiencia.precio}
                </div>

                {/* Incluye */}
                <div className="mb-6">
                  <h4 className="font-semibold text-[#3A4741] mb-2 text-sm">Incluye:</h4>
                  <ul className="space-y-1">
                    {experiencia.incluye.slice(0, 2).map((item, i) => (
                      <li key={i} className="text-xs text-[#475A52] flex items-center gap-1">
                        <div className="w-1 h-1 bg-[#B15543] rounded-full"></div>
                        {item}
                      </li>
                    ))}
                    {experiencia.incluye.length > 2 && (
                      <li className="text-xs text-[#B15543] font-medium">
                        +{experiencia.incluye.length - 2} más...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setExperienciaSeleccionada(experiencia)}
                    className="flex-1 bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Solicitar Cotización
                  </button>
                  
                  <button className="px-4 py-2 border border-[#B15543] text-[#B15543] rounded-lg text-sm font-semibold hover:bg-[#B15543] hover:text-white transition-all duration-300">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sección de contacto */}
      <div className="bg-[#3A4741] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#E8E4DF]">
              ¿Tienes algo especial en mente?
            </h2>
            <p className="text-xl text-[#CCBB9A] mb-8">
              Creamos experiencias completamente personalizadas para hacer realidad tu visión
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Mail className="w-8 h-8 text-[#CCBB9A] mx-auto mb-4" />
              <h3 className="font-semibold text-[#E8E4DF] mb-2">Email</h3>
              <p className="text-[#CCBB9A]">eventos@arcatierra.com</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Phone className="w-8 h-8 text-[#CCBB9A] mx-auto mb-4" />
              <h3 className="font-semibold text-[#E8E4DF] mb-2">Teléfono</h3>
              <p className="text-[#CCBB9A]">+52 55 1234 5678</p>
            </div>
          </div>

          <button className="bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
            Contactar Ahora
          </button>
        </div>
      </div>

      {/* Modal de cotización */}
      {experienciaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-[#3A4741]">Solicitar Cotización</h3>
                <button
                  onClick={() => setExperienciaSeleccionada(null)}
                  className="text-[#475A52] hover:text-[#3A4741] text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-[#3A4741] text-lg mb-2">
                  {experienciaSeleccionada.titulo}
                </h4>
                <p className="text-[#475A52] mb-4">
                  {experienciaSeleccionada.descripcion}
                </p>
                
                <div className="bg-[#F5F3F0] rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-[#3A4741] mb-2">Incluye:</h5>
                  <ul className="space-y-1">
                    {experienciaSeleccionada.incluye.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-[#475A52] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#B15543] rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#3A4741] mb-2">Nombre completo</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-[#CCBB9A] rounded-xl focus:ring-2 focus:ring-[#B15543] focus:border-[#B15543] transition-colors"
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3A4741] mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-[#CCBB9A] rounded-xl focus:ring-2 focus:ring-[#B15543] focus:border-[#B15543] transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3A4741] mb-2">Teléfono</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-[#CCBB9A] rounded-xl focus:ring-2 focus:ring-[#B15543] focus:border-[#B15543] transition-colors"
                    placeholder="+52 55 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3A4741] mb-2">Fecha preferida</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-[#CCBB9A] rounded-xl focus:ring-2 focus:ring-[#B15543] focus:border-[#B15543] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3A4741] mb-2">Número de personas</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-[#CCBB9A] rounded-xl focus:ring-2 focus:ring-[#B15543] focus:border-[#B15543] transition-colors"
                    placeholder="Ej: 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3A4741] mb-2">Detalles adicionales</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-[#CCBB9A] rounded-xl focus:ring-2 focus:ring-[#B15543] focus:border-[#B15543] transition-colors resize-none"
                    placeholder="Cuéntanos más sobre tu evento especial, preferencias alimentarias, decoración específica, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setExperienciaSeleccionada(null)}
                  className="flex-1 px-6 py-3 border-2 border-[#CCBB9A] text-[#475A52] rounded-xl font-semibold hover:bg-[#F5F3F0] transition-all duration-300"
                >
                  Cancelar
                </button>
                <button className="flex-1 bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Enviar Solicitud
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

