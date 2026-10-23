'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTemaAdmin } from '../TemaAdminContext'

export interface ReservaPorExperiencia {
  experiencia: string
  count: number
  porcentaje: number
}

interface ChartReservasPorExperienciaProps {
  data: ReservaPorExperiencia[]
  loading?: boolean
}

const VERDE = '#33503E'

// K2 (DR77): recharts pinta por props, no por clases: los colores salen del tema. `claro` = los valores de
// siempre (sin cambios); `oscuro` medido sobre la superficie #1C2420 (números 6.98, nombres 10.14, barras 6.95).
const COLORES = {
  claro: { barra: VERDE, rejilla: '#E4D7C3', eje: '#748880', nombres: '#3A4741', cursor: 'rgba(51,80,62,0.06)' },
  oscuro: { barra: '#7FB894', rejilla: '#34413A', eje: '#A2AFA8', nombres: '#C7D1CB', cursor: 'rgba(255,255,255,0.06)' },
} as const

const CLASE_TOOLTIP = {
  claro: 'rounded-md bg-[rgba(44,38,32,0.92)] text-white px-2.5 py-1.5 text-xs shadow-medium',
  oscuro: 'k2-tooltip-grafica rounded-md text-white px-2.5 py-1.5 text-xs shadow-medium',
} as const

interface TooltipPayloadItem {
  value: number
  payload: ReservaPorExperiencia
}

function ReservasTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
}) {
  const { tema } = useTemaAdmin()
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0].payload
  return (
    <div className={CLASE_TOOLTIP[tema]}>
      <div className="font-semibold">{p.experiencia}</div>
      <div>
        {p.count} reservas ({p.porcentaje}%)
      </div>
    </div>
  )
}

export default function ChartReservasPorExperiencia({
  data,
  loading,
}: ChartReservasPorExperienciaProps) {
  const { tema } = useTemaAdmin()
  const c = COLORES[tema]
  const top = data.slice(0, 8)

  return (
    <div className="bg-white rounded-xl border border-neutro-borde p-5 shadow-soft">
      <div className="flex items-center justify-between flex-wrap gap-1 mb-4">
        <h3 className="text-sm font-semibold text-verde-tipografia">
          Reservas por experiencia
        </h3>
        <span className="text-[10.5px] text-verde-suave font-normal">
          Mes en curso
        </span>
      </div>

      {loading ? (
        <div className="h-[240px] rounded-lg bg-neutral-200 animate-pulse" />
      ) : top.length === 0 ? (
        <div className="h-[240px] flex items-center justify-center text-sm text-verde-suave">
          Sin reservas este mes
        </div>
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={c.rejilla} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: c.eje }}
                tickLine={false}
                axisLine={{ stroke: c.rejilla }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="experiencia"
                width={150}
                tick={{ fontSize: 11, fill: c.nombres }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<ReservasTooltip />}
                cursor={{ fill: c.cursor }}
              />
              <Bar dataKey="count" fill={c.barra} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
