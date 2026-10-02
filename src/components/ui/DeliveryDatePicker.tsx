'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Truck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { hoyMexico, sumarDias } from '@/lib/dates'
import type { DiaNoHabil, RespuestaDiasNoHabiles } from '@/types/datos-cliente'

/** Una zona de `GET /api/zonas-entrega/{cp}` (la misma forma que usa PostalCodeSelector). */
export interface ZonaEntrega {
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
  /**
   * `date` = medianoche LOCAL del día elegido (para pintarlo); `iso` = ese día como `AAAA-MM-DD`, que es lo que se
   * manda al backend. Nunca `date.toISOString()`: fuera de UTC-6 corre el día (TZ1b).
   */
  onDateSelect: (date: Date | null, zona: ZonaEntrega | null, iso: string | null) => void
  selectedDate?: Date | null
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// ─── TZ1b (R2, sesión 42): el calendario cuenta desde el «hoy» de MÉXICO, no desde el reloj del navegador ─────────
// Cada celda es un día del calendario (año, mes, día), no un instante: se compara como `AAAA-MM-DD` contra
// hoyMexico()/sumarDias(). Con el reloj del navegador, un cliente en Madrid o en Los Ángeles veía un día de más o de menos.

/** El día de una celda (medianoche local) como `AAAA-MM-DD`, con sus propios componentes (sin zona). */
function isoDeCelda(date: Date): string {
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mes}-${dia}`
}

/** `AAAA-MM-DD` → medianoche LOCAL de ese día (la forma de las celdas). */
function celdaDeIso(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

/** Día de la semana (0 = domingo) de una fecha `AAAA-MM-DD`, sin que la zona del navegador lo corra. */
function diaDeLaSemana(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay()
}

// ─── M10 (R6, sesión 46): días sin entrega (feriados LFT + los del panel) y tope de agenda, del backend ─────────────
// Una sola fuente: `GET /api/entregas/dias-no-habiles` (público, sin parámetros) — la misma lista con la que el backend
// rechaza la fecha al pagar. UNA petición por carga de página: el checkout remonta el calendario al cambiar de C.P.
// Si falla, el calendario sigue como antes (sin feriados ni tope) y el backend valida igual; se reintenta al remontar.

const ISO_FECHA = /^\d{4}-\d{2}-\d{2}$/

function esDiaNoHabil(d: unknown): d is DiaNoHabil {
  const x = d as Partial<DiaNoHabil> | null
  return !!x && typeof x.fecha === 'string' && ISO_FECHA.test(x.fecha) && typeof x.motivo === 'string'
}

function esRespuestaDiasNoHabiles(d: unknown): d is RespuestaDiasNoHabiles {
  const x = d as Partial<RespuestaDiasNoHabiles> | null
  return !!x && Array.isArray(x.dias) && typeof x.maximo_dias === 'number' && Number.isFinite(x.maximo_dias) && x.maximo_dias > 0
}

let pedidoDiasNoHabiles: Promise<RespuestaDiasNoHabiles | null> | null = null

function pedirDiasNoHabiles(): Promise<RespuestaDiasNoHabiles | null> {
  if (!pedidoDiasNoHabiles) {
    pedidoDiasNoHabiles = fetch(`${API_URL}/api/entregas/dias-no-habiles`)
      .then(async (r) => {
        if (!r.ok) return null
        const datos: unknown = await r.json()
        return esRespuestaDiasNoHabiles(datos) ? { ...datos, dias: datos.dias.filter(esDiaNoHabil) } : null
      })
      .catch(() => null)
      .then((datos) => {
        if (!datos) pedidoDiasNoHabiles = null // falló: el siguiente calendario que se monte lo vuelve a intentar
        return datos
      })
  }
  return pedidoDiasNoHabiles
}

/** El texto de un día sin entrega: `title` y final del `aria-label` (contrato R6 §4 front-checkout 4). */
function textoSinEntrega(motivo: string): string {
  return `Sin entrega: ${motivo}`
}

/** El primer día del mes de hoy en México (para abrir el calendario en el mes correcto). */
function mesDeHoyMexico(): Date {
  const [anio, mes] = hoyMexico().split('-').map(Number)
  return new Date(anio, mes - 1, 1)
}

export default function DeliveryDatePicker({ codigoPostal, onDateSelect, selectedDate }: DeliveryDatePickerProps) {
  const [zona, setZona] = useState<ZonaEntrega | null>(null)
  // Con un C.P. completo arranca «Verificando cobertura…»: el checkout remonta el calendario al cambiar de C.P. (R6) y,
  // sin esto, durante el debounce se veía «Ingresa tu código postal completo» con un C.P. ya completo.
  const [loading, setLoading] = useState(() => codigoPostal.length >= 5)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(mesDeHoyMexico)
  const [selected, setSelected] = useState<Date | null>(selectedDate || null)
  // M10: `AAAA-MM-DD` → motivo, y hasta cuántos días adelante se agenda (null = no llegó la lista: sin tope, como antes).
  const [sinEntrega, setSinEntrega] = useState<Map<string, string>>(() => new Map())
  const [maximoDias, setMaximoDias] = useState<number | null>(null)

  useEffect(() => {
    let vigente = true
    pedirDiasNoHabiles().then((respuesta) => {
      if (!vigente || !respuesta) return
      setSinEntrega(new Map(respuesta.dias.map((d) => [d.fecha, d.motivo])))
      setMaximoDias(respuesta.maximo_dias)
    })
    return () => {
      vigente = false
    }
  }, [])

  // El último día que se puede agendar (inclusive), como el backend: `fecha > hoy + DIAS_MAXIMO_AGENDA` se rechaza.
  const tope = maximoDias !== null ? sumarDias(hoyMexico(), maximoDias) : null

  // Buscar zona cuando cambia el CP
  useEffect(() => {
    const fetchZona = async () => {
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
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    if (!codigoPostal || codigoPostal.length < 5) {
      setZona(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
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

  // Verificar si un día (`AAAA-MM-DD`) está disponible para entrega, contando desde el «hoy» de México
  const isIsoAvailable = (iso: string): boolean => {
    if (!zona) return false

    const minimo = sumarDias(hoyMexico(), zona.tiempo_minimo_dias || 2)

    // No disponible si es antes del mínimo (las fechas `AAAA-MM-DD` se comparan como texto)
    if (iso < minimo) return false

    // M10: ni después del tope de agenda ni en un día sin entrega (feriado o día que agregó el equipo)
    if (tope !== null && iso > tope) return false
    if (sinEntrega.has(iso)) return false

    // Verificar día de la semana
    const dayOfWeek = diaDeLaSemana(iso)
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

  const isDayAvailable = (date: Date): boolean => isIsoAvailable(isoDeCelda(date))

  // Verificar si un día ya pasó (en México)
  const isPastDay = (date: Date): boolean => isoDeCelda(date) < hoyMexico()

  // Seleccionar fecha
  const handleSelectDate = (date: Date) => {
    if (!isDayAvailable(date)) return
    setSelected(date)
    onDateSelect(date, zona, isoDeCelda(date))
  }

  // Navegación de meses
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Más allá del tope no hay nada que elegir: el mes siguiente se ofrece solo si empieza antes del tope.
  const haySiguienteMes = tope === null || isoDeCelda(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)) <= tope

  // Formatear fecha seleccionada
  const formatSelectedDate = (date: Date): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return `${dias[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]}`
  }

  // Obtener próximo día disponible
  const getNextAvailableDay = (): string | null => {
    if (!zona) return null

    const hoy = hoyMexico()
    for (let i = 0; i < 30; i++) {
      const iso = sumarDias(hoy, i)
      if (isIsoAvailable(iso)) {
        return formatSelectedDate(celdaDeIso(iso))
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
                aria-label="Mes anterior"
                data-testid="entrega-mes-anterior"
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
                disabled={!haySiguienteMes}
                aria-label="Mes siguiente"
                data-testid="entrega-mes-siguiente"
                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
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

              const iso = isoDeCelda(date)
              const isAvailable = isDayAvailable(date)
              const isPast = isPastDay(date)
              const isSelected = selected && date.toDateString() === selected.toDateString()
              const isToday = iso === hoyMexico()
              // M10: feriado o día sin entrega del panel → deshabilitado, con su motivo (title + aria-label) y marca visible
              const motivoSinEntrega = sinEntrega.get(iso) ?? null
              const etiquetaSinEntrega = motivoSinEntrega !== null ? textoSinEntrega(motivoSinEntrega) : null

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  disabled={!isAvailable}
                  data-testid={`entrega-dia-${iso}`}
                  data-fecha={iso}
                  data-disponible={isAvailable ? 'true' : 'false'}
                  data-sin-entrega={etiquetaSinEntrega ? '1' : undefined}
                  title={etiquetaSinEntrega ?? undefined}
                  aria-label={
                    etiquetaSinEntrega
                      ? `${formatSelectedDate(date)}. ${etiquetaSinEntrega}`
                      : `${formatSelectedDate(date)}${isAvailable ? '' : ' (sin entrega)'}`
                  }
                  aria-pressed={!!isSelected}
                  className={`
                    aspect-square rounded-xl text-sm font-medium
                    transition-all duration-200 ease-out
                    flex items-center justify-center relative
                    ${isSelected
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-110 z-10'
                      : isAvailable
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105 cursor-pointer'
                        : etiquetaSinEntrega
                          ? 'bg-terracota/10 text-terracota line-through cursor-not-allowed'
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
                  {etiquetaSinEntrega && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-terracota rounded-full" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Leyenda */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
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
              {sinEntrega.size > 0 && (
                <div className="flex items-center gap-1.5" data-testid="entrega-leyenda-sin-entrega">
                  <span className="w-3 h-3 bg-terracota/10 border border-terracota/40 rounded" />
                  <span>Sin entrega</span>
                </div>
              )}
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
