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
  Sparkles,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico, hoyMexico } from '@/lib/dates'
import { normalizarSlug, rutaExperiencia } from '@/app/experiencias/[slug]/slug'
import { horario } from '@/app/admin/eventos/components/fechas'
import { formatMXN } from '@/types/reservas'
import type { FechaPublica } from '@/types/compra-experiencias'
import SelectorFecha, { esVendible, nombreDeFecha } from '@/components/experiencias/SelectorFecha'

// Fechas del feed (AAAA-MM-DD, columna DATE) con día de la semana. WEB-f: siempre con
// formatFechaMexico; `new Date('AAAA-MM-DD')` es medianoche UTC y en México pinta un día antes.
const FECHA_LARGA: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

/** AAAA-MM-DD de un día de la grilla (Date local), para compararlo con las fechas del feed. */
function fechaISOLocal(fecha: Date): string {
  const año = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

/** «Más Información»: liga por el slug que manda el feed (C3); si viene null, la fórmula de antes. */
function rutaDetalle(fecha: FechaPublica): string {
  return rutaExperiencia(fecha.experiencia_slug || normalizarSlug(nombreDeFecha(fecha).replace(/\s+/g, '-')))
}

/** Precio por persona de la fecha (C5: el de la fecha si tiene propio; si no, el de la experiencia). */
function precioFecha(fecha: FechaPublica): string {
  return fecha.precio_efectivo != null ? formatMXN(fecha.precio_efectivo) : 'Precio por confirmar'
}

/** «N disponibles» solo si la fecha se vende en línea y tiene cupo definido. */
function textoDisponibles(fecha: FechaPublica): string {
  if (!esVendible(fecha)) return 'Reserva por WhatsApp'
  return fecha.disponibles != null ? `${fecha.disponibles} disponibles` : ''
}

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

/** ¿La fecha es de esta categoría del panel izquierdo? (por el nombre, como siempre) */
function esDeCategoria(fecha: FechaPublica, categoriaId: string): boolean {
  const nombre = nombreDeFecha(fecha).toLowerCase()
  switch (categoriaId) {
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
}

export default function CalendarioPage() {
  const [fechaActual, setFechaActual] = useState(new Date()) // Mes actual
  const [vista] = useState<'calendario' | 'lista'>('lista')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  // La fecha cuyo selector está abierto (F2: «Agregar al carrito» abre SelectorFecha en el modal)
  const [modalFecha, setModalFecha] = useState<FechaPublica | null>(null)
  // Feed público GET /api/calendario/eventos (C5): cada item ES una fecha (`id` = evento_id)
  const [fechasCalendario, setFechasCalendario] = useState<FechaPublica[]>([])
  const [loadingEventos, setLoadingEventos] = useState(true)
  const [errorEventos, setErrorEventos] = useState<string | null>(null)

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoadingEventos(true)
        setErrorEventos(null)
        const response = await fetch(`${API_URL}/api/calendario/eventos?limit=100`)
        if (!response.ok) {
          setErrorEventos('No pudimos cargar las fechas. Recarga la página en un momento.')
          setFechasCalendario([])
          return
        }
        const result: { items?: FechaPublica[] } = await response.json()
        setFechasCalendario(Array.isArray(result.items) ? result.items : [])
      } catch {
        setErrorEventos('No pudimos cargar las fechas. Revisa tu conexión y recarga la página.')
        setFechasCalendario([])
      } finally {
        setLoadingEventos(false)
      }
    }

    cargarEventos()
  }, [])

  // Calcular experiencias del mes actual
  const experienciasDelMes = useMemo(() => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth() + 1 // JavaScript mes es 0-11, necesitamos 1-12
    return fechasCalendario.filter((f) => {
      // Extraer año y mes del string YYYY-MM-DD
      const [expAño, expMes] = f.fecha_evento.split('-').map(Number)
      return expAño === año && expMes === mes
    })
  }, [fechaActual, fechasCalendario])

  // Obtener experiencias de una fecha específica
  const getExperienciasDia = (fecha: Date) => {
    const fechaStr = fechaISOLocal(fecha)
    return fechasCalendario.filter((f) => f.fecha_evento === fechaStr)
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
    setFechaActual((prev) => {
      const año = prev.getFullYear()
      const mes = prev.getMonth()
      return direccion === 'anterior' ? new Date(año, mes - 1, 1) : new Date(año, mes + 1, 1)
    })
  }

  const hoy = hoyMexico()

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
          
          <div className="flex justify-center">
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
                  // Fechas de esta categoría DEL MES ACTUAL VISIBLE
                  const fechasDisponibles = experienciasDelMes.filter((f) => esDeCategoria(f, categoria.id)).length

                  // La próxima fecha de la categoría GLOBALMENTE (para navegación); «hoy» de México
                  const proximaExperienciaGlobal = fechasCalendario
                    .filter((f) => esDeCategoria(f, categoria.id))
                    .sort((x, y) => x.fecha_evento.localeCompare(y.fecha_evento))
                    .find((f) => f.fecha_evento >= hoy)

                  const proximaFechaTexto = proximaExperienciaGlobal
                    ? formatFechaMexico(proximaExperienciaGlobal.fecha_evento, { year: undefined, day: 'numeric', month: 'short' })
                    : 'Sin fechas'

                  const handleClickExperiencia = () => {
                    if (proximaExperienciaGlobal) {
                      // Solo navegar al mes de la próxima fecha, sin filtros
                      const [año, mes] = proximaExperienciaGlobal.fecha_evento.split('-').map(Number)
                      setFechaActual(new Date(año, mes - 1, 1)) // mes - 1 porque JavaScript usa 0-11
                    }
                  }

                  return (
                    <motion.div
                      key={categoria.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-3 rounded-lg border transition-all duration-300 cursor-pointer border-[#CCBB9A]/30 bg-gradient-to-r from-[#F5F3F0] to-white hover:border-[#B15543]/50"
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
                          <p className="text-xs text-[#475A52] mb-1">{fechasDisponibles} fechas disponibles</p>
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
                              {experienciasDia.slice(0, 3).map((f) => {
                                const categoria = categorias.find((cat) => esDeCategoria(f, cat.id))
                                return (
                                  <div key={f.id} className="text-xs" title={nombreDeFecha(f)}>
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
                  {errorEventos ? (
                    <p data-testid="cal-error" role="alert" className="text-[#B15543]">
                      {errorEventos}
                    </p>
                  ) : loadingEventos ? (
                    <p className="text-[#475A52]">Cargando fechas...</p>
                  ) : (
                    <div className="text-[#475A52] mb-4">
                      {experienciasDelMes.length} experiencias disponibles
                    </div>
                  )}

                  {experienciasDelMes.map((f, index) => (
                    <motion.div
                      key={f.id}
                      data-testid="cal-exp"
                      data-evento-id={f.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index, 10) * 0.1 }}
                      className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                        fechaSeleccionada && fechaISOLocal(fechaSeleccionada) === f.fecha_evento
                          ? 'border-[#B15543] bg-gradient-to-r from-[#B15543]/10 to-[#D4735E]/10'
                          : 'border-[#CCBB9A]/30 bg-gradient-to-r from-[#F5F3F0] to-white hover:border-[#B15543]/50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#3A4741] text-lg break-words">{nombreDeFecha(f)}</h4>
                          <p className="text-[#475A52] text-sm" data-testid="cal-exp-fecha">
                            {formatFechaMexico(f.fecha_evento, FECHA_LARGA)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-[#B15543]" data-testid="cal-exp-precio">
                            {precioFecha(f)}
                          </div>
                          <div className="text-sm text-[#475A52]" data-testid="cal-exp-disponibles">
                            {textoDisponibles(f)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#475A52] mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          <span>{horario(f.hora_inicio, f.hora_fin)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" aria-hidden="true" />
                          <span>Duración: 3 horas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                          <span>Calificación: 4.9/5</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => setModalFecha(f)}
                          data-testid="cal-exp-reservar"
                          className="flex-1 bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          {esVendible(f) ? (
                            <>
                              <ShoppingCart className="w-4 h-4 inline mr-2" aria-hidden="true" />
                              Agregar al carrito
                            </>
                          ) : (
                            'Reservar'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = rutaDetalle(f)
                          }}
                          data-testid="cal-exp-mas-info"
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
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-[#CCBB9A]" aria-hidden="true" />
                    <p>No hay experiencias programadas para esta fecha</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getExperienciasDia(fechaSeleccionada).map((f, index) => (
                      <motion.div
                        key={f.id}
                        data-testid="cal-dia-exp"
                        data-evento-id={f.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-[#F5F3F0] to-white rounded-xl p-4 border border-[#CCBB9A]/30"
                      >
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <h4 className="font-semibold text-[#3A4741] min-w-0 break-words">{nombreDeFecha(f)}</h4>
                          <span className="text-lg font-bold text-[#B15543] shrink-0" data-testid="cal-dia-precio">
                            {precioFecha(f)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#475A52] mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            <span>{horario(f.hora_inicio, f.hora_fin)}</span>
                          </div>
                          {textoDisponibles(f) && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" aria-hidden="true" />
                              <span>{textoDisponibles(f)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setModalFecha(f)}
                            data-testid="cal-dia-reservar"
                            className="flex-1 bg-gradient-to-r from-[#B15543] to-[#D4735E] text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300"
                          >
                            {esVendible(f) ? 'Agregar al carrito' : 'Reservar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              window.location.href = rutaDetalle(f)
                            }}
                            data-testid="cal-dia-mas-info"
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

      {/* Modal: SelectorFecha de la fecha elegida (F1/F2). Sin sesión: el checkout acepta invitados.
          z-[950] = nivel de modales (Z_INDEX_HIERARCHY.md): por encima de la burbuja de WhatsApp (750), que se abre sola. */}
      <AnimatePresence>
        {modalFecha && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[950] flex items-start justify-center pt-28 sm:pt-36 px-4 pb-4"
            onClick={() => setModalFecha(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cal-modal-titulo"
              data-testid="cal-modal"
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-10rem)] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 flex justify-between items-center gap-3 px-5 py-4 border-b border-[#CCBB9A]/40">
                <h3 id="cal-modal-titulo" className="text-xl font-bold text-[#3A4741] mb-0">
                  {esVendible(modalFecha) ? 'Elige tus lugares' : 'Reservar experiencia'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalFecha(null)}
                  aria-label="Cerrar"
                  className="p-2 hover:bg-[#F5F3F0] rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5 text-[#475A52]" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-5">
                <SelectorFecha key={modalFecha.id} fecha={modalFecha} onAgregado={() => setModalFecha(null)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

