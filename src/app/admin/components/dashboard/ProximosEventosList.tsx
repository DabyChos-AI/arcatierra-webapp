'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'

export interface EventoProximo {
  id: string
  booking_id: string
  fecha: string
  hora: string
  experiencia: string
  cliente: string
  invitados: number
  idioma: string
}

interface ProximosEventosListProps {
  items: EventoProximo[]
  loading?: boolean
}

/**
 * Parsea la fecha del evento de forma segura. Si viene como fecha pura
 * (YYYY-MM-DD) la anclamos a mediodía local para evitar el corrimiento de
 * un día por timezone; si trae hora usamos el string tal cual.
 */
function parseFecha(f: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(f)) return new Date(`${f}T12:00:00`)
  return new Date(f)
}

function diaMes(f: string): { dia: string; mes: string } {
  const d = parseFecha(f)
  if (Number.isNaN(d.getTime())) return { dia: '--', mes: '' }
  return {
    dia: d.toLocaleDateString('es-MX', { day: 'numeric' }),
    mes: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
  }
}

function IdiomaChip({ idioma }: { idioma: string }) {
  const es = idioma.toUpperCase().startsWith('ES')
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold ${
        es ? 'bg-[#F1F5F2] text-verde' : 'bg-azul-bg text-azul'
      }`}
    >
      {es ? 'ES' : 'EN'}
    </span>
  )
}

export default function ProximosEventosList({
  items,
  loading,
}: ProximosEventosListProps) {
  return (
    <div className="bg-white rounded-xl border border-neutro-borde p-5 shadow-soft">
      <div className="flex items-center justify-between flex-wrap gap-1 mb-4">
        <h3 className="text-sm font-semibold text-verde-tipografia">
          Próximos eventos
        </h3>
        <span className="text-[10.5px] text-verde-suave font-normal">
          Siguientes 3 días
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
              <div className="w-11 h-11 rounded-lg bg-neutral-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
                <div className="h-2.5 bg-neutral-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-verde-suave">
          Sin eventos en los próximos días
        </div>
      ) : (
        <div className="flex flex-col">
          {items.map((ev) => {
            const { dia, mes } = diaMes(ev.fecha)
            return (
              <Link
                key={ev.id}
                href={`/admin/reservas?reserva_id=${ev.id}`}
                prefetch={false}
                aria-label={`Ver reserva ${ev.booking_id} — ${ev.experiencia} de ${ev.cliente}`}
                className="flex items-center gap-3 py-2.5 px-1.5 rounded-lg border-b border-neutro-crema/60 last:border-b-0 hover:bg-neutro-light transition-colors"
              >
                <div className="rounded-lg bg-terracota text-white text-center px-2 py-1.5 min-w-[42px] flex-shrink-0">
                  <div className="text-[15px] font-bold leading-none">{dia}</div>
                  <div className="text-[9px] uppercase tracking-wide mt-0.5">
                    {mes}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] text-verde-suave">{ev.hora}</div>
                  <div className="text-[12.5px] font-semibold text-verde-tipografia truncate">
                    {ev.experiencia}
                  </div>
                  <div className="text-[11px] text-verde-suave truncate">
                    {ev.cliente}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-neutro-crema/70 text-verde-tipografia">
                    <Users className="h-3 w-3" aria-hidden="true" />
                    {ev.invitados}
                  </span>
                  <IdiomaChip idioma={ev.idioma} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
