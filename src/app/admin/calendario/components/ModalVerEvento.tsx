'use client'

import { Calendar, Clock, Edit2, MapPin, Ticket, Users, X } from 'lucide-react'
import { formatFechaMexico } from '@/lib/dates'
import type { EventoPlaneacion } from '@/types/planeacion'
import { horaCorta, sinTope } from '../../eventos/components/fechas'

// CAL1 (29-sep): «Ver» del calendario abría un alert() del navegador («parece un mockup», David).
// Ficha de solo lectura con los datos reales; editar y tickets van a los modales de /admin/eventos.

const IDIOMAS: Record<string, string> = { es: 'Español', en: 'Inglés' }

// CALX1 (R4): el Calendario ya solo recibe fechas `activo` (backend); si llega otra, se dice.
const ESTADOS_NO_ACTIVOS: Record<string, string> = { cancelado: 'Cancelada', inactivo: 'Inactiva' }

function etiquetaEstado(estado: string): string {
  return ESTADOS_NO_ACTIVOS[estado] ?? estado
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-verde-suave">{etiqueta}</dt>
      <dd className="text-sm text-verde-tipografia mt-0.5">{children}</dd>
    </div>
  )
}

export default function ModalVerEvento({
  evento,
  puedeEditar,
  onClose,
  onEditar,
  onTickets,
}: {
  evento: EventoPlaneacion
  puedeEditar: boolean
  onClose: () => void
  onEditar: () => void
  onTickets: () => void
}) {
  const esPublica = evento.tipo === 'publica'
  const esInterno = evento.tipo === 'interno'
  const activo = evento.estado === 'activo'
  // El backend no deja editar una fecha cancelada (400): no se ofrece
  const cancelada = evento.estado === 'cancelado'
  const titulo = esPublica ? evento.experiencia_nombre || evento.nombre_evento : evento.nombre_evento
  const horario = evento.hora_fin
    ? `${horaCorta(evento.hora_inicio)} – ${horaCorta(evento.hora_fin)}`
    : horaCorta(evento.hora_inicio)
  const cupo = sinTope(evento.capacidad_maxima)
    ? `${evento.capacidad_ocupada} ocupados (sin tope)`
    : `${evento.capacidad_ocupada} / ${evento.capacidad_maxima} ocupados`

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-24 pb-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ver-evento-titulo"
        data-testid="calendario-ver-evento"
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-neutro-borde">
          <div>
            <p className="text-xs uppercase tracking-wide text-verde-suave">
              {esPublica ? 'Fecha pública' : esInterno ? 'Evento interno' : evento.tipo_evento}
              {!evento.visible_publico && ' · oculta en la web'}
            </p>
            <h2 id="ver-evento-titulo" className="font-display text-xl text-verde mt-0.5">
              {titulo}
            </h2>
            {!activo && (
              <span
                data-testid="ver-evento-estado"
                data-estado={evento.estado}
                className="inline-block mt-1 rounded-full text-xs font-medium px-2 py-0.5 bg-rojo-bg text-rojo"
              >
                {etiquetaEstado(evento.estado)}
              </span>
            )}
            {esInterno && evento.descripcion && (
              <p className="text-sm text-verde-suave mt-1">{evento.descripcion}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-verde-suave hover:bg-neutro-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5">
          <Dato etiqueta="Fecha">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-verde-suave" aria-hidden="true" />
              {formatFechaMexico(evento.fecha_evento)}
            </span>
          </Dato>
          <Dato etiqueta="Horario">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-verde-suave" aria-hidden="true" />
              {horario}
            </span>
          </Dato>
          <Dato etiqueta="Chinampa">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-verde-suave" aria-hidden="true" />
              {evento.chinampa || 'Sin asignar'}
            </span>
          </Dato>
          <Dato etiqueta={esPublica ? 'Cupo' : 'Personas'}>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-verde-suave" aria-hidden="true" />
              {esPublica ? cupo : evento.personas != null ? evento.personas : 'Sin definir'}
            </span>
          </Dato>
          {esPublica && (
            <Dato etiqueta="Tickets">
              {evento.tickets_registrados} registrados · {evento.tickets_web} por la web
            </Dato>
          )}
          <Dato etiqueta="Cocina / chef">{evento.cocina_nombre || '—'}</Dato>
          <Dato etiqueta="Idioma">{evento.idioma ? IDIOMAS[evento.idioma] ?? evento.idioma : '—'}</Dato>
          <Dato etiqueta="Guías">
            {evento.guias.length > 0
              ? evento.guias.map((g) => `${g.nombre}${g.es_externo ? ' (G.E)' : ''}`).join(', ')
              : '—'}
          </Dato>
          {evento.notas_internas && (
            <div className="col-span-2">
              <Dato etiqueta="Notas">
                <span className="whitespace-pre-line">{evento.notas_internas}</span>
              </Dato>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap justify-end gap-2 px-6 pb-5">
          {puedeEditar && esPublica && (
            <button
              type="button"
              onClick={onTickets}
              data-testid="calendario-ver-tickets"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutro-borde text-verde hover:bg-neutro-light"
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              Tickets
            </button>
          )}
          {puedeEditar && (esPublica || esInterno) && !cancelada && (
            <button
              type="button"
              onClick={onEditar}
              data-testid="calendario-ver-editar"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-terracota text-white hover:bg-terracota-dark"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              {esPublica ? 'Editar planeación' : 'Editar evento'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutro-borde text-verde-suave hover:bg-neutro-light"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
