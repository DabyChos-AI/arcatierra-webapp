'use client'

import { useCallback, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core'
import type { DateSelectArg } from '@fullcalendar/core'
import { Loader2 } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatMXN, type Reserva, type ReservaEstado } from '@/types/reservas'
import { ESTADOS_VISIBLES } from './estados'

interface ReservasCalendarioProps {
  refreshKey: number
  onEventClick: (id: string) => void
  /** RC1: el día tocado como YYYY-MM-DD (el día que se ve en la celda, hora local). */
  onSlotClick: (fecha: string) => void
}

interface ListResponse {
  items: Reserva[]
  total: number
  page: number
  per_page: number
}

const ESTADO_CLASSES: Record<ReservaEstado, string> = {
  tentativo: 'at-evt at-evt-tentativa',
  tentativa: 'at-evt at-evt-tentativa',
  confirmada: 'at-evt at-evt-confirmada',
  pagada: 'at-evt at-evt-pagada',
  realizada: 'at-evt at-evt-realizada',
  cancelada: 'at-evt at-evt-cancelada',
  reagendada: 'at-evt at-evt-reagendada',
}

function toISODate(d: Date): string {
  // YYYY-MM-DD en zona local (FullCalendar pasa Date locales)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function ReservasCalendario({
  refreshKey,
  onEventClick,
  onSlotClick,
}: ReservasCalendarioProps) {
  const { data: session } = useSession()
  const [events, setEvents] = useState<EventInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastRangeRef = useRef<{ desde: string; hasta: string } | null>(null)

  const fetchRange = useCallback(
    async (desde: string, hasta: string) => {
      const token = session?.accessToken as string | undefined
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          fecha_desde: desde,
          fecha_hasta: hasta,
          per_page: '100',
          page: '1',
        })
        // Las canceladas no se muestran en el calendario (29-sep, pedido de David).
        ESTADOS_VISIBLES.forEach((e) => params.append('estado', e))
        const res = await fetch(`${API_URL}/api/admin/reservas?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data: ListResponse = await res.json()
        const mapped: EventInput[] = (data.items ?? []).map((r) => {
          const startISO = `${r.fecha_experiencia}T${r.hora_inicio}`
          const endISO = r.hora_fin ? `${r.fecha_experiencia}T${r.hora_fin}` : undefined
          return {
            id: r.id,
            title: `${r.booking_id} · ${r.experiencia_nombre ?? ''}`.trim(),
            start: startISO,
            end: endISO,
            classNames: [ESTADO_CLASSES[r.estado] ?? 'at-evt'],
            extendedProps: {
              estado: r.estado,
              total: r.monto_total,
              booking_id: r.booking_id,
            },
          }
        })
        setEvents(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar calendario')
        setEvents([])
      } finally {
        setLoading(false)
      }
    },
    [session?.accessToken],
  )

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      const desde = toISODate(arg.start)
      // arg.end es exclusivo; restamos un dia para hacerlo inclusivo
      const endInclusive = new Date(arg.end.getTime() - 24 * 60 * 60 * 1000)
      const hasta = toISODate(endInclusive)
      const last = lastRangeRef.current
      if (last && last.desde === desde && last.hasta === hasta) return
      lastRangeRef.current = { desde, hasta }
      fetchRange(desde, hasta)
    },
    [fetchRange],
  )

  // Refetch al cambiar refreshKey
  const refreshKeyRef = useRef(refreshKey)
  if (refreshKeyRef.current !== refreshKey) {
    refreshKeyRef.current = refreshKey
    if (lastRangeRef.current) {
      void fetchRange(lastRangeRef.current.desde, lastRangeRef.current.hasta)
    }
  }

  const handleEventClick = (arg: EventClickArg) => {
    if (arg.event.id) onEventClick(arg.event.id)
  }

  const handleSelect = (arg: DateSelectArg) => {
    // Sin esto el día queda sombreado al cerrar el asistente
    arg.view.calendar.unselect()
    onSlotClick(toISODate(arg.start))
  }

  return (
    <div className="bg-white border border-neutro-borde rounded-lg p-4 relative">
      {/* Estilos para eventos custom por estado */}
      <style jsx global>{`
        .at-evt {
          border-radius: 4px !important;
          padding: 2px 6px !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          border-width: 1px !important;
          border-style: solid !important;
          cursor: pointer;
        }
        /* Letra NEGRA en todas las tarjetas (29-sep, David: "es difícil de leer"). FullCalendar pinta
           el texto en .fc-event-main con su propio color (blanco por defecto), así que el color que
           cada estado ponía en la tarjeta nunca llegaba al texto: blanco sobre amarillo y sobre gris.
           Cada estado se distingue por su fondo y su borde; todos con contraste >= 4.5 (T34). */
        .fc .at-evt {
          --fc-event-text-color: #111827;
        }
        .fc .at-evt,
        .fc .at-evt .fc-event-main,
        .fc .at-evt .fc-event-main-frame,
        .fc .at-evt .fc-event-time,
        .fc .at-evt .fc-event-title {
          color: #111827 !important;
        }
        .at-evt-tentativa {
          background-color: #fef3c7 !important;
          border-color: #f59e0b !important;
        }
        .at-evt-confirmada {
          background-color: rgba(51, 80, 62, 0.12) !important;
          border-color: rgba(51, 80, 62, 0.45) !important;
        }
        .at-evt-pagada {
          /* Antes verde oscuro con letra blanca: con letra negra el fondo pasa a verde claro. */
          background-color: #bbf7d0 !important;
          border-color: #33503e !important;
        }
        .at-evt-realizada {
          background-color: #e0f2fe !important;
          border-color: rgba(3, 105, 161, 0.45) !important;
        }
        .at-evt-cancelada {
          background-color: #e5e7eb !important;
          text-decoration: line-through;
          border-color: #d1d5db !important;
        }
        .at-evt-reagendada {
          background-color: #ffedd5 !important;
          border-color: #fdba74 !important;
        }
        /* Números de día, días de la semana, horas y "+N más" también en negro. */
        .fc .fc-col-header-cell-cushion,
        .fc .fc-daygrid-day-number,
        .fc .fc-daygrid-more-link,
        .fc .fc-timegrid-axis-cushion,
        .fc .fc-timegrid-slot-label-cushion {
          color: #111827;
        }
        .fc .fc-button-primary {
          background-color: #33503e !important;
          border-color: #33503e !important;
        }
        .fc .fc-button-primary:hover {
          background-color: #475a52 !important;
          border-color: #475a52 !important;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #b15543 !important;
          border-color: #b15543 !important;
        }
        .fc .fc-toolbar-title {
          font-family: var(--font-display, inherit);
          color: #33503e;
          font-size: 1.25rem;
        }
      `}</style>

      {error && (
        <div className="absolute top-2 right-2 z-20 bg-rojo-bg border border-rojo/30 px-3 py-1.5 rounded text-xs text-rojo">
          {error}
        </div>
      )}

      {loading && (
        <div className="absolute top-2 left-2 z-20 inline-flex items-center gap-2 bg-white/90 border border-neutro-borde px-3 py-1.5 rounded text-xs text-verde-suave">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Cargando...
        </div>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={esLocale}
        height={650}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Dia' }}
        events={events}
        selectable={true}
        select={handleSelect}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        nowIndicator={true}
        eventDisplay="block"
        dayMaxEventRows={3}
        eventDidMount={(info) => {
          const total = info.event.extendedProps.total as number | undefined
          if (typeof total === 'number') {
            info.el.title = `${info.event.title} — ${formatMXN(total)}`
          }
        }}
      />
    </div>
  )
}
