'use client'

import { formatFechaMexico } from '@/lib/dates'
import type { DiaPlaneacion, FilaJunta, TipoFilaPlaneacion } from '@/types/planeacion'

// Colores del chip Privado / Público / Interno (clases verificadas en tailwind.config.ts)
const CHIP_TIPO: Record<TipoFilaPlaneacion, string> = {
  privada: 'bg-terracota/10 text-terracota-dark border-terracota/30',
  publica: 'bg-verde/10 text-verde border-verde/30',
  interno: 'bg-azul-bg text-azul border-azul/30',
}

const COLUMNAS = [
  'Folio',
  'Horario',
  'Evento',
  'Invitado',
  'Tipo',
  'Chinampa',
  'Pax',
  'Niños',
  'Staff',
  'Idioma',
  'Guías',
  'Cocina',
  'Observaciones',
]

function texto(valor: string | null): string {
  return valor && valor.trim() ? valor : '—'
}

function Fila({ fila }: { fila: FilaJunta }) {
  const celda = 'border-b border-neutro-borde/60 px-3 py-2 align-top text-verde-tipografia'
  return (
    <tr data-testid={`planeacion-fila-${fila.id}`} className="hover:bg-neutro-light/60">
      <td className={`${celda} whitespace-nowrap font-mono text-xs`}>{texto(fila.folio)}</td>
      <td className={`${celda} whitespace-nowrap tabular-nums`}>{fila.horario}</td>
      <td className={`${celda} min-w-[10rem] font-medium text-verde`}>{fila.evento}</td>
      <td className={`${celda} min-w-[9rem]`}>{texto(fila.invitado)}</td>
      <td className={`${celda} whitespace-nowrap`}>
        <span
          className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${
            CHIP_TIPO[fila.tipo] ?? 'bg-neutro-light text-verde-suave border-neutro-borde'
          }`}
        >
          {fila.privado_publico}
        </span>
      </td>
      <td className={`${celda} whitespace-nowrap`}>{texto(fila.chinampa)}</td>
      <td className={`${celda} text-right tabular-nums`}>{fila.pax ?? '—'}</td>
      <td className={`${celda} text-right tabular-nums ${fila.ninos ? '' : 'text-verde-suave'}`}>
        {fila.ninos}
      </td>
      <td className={`${celda} text-right tabular-nums ${fila.staff ? '' : 'text-verde-suave'}`}>
        {fila.staff}
      </td>
      <td className={`${celda} whitespace-nowrap`}>{texto(fila.idioma)}</td>
      <td className={`${celda} min-w-[8rem]`}>{texto(fila.guias)}</td>
      <td className={`${celda} min-w-[8rem]`}>{texto(fila.cocina)}</td>
      <td className={`${celda} min-w-[14rem] whitespace-pre-line text-xs`}>
        {texto(fila.observaciones)}
      </td>
    </tr>
  )
}

export default function TablaPlaneacion({
  dias,
  hoy,
}: {
  dias: DiaPlaneacion[]
  hoy: string
}) {
  return (
    // En móvil la tabla se desplaza dentro de su contenedor, no la página
    <div className="overflow-x-auto rounded-lg border border-neutro-borde bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {COLUMNAS.map((c) => (
              <th
                key={c}
                scope="col"
                className="whitespace-nowrap bg-verde px-3 py-2 text-left text-xs font-semibold text-white"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        {dias.map((dia) => {
          const esHoy = dia.fecha === hoy
          return (
            <tbody key={dia.fecha} data-testid={`planeacion-dia-${dia.fecha}`}>
              <tr>
                <th
                  colSpan={COLUMNAS.length}
                  scope="colgroup"
                  className={`border-b border-neutro-borde px-3 py-2 text-left text-xs font-bold uppercase tracking-wide ${
                    esHoy ? 'bg-terracota/10 text-terracota-dark' : 'bg-neutro-light text-verde'
                  }`}
                >
                  {dia.dia} · {formatFechaMexico(dia.fecha, { day: 'numeric', month: 'long', year: undefined })}
                  {esHoy && (
                    <span className="ml-2 rounded-full bg-terracota px-2 py-0.5 text-[10px] font-semibold normal-case text-white">
                      Hoy
                    </span>
                  )}
                  {dia.filas.length > 0 && (
                    <span className="ml-2 font-normal normal-case text-verde-suave">
                      {dia.filas.length} {dia.filas.length === 1 ? 'evento' : 'eventos'}
                    </span>
                  )}
                </th>
              </tr>
              {dia.filas.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNAS.length}
                    className="border-b border-neutro-borde/60 px-3 py-2 text-xs italic text-verde-suave"
                  >
                    Sin eventos
                  </td>
                </tr>
              ) : (
                dia.filas.map((fila) => <Fila key={`${dia.fecha}-${fila.id}`} fila={fila} />)
              )}
            </tbody>
          )
        })}
      </table>
    </div>
  )
}
