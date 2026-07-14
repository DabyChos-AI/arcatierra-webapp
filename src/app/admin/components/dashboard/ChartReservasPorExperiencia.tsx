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
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0].payload
  return (
    <div className="rounded-md bg-[rgba(44,38,32,0.92)] text-white px-2.5 py-1.5 text-xs shadow-medium">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E4D7C3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#748880' }}
                tickLine={false}
                axisLine={{ stroke: '#E4D7C3' }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="experiencia"
                width={150}
                tick={{ fontSize: 11, fill: '#3A4741' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<ReservasTooltip />}
                cursor={{ fill: 'rgba(51,80,62,0.06)' }}
              />
              <Bar dataKey="count" fill={VERDE} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
