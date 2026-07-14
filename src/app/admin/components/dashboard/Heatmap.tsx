'use client'

export interface HeatmapDia {
  dia: number
  count: number
}

interface HeatmapProps {
  data: HeatmapDia[]
  /** Mes en formato YYYY-MM. */
  mes: string
}

// Terracota base para la escala de densidad.
const TERRACOTA_RGB = '177, 85, 67'

/** Opacidad por cantidad de reservas (sobre terracota). */
function opacidad(count: number): number {
  if (count <= 0) return 0.05
  if (count === 1) return 0.2
  if (count === 2) return 0.4
  if (count <= 4) return 0.6
  if (count <= 7) return 0.8
  return 1.0
}

const LEYENDA_NIVELES = [0, 1, 2, 3, 5, 8]

function nombreMes(mes: string, opts: Intl.DateTimeFormatOptions): string {
  const d = new Date(`${mes}-01T12:00:00`)
  if (Number.isNaN(d.getTime())) return mes
  return d.toLocaleDateString('es-MX', opts)
}

export default function Heatmap({ data, mes }: HeatmapProps) {
  const cols = data.length || 31
  const mesLargo = nombreMes(mes, { month: 'long', year: 'numeric' })
  const mesCorto = nombreMes(mes, { month: 'long' })
  const tituloMes =
    mesLargo.charAt(0).toUpperCase() + mesLargo.slice(1)

  return (
    <div className="bg-white rounded-xl border border-neutro-borde p-5 shadow-soft">
      <div className="flex items-center justify-between flex-wrap gap-1 mb-3">
        <h3 className="text-sm font-semibold text-verde-tipografia">
          Densidad del mes — {tituloMes}
        </h3>
        <span className="text-[10.5px] text-verde-suave font-normal">
          Cada cuadro = 1 día · más oscuro = más reservas
        </span>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-verde-suave">
          Sin datos de densidad para este mes
        </div>
      ) : (
        <>
          <div
            className="grid gap-[3px] mb-[3px]"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {data.map((d) => (
              <div
                key={`lbl-${d.dia}`}
                className="text-[8.5px] text-verde-suave text-center leading-none"
              >
                {d.dia}
              </div>
            ))}
          </div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {data.map((d) => (
              <div
                key={`cell-${d.dia}`}
                title={`${d.dia} de ${mesCorto}: ${
                  d.count === 1 ? '1 reserva' : `${d.count} reservas`
                }`}
                className="aspect-square rounded-[3px] transition-transform hover:scale-125"
                style={{
                  backgroundColor: `rgba(${TERRACOTA_RGB}, ${opacidad(d.count)})`,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 mt-3 text-[10.5px] text-verde-suave">
            <span>Menos</span>
            {LEYENDA_NIVELES.map((c) => (
              <span
                key={`leg-${c}`}
                className="w-3 h-3 rounded-[2px] flex-shrink-0"
                style={{
                  backgroundColor: `rgba(${TERRACOTA_RGB}, ${opacidad(c)})`,
                }}
                aria-hidden="true"
              />
            ))}
            <span>Más</span>
          </div>
        </>
      )}
    </div>
  )
}
