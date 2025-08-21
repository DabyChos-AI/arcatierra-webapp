'use client';

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Eye,
  Sparkles,
  Grid3X3,
  List
} from 'lucide-react'
import { experienciasCalendarioCompleto as experienciasCalendario } from '@/data/calendario-completo'

// Días de la semana
const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Categorías de experiencias con colores del manual de identidad
const categorias = [
  {
    id: 'amanecer-chinampero',
    nombre: 'Amanecer Chinampero',
    emoji: '🌅',
    badge: 'Más Popular',
    badgeColor: 'from-[#B15543] to-[#D4735E]', // Terracota oficial
    color: 'bg-gradient-to-r from-[#B15543] to-[#D4735E]'
  },
  {
    id: 'amanecer-tcm',
    nombre: 'Amanecer TCM',
    emoji: '🌅',
    badge: 'Especial',
    badgeColor: 'from-[#3A4741] to-[#475A52]', // Verde bosque oficial
    color: 'bg-gradient-to-r from-[#3A4741] to-[#475A52]'
  },
  {
    id: 'brunch-chinampero',
    nombre: 'Brunch Chinampero',
    emoji: '🥞',
    badge: 'Nuevo',
    badgeColor: 'from-[#6B8E23] to-[#8FBC8F]', // Verde natural
    color: 'bg-gradient-to-r from-[#6B8E23] to-[#8FBC8F]'
  },
  {
    id: 'comida-chinampera',
    nombre: 'Comida Chinampera',
    emoji: '🍽️',
    badge: 'Premium',
    badgeColor: 'from-[#CD853F] to-[#DEB887]', // Dorado tierra
    color: 'bg-gradient-to-r from-[#CD853F] to-[#DEB887]'
  },
  {
    id: 'taller-plantas',
    nombre: 'Taller de Plantas',
    emoji: '🌿',
    badge: 'Educativo',
    badgeColor: 'from-[#228B22] to-[#32CD32]', // Verde educativo
    color: 'bg-gradient-to-r from-[#228B22] to-[#32CD32]'
  },
  {
    id: 'cena-chinampas',
    nombre: 'Cena por las Chinampas',
    emoji: '🌙',
    badge: 'Exclusiva',
    badgeColor: 'from-[#4B0082] to-[#8A2BE2]', // Púrpura exclusivo
    color: 'bg-gradient-to-r from-[#4B0082] to-[#8A2BE2]'
  },
  {
    id: 'dia-muertos',
    nombre: 'Día de Muertos',
    emoji: '💀',
    badge: 'Único',
    badgeColor: 'from-[#FF4500] to-[#FF6347]', // Naranja festivo
    color: 'bg-gradient-to-r from-[#FF4500] to-[#FF6347]'
  },
  {
    id: 'chinampa-familia',
    nombre: 'Chinampa en Familia',
    emoji: '👨‍👩‍👧‍👦',
    badge: 'Familiar',
    badgeColor: 'from-[#1E90FF] to-[#87CEEB]', // Azul familiar
    color: 'bg-gradient-to-r from-[#1E90FF] to-[#87CEEB]'
  }
]

export default function CalendarioPage() {
  const [fechaActual, setFechaActual] = useState(new Date()) // Mes actual
  const [vista, setVista] = useState<'calendario' | 'lista'>('lista')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('')
  const [carrito, setCarrito] = useState<any[]>([])
  const [modalReserva, setModalReserva] = useState<any>(null)
  const [personasViendo, setPersonasViendo] = useState(13)

  // Evitar error de hidratación usando useEffect
  useEffect(() => {
    setPersonasViendo(Math.floor(Math.random() * 15) + 8)
  }, [])

  // Calcular experiencias del mes actual
  const experienciasDelMes = useMemo(() => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    
    return experienciasCalendario.filter(exp => {
      const fechaExp = new Date(exp.fecha)
      return fechaExp.getFullYear() === año && fechaExp.getMonth() === mes
    })
  }, [fechaActual])

  // Obtener experiencias filtradas
  const experienciasFiltradas = useMemo(() => {
    if (!filtroCategoria) return experienciasDelMes
    
    return experienciasDelMes.filter(exp => {
      const nombre = exp.experiencia?.toLowerCase() || ''
      switch (filtroCategoria) {
        case 'amanecer-chinampero':
          return nombre.includes('amanecer chinampero') && !nombre.includes('tcm')
        case 'amanecer-tcm':
          return nombre.includes('amanecer') && nombre.includes('tcm')
        case 'brunch-chinampero':
          return nombre.includes('brunch')
        case 'comida-chinampera':
          return nombre.includes('comida chinampera')
        case 'taller-plantas':
          return nombre.includes('taller')
        case 'cena-chinampas':
          return nombre.includes('cena')
        case 'dia-muertos':
          return nombre.includes('muertos')
        case 'chinampa-familia':
          return nombre.includes('familia')
        default:
          return false
      }
    })
  }, [experienciasDelMes, filtroCategoria])

  // Obtener experiencias de una fecha específica
  const getExperienciasDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0]
    return experienciasCalendario.filter(exp => exp.fecha === fechaStr)
  }

  // Generar días del calendario
  const generarDiasCalendario = () => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    const diaSemanaInicio = primerDia.getDay()

    const dias = []

    // Días del mes anterior
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const dia = new Date(año, mes, -i)
      dias.push({ fecha: dia, esDelMes: false })
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(año, mes, dia)
      dias.push({ fecha, esDelMes: true })
    }

    // Días del mes siguiente para completar la grilla
    const diasRestantes = 42 - dias.length
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(año, mes + 1, dia)
      dias.push({ fecha, esDelMes: false })
    }

    return dias
  }

  const dias = generarDiasCalendario()

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    setFechaActual(prev => {
      const nuevaFecha = new Date(prev)
      if (direccion === 'anterior') {
        nuevaFecha.setMonth(prev.getMonth() - 1)
      } else {
        nuevaFecha.setMonth(prev.getMonth() + 1)
      }
      return nuevaFecha
    })
  }

  const agregarAlCarrito = (experiencia: any) => {
    setCarrito(prev => [...prev, { ...experiencia, id: Date.now() }])
  }

  const abrirModalReserva = (experiencia: any) => {
    setModalReserva(experiencia)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-[#E8E4DF]">
      {/* Header con gradiente del manual de identidad */}
      <div className="bg-gradient-to-r from-[#B15543] via-[#A0493A] to-[#8B3E31] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 text-white"
          >
            Calendario de Experiencias
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#F5F3F0] mb-8"
          >
            Encuentra y reserva tu experiencia perfecta en las chinampas
          </motion.p>
          
          <div className="flex justify-center gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30"
            >
              <div className="flex items-center gap-2 text-[#F5F3F0]">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">{experienciasDelMes.length} experiencias disponibles</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30"
            >
              <div className="flex items-center gap-2 text-[#F5F3F0]">
                <Eye className="w-5 h-5" />
                <span className="font-semibold">{personasViendo} personas viendo ahora</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Categorías */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-[#CCBB9A]/30 p-4 mb-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-[#B15543]" />
                <h2 className="text-2xl font-bold text-[#3A4741]">Nuestras Experiencias</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categorias.map((categoria, index) => {
                  const experienciasCategoria = experienciasCalendario.filter(exp => {
                    const nombre = exp.experiencia?.toLowerCase() || ''
                    switch (categoria.id) {
                      case 'amanecer-chinampero':
                        return nombre.includes('amanecer chinampero') && !nombre.includes('tcm')
                      case 'amanecer-tcm':
                        return nombre.includes('amanecer') && nombre.includes('tcm')
                      case 'brunch-chinampero':
                        return nombre.includes('brunch')
                      case 'comida-chinampera':
                        return nombre.includes('comida chinampera')
                      case 'taller-plantas':
                        return nombre.includes('taller')
                      case 'cena-chinampas':
                        return nombre.includes('cena')
                      case 'dia-muertos':
                        return nombre.includes('muertos')
                      case 'chinampa-familia':
                        return nombre.includes('familia')
                      default:
                        return false
                    }
                  })

                  // Encontrar la próxima fecha
                  const proximaExperiencia = experienciasCategoria
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                    .find(exp => new Date(exp.fecha) >= new Date())
                  
                  const proximaFecha = proximaExperiencia ? new Date(proximaExperiencia.fecha) : null
                  const proximaFechaTexto = proximaFecha ? 
                    proximaFecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 
                    'Sin fechas'

                  const handleClickExperiencia = () => {
                    if (proximaFecha) {
                      // Navegar al mes de la próxima fecha
                      setFechaActual(new Date(proximaFecha.getFullYear(), proximaFecha.getMonth(), 1))
                      // Opcional: filtrar por esta categoría
                      setFiltroCategoria(filtroCategoria === categoria.id ? '' : categoria.id)
                    }
                  }

                  return (
                    <motion.div
                      key={categoria.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                        filtroCategoria === categoria.id 
                          ? 'border-[#B15543] bg-gradient-to-r from-[#B15543]/10 to-[#D4735E]/10' 
                          : 'border-[#CCBB9A]/30 bg-gradient-to-r from-[#F5F3F0] to-white hover:border-[#B15543]/50'
                      }`}
                      onClick={handleClickExperiencia}
                    >
                      {/* Badge */}
                      <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${categoria.badgeColor}`}>
                        {categoria.badge}
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="text-lg flex-shrink-0">{categoria.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#3A4741] text-sm leading-tight">{categoria.nombre}</h3>
                          <p className="text-xs text-[#475A52] mb-1">{experienciasCategoria.length} fechas disponibles</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#B15543]" />
                            <span className="text-xs font-medium text-[#B15543]">
                              Próxima: {proximaFechaTexto}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

          </div>

           {/* Calendario principal */}
          <div className="lg:col-span-2">
            {/* Controles del calendario */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#CCBB9A]/30 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navegarMes('anterior')}
                    className="p-2 rounded-xl bg-[#F5F3F0] hover:bg-[#E8E4DF] text-[#3A4741] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <h2 className="text-2xl font-bold text-[#3A4741]">
                    {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h2>
                  
                  <button
                    onClick={() => navegarMes('siguiente')}
                    className="p-2 rounded-xl bg-[#F5F3F0] hover:bg-[#E8E4DF] text-[#3A4741] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setVista('calendario')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      vista === 'calendario'
                        ? 'bg-[#B15543] text-white'
                        : 'bg-[#F5F3F0] text-[#3A4741] hover:bg-[#E8E4DF]'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4 inline mr-2" />
                    Vista Calendario
                  </button>
                  <button
                    onClick={() => setVista('lista')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      vista === 'lista'
                        ? 'bg-[#B15543] text-white'
                        : 'bg-[#F5F3F0] text-[#3A4741] hover:bg-[#E8E4DF]'
                    }`}
                  >
                    <List className="w-4 h-4 inline mr-2" />
                    Vista Lista
                  </button>
                </div>
              </div>

              {vista === 'calendario' ? (
                <div>
                  {/* Encabezados de días */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {diasSemana.map(dia => (
                      <div key={dia} className="text-center font-semibold text-[#475A52] py-2">
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Grilla del calendario */}
                  <div className="grid grid-cols-7 gap-2">
                    {dias.map((dia, index) => {
                      const experienciasDia = getExperienciasDia(dia.fecha)
                      const tieneExperiencias = experienciasDia.length > 0
                      const esSeleccionada = fechaSeleccionada?.toDateString() === dia.fecha.toDateString()

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.01 }}
                          className={`relative aspect-square p-2 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            !dia.esDelMes
                              ? 'text-[#CCBB9A] border-transparent'
                              : esSeleccionada
                              ? 'border-[#B15543] bg-gradient-to-br from-[#B15543]/20 to-[#D4735E]/20'
                              : tieneExperiencias
                              ? 'border-[#6B8E23]/30 bg-gradient-to-br from-[#F5F3F0] to-white hover:border-[#B15543]/50'
                              : 'border-[#CCBB9A]/20 bg-[#F5F3F0] hover:border-[#CCBB9A]/50'
                          }`}
                          onClick={() => {
                            if (dia.esDelMes) {
                              setFechaSeleccionada(dia.fecha)
                            }
                          }}
                        >
                          <div className={`text-sm font-medium ${
                            !dia.esDelMes ? 'text-[#CCBB9A]' : 'text-[#3A4741]'
                          }`}>
                            {dia.fecha.getDate()}
                          </div>

                          {/* Indicadores de experiencias */}
                          {tieneExperiencias && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                              {experienciasDia.slice(0, 3).map((exp, i) => {
                                const categoria = categorias.find(cat => {
                                  const nombre = exp.experiencia?.toLowerCase() || ''
                                  switch (cat.id) {
                                    case 'amanecer-chinampero':
                                      return nombre.includes('amanecer chinampero') && !nombre.includes('tcm')
                                    case 'amanecer-tcm':
                                      return nombre.includes('amanecer') && nombre.includes('tcm')
                                    case 'brunch-chinampero':
                                      return nombre.includes('brunch')
                                    case 'comida-chinampera':
                                      return nombre.includes('comida chinampera')
                                    case 'taller-plantas':
                                      return nombre.includes('taller')
                                    case 'cena-chinampas':
                                      return nombre.includes('cena')
                                    case 'dia-muertos':
                                      return nombre.includes('muertos')
                                    case 'chinampa-familia':
                                      return nombre.includes('familia')
                                    default:
                                      return false
                                  }
                                })
                                
                                return (
                                  <div
                                    key={i}
                                    className="text-xs"
                                    title={exp.experiencia}
                                  >
                                    {categoria?.emoji || '📅'}
                                  </div>
                                )
                              })}
                              {experienciasDia.length > 3 && (
                                <div className="text-xs text-[#B15543] font-bold">
                                  +{experienciasDia.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-[#475A52] mb-4">
                    {experienciasFiltradas.length} experiencias {filtroCategoria ? 'filtradas' : 'disponibles'}
                  </div>
                  
                  {experienciasFiltradas.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        fechaSeleccionada?.toDateString() === new Date(exp.fecha).toDateString()
                          ? 'border-[#B15543] bg-gradient-to-r from-[#B15543]/10 to-[#D4735E]/10'
                          : 'border-[#CCBB9A]/30 bg-gradient-to-r from-[#F5F3F0] to-white hover:border-[#B15543]/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-[#3A4741] text-lg">{exp.experiencia}</h4>
                          <p className="text-[#475A52] text-sm">
                            {new Date(exp.fecha).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#B15543]">${exp.precio}</div>
                          <div className="text-sm text-[#475A52]">{exp.disponibles} disponibles</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[#475A52] mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{exp.hora}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Duración: 3 horas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>Calificación: 4.9/5</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => abrirModalReserva(exp)}
                          className="flex-1 bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          <ShoppingCart className="w-4 h-4 inline mr-2" />
                          Agregar al Carrito
                        </button>
                        <button
                          onClick={() => {
                            if (exp.experiencia) {
                              window.location.href = `/experiencias/${exp.experiencia.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, (match) => ({ 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }[match] || match))}`;
                            }
                          }}
                          className="px-6 py-3 border-2 border-[#B15543] text-[#B15543] rounded-xl font-semibold hover:bg-[#B15543] hover:text-white transition-all duration-300"
                        >
                          Más Información
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel de fecha seleccionada */}
            {fechaSeleccionada && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-[#CCBB9A]/30 p-6"
              >
                <h3 className="text-xl font-bold text-[#3A4741] mb-4">
                  Experiencias del {fechaSeleccionada.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {getExperienciasDia(fechaSeleccionada).length === 0 ? (
                  <div className="text-center py-8 text-[#475A52]">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-[#CCBB9A]" />
                    <p>No hay experiencias programadas para esta fecha</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getExperienciasDia(fechaSeleccionada).map((exp, index) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-[#F5F3F0] to-white rounded-xl p-4 border border-[#CCBB9A]/30"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-[#3A4741]">{exp.experiencia}</h4>
                          <span className="text-lg font-bold text-[#B15543]">${exp.precio}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#475A52] mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{exp.hora}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{exp.disponibles} disponibles</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModalReserva(exp)}
                            className="flex-1 bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300"
                          >
                            Agregar al Carrito
                          </button>
                          <button
                            onClick={() => {
                              if (exp.experiencia) {
                                window.location.href = `/experiencias/${exp.experiencia.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, (match) => ({ 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }[match] || match))}`;
                              }
                            }}
                            className="px-4 py-2 border border-[#B15543] text-[#B15543] rounded-lg text-sm font-medium hover:bg-[#B15543] hover:text-white transition-all duration-300"
                          >
                            Más Info
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de reserva */}
      <AnimatePresence>
        {modalReserva && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalReserva(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-[#3A4741]">Reservar Experiencia</h3>
                  <button
                    onClick={() => setModalReserva(null)}
                    className="p-2 hover:bg-[#F5F3F0] rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-[#475A52]" />
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-[#3A4741] text-lg mb-2">{modalReserva.experiencia}</h4>
                  <p className="text-[#475A52] mb-4">
                    {new Date(modalReserva.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} a las {modalReserva.hora}
                  </p>
                  <div className="text-2xl font-bold text-[#B15543] mb-4">${modalReserva.precio}</div>
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
                    <label className="block text-sm font-medium text-[#3A4741] mb-2">Comentarios especiales</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 border border-[#CCBB9A] rounded-xl focus:ring-2 focus:ring-[#B15543] focus:border-[#B15543] transition-colors resize-none"
                      placeholder="¿Tienes alguna solicitud especial? Por ejemplo: alergias alimentarias, necesidades de accesibilidad, celebración especial, etc."
                    />
                    <p className="text-sm text-[#475A52] mt-1">💡 Comparte cualquier información que nos ayude a personalizar tu experiencia</p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#3A4741] mb-2">Adultos</label>
                      <div className="flex items-center gap-3">
                        <button className="p-2 border border-[#CCBB9A] rounded-lg hover:bg-[#F5F3F0] transition-colors">
                          <Minus className="w-4 h-4 text-[#475A52]" />
                        </button>
                        <span className="font-semibold text-[#3A4741] min-w-[2rem] text-center">1</span>
                        <button className="p-2 border border-[#CCBB9A] rounded-lg hover:bg-[#F5F3F0] transition-colors">
                          <Plus className="w-4 h-4 text-[#475A52]" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#3A4741] mb-2">Niños</label>
                      <div className="flex items-center gap-3">
                        <button className="p-2 border border-[#CCBB9A] rounded-lg hover:bg-[#F5F3F0] transition-colors">
                          <Minus className="w-4 h-4 text-[#475A52]" />
                        </button>
                        <span className="font-semibold text-[#3A4741] min-w-[2rem] text-center">0</span>
                        <button className="p-2 border border-[#CCBB9A] rounded-lg hover:bg-[#F5F3F0] transition-colors">
                          <Plus className="w-4 h-4 text-[#475A52]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalReserva(null)}
                    className="flex-1 px-6 py-3 border-2 border-[#CCBB9A] text-[#475A52] rounded-xl font-semibold hover:bg-[#F5F3F0] transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      // Simulación de envío al checkout
                      alert('Simulación: Datos enviados al checkout');
                      console.log('Datos de reserva enviados al checkout:', {
                        experiencia: modalReserva.experiencia,
                        fecha: modalReserva.fecha,
                        hora: modalReserva.hora,
                        precio: modalReserva.precio,
                        // Aquí se incluirían los valores de los campos del formulario
                        // en una implementación real
                      });
                      // Cerrar modal después de simular envío
                      setModalReserva(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Completar Reserva
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carrito - Movido abajo del calendario */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg border border-[#CCBB9A]/30 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-[#B15543]" />
            <h3 className="font-bold text-[#3A4741]">Tu Carrito</h3>
            {carrito.length > 0 && (
              <span className="bg-[#B15543] text-white text-xs px-2 py-1 rounded-full">
                {carrito.length}
              </span>
            )}
          </div>
          
          {carrito.length === 0 ? (
            <div className="text-center py-8 text-[#475A52]">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-[#CCBB9A]" />
              <p className="font-medium">Carrito vacío</p>
              <p className="text-sm">Agrega experiencias para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {carrito.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#F5F3F0] rounded-lg">
                  <div>
                    <p className="font-medium text-[#3A4741] text-sm">{item.experiencia}</p>
                    <p className="text-xs text-[#475A52]">{item.fecha}</p>
                  </div>
                  <span className="font-bold text-[#B15543]">${item.precio}</span>
                </div>
              ))}
              <button className="w-full bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                Proceder al Checkout
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-[#3A4741] text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-[#E8E4DF]">Arca Tierra</h3>
              <p className="text-[#CCBB9A]">Experiencias auténticas en las chinampas de Xochimilco</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#E8E4DF]">Experiencias</h4>
              <ul className="space-y-2 text-[#CCBB9A]">
                <li>Amanecer Chinampero</li>
                <li>Brunch en las Chinampas</li>
                <li>Comidas Tradicionales</li>
                <li>Talleres Educativos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#E8E4DF]">Información</h4>
              <ul className="space-y-2 text-[#CCBB9A]">
                <li>Sobre Nosotros</li>
                <li>Políticas de Reserva</li>
                <li>Preguntas Frecuentes</li>
                <li>Testimonios</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#E8E4DF]">Contacto</h4>
              <div className="space-y-2 text-[#CCBB9A]">
                <p>Xochimilco, CDMX</p>
                <p>info@arcatierra.com</p>
                <p>+52 55 1234 5678</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#475A52] mt-8 pt-8 text-center text-[#CCBB9A]">
            <p>&copy; 2024 Arca Tierra. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

