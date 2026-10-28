// Tarjeta de una fecha PÚBLICA en Mi día (MID1, R11b, L8). Solo lectura: hora, experiencia, chinampa, cuántas personas van
// (de cuántos lugares) y guías. Sin compradores ni contacto (el backend no los manda) y sin «Llegaron» (es de reservas).
// Testids que NO empiezan con `midia-reserva-` (T319 de qa cuenta ese prefijo).

import { Clock, MapPin, Users, Ticket } from 'lucide-react'
import type { FechaPublicaMiDia } from '@/types/mi-dia'
import { horaCorta, plural } from './textos'

export default function TarjetaFechaPublica({ f }: { f: FechaPublicaMiDia }) {
  const inicio = horaCorta(f.hora_inicio)
  const fin = horaCorta(f.hora_fin)
  return (
    <article
      data-testid={`midia-publica-${f.evento_id}`}
      data-personas={f.personas}
      data-cupo={f.cupo ?? ''}
      className="rounded-xl border border-neutro-borde border-l-4 border-l-verde bg-white p-4 shadow-soft"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-baseline gap-2 text-verde" data-testid={`midia-publica-hora-${f.evento_id}`}>
          <Clock className="h-5 w-5 shrink-0 self-center text-terracota" aria-hidden="true" />
          <span className="text-3xl font-bold leading-none">{inicio || 'Sin hora'}</span>
          {fin && <span className="text-sm text-verde-medio">a {fin}</span>}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-verde/10 px-2.5 py-1 text-xs font-semibold text-verde">
          <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
          Fecha pública
        </span>
      </div>

      <h3 className="mb-0 mt-2 font-display text-xl leading-snug text-verde">{f.experiencia_nombre}</h3>
      {f.chinampa && (
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-verde-tipografia">
          <MapPin className="h-4 w-4 text-verde-medio" aria-hidden="true" />
          {f.chinampa}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          data-testid={`midia-publica-personas-${f.evento_id}`}
          className="inline-flex items-center gap-1 rounded-full bg-verde/10 px-3 py-1 text-sm font-semibold text-verde"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          {plural(f.personas, 'persona', 'personas')}
        </span>
        <span className="text-sm text-verde-medio">
          {f.cupo !== null ? `de ${plural(f.cupo, 'lugar', 'lugares')}` : 'sin tope de lugares'}
        </span>
      </div>

      <p className="mt-3 text-sm text-verde-tipografia" data-testid={`midia-publica-guias-${f.evento_id}`}>
        <span className="text-verde-medio">Guías: </span>
        {f.guias.length > 0 ? f.guias.map((g) => g.nombre).join(', ') : 'Sin guía asignado'}
      </p>
    </article>
  )
}
