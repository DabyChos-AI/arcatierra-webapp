'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Calendar, Truck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface ZonaEntrega {
  id: number
  codigo_postal: string
  colonia: string
  municipio: string
  lunes: boolean
  martes: boolean
  miercoles: boolean
  jueves: boolean
  viernes: boolean
  sabado: boolean
  domingo: boolean
  tiempo_minimo_dias: number
}

interface DeliveryDatePickerProps {
  codigoPostal: string
  onDateSelect: (date: Date | null, zona: ZonaEntrega | null) => void
  selectedDate?: Date | null
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function DeliveryDatePicker({ codigoPostal, onDateSelect, selectedDate }: DeliveryDatePickerProps) {
  const [zona, setZona] = useState<ZonaEntrega | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selected, setSelected] = useState<Date | null>(selectedDate || null)

  // Buscar zona cuando cambia el CP
  useEffect(() => {
    const fetchZona = async () => {
      if (!codigoPostal || codigoPostal.length < 5) {
        setZona(null)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_URL}/api/zonas-entrega/${codigoPostal}`)
        
        if (response.ok) {
          const data = await response.json()
          setZona(data)
          setError(null)
        } else if (response.status === 404) {
          setZona(null)
          setError('Lo sentimos, no tenemos cobertura en este código postal')
        } else {
          setError('Error al verificar cobertura')
        }
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchZona, 300)
    return () => clearTimeout(debounce)
  }, [codigoPostal])

  // Calcular días del mes
  const diasDelMes = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Días vacíos antes del primer día
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }, [currentMonth])

  // Verificar si un día está disponible para entrega
  const isDayAvailable = (date: Date): boolean => {
    if (!zona) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + (zona.tiempo_minimo_dias || 2))

    // No disponible si es antes del mínimo
    if (date < minDate) return false

    // Verificar día de la semana
    const dayOfWeek = date.getDay()
    const diasDisponibles = [
      zona.domingo,
      zona.lunes,
      zona.martes,
      zona.miercoles,
      zona.jueves,
      zona.viernes,
      zona.sabado
    ]

    return diasDisponibles[dayOfWeek]
  }

  // Verificar si un día ya pasó
  const isPastDay = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Seleccionar fecha
  const handleSelectDate = (date: Date) => {
    if (!isDayAvailable(date)) return
    setSelected(date)
    onDateSelect(date, zona)
  }

  // Navegación de meses
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Formatear fecha seleccionada
  const formatSelectedDate = (date: Date): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return `${dias[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]}`
  }

  // Obtener próximo día disponible
  const getNextAvailableDay = (): string | null => {
    if (!zona) return null
    
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() + i)
      if (isDayAvailable(checkDate)) {
        return formatSelectedDate(checkDate)
      }
    }
    return null
  }

  return (
    <div className="w-full">
      {/* Header con estado de zona */}
      <div className="mb-4">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Verificando cobertura...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        ) : zona ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">
                {zona.colonia}, {zona.municipio}
              </p>
              <p className="text-xs text-green-600">
                ¡Excelente! Tenemos cobertura en tu zona
              </p>
            </div>
          </div>
        ) : codigoPostal.length >= 5 ? (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <MapPin className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-amber-700">Ingresa tu código postal completo</span>
          </div>
        ) : null}
      </div>

      {/* Calendario */}
      {zona && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-out">
          {/* Cabecera del calendario */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h3 className="text-white font-semibold">
                {MESES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="py-2 text-center text-xs font-medium text-gray-500">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 p-2 gap-1">
            {diasDelMes.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const isAvailable = isDayAvailable(date)
              const isPast = isPastDay(date)
              const isSelected = selected && date.toDateString() === selected.toDateString()
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  disabled={!isAvailable}
                  className={`
                    aspect-square rounded-xl text-sm font-medium
                    transition-all duration-200 ease-out
                    flex items-center justify-center relative
                    ${isSelected
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-110 z-10'
                      : isAvailable
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105 cursor-pointer'
                        : isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                    }
                    ${isToday && !isSelected ? 'ring-2 ring-green-300 ring-offset-1' : ''}
                  `}
                >
                  {date.getDate()}
                  {isAvailable && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Leyenda */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-green-50 border border-green-200 rounded" />
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-green-600 rounded" />
                <span>Seleccionado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-gray-100 rounded" />
                <span>No disponible</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fecha seleccionada */}
      {selected && zona && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Tu pedido llegará el</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatSelectedDate(selected)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Horario de entrega: 9:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Próximo día disponible si no hay selección */}
      {zona && !selected && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-500">
            Próxima entrega disponible: <span className="font-medium text-green-700">{getNextAvailableDay()}</span>
          </p>
        </div>
      )}
    </div>
  )
}
