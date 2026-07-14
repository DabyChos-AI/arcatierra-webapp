'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface IngresoMes {
  mes: string
  label: string
  total: number
}

interface ChartIngresosProps {
  data: IngresoMes[]
  loading?: boolean
}

const TERRACOTA = '#B15543'

function formatMXN(n: number): string {
  return `$${Math.round(n).toLocaleString('es-MX')} MXN`
}

interface TooltipPayloadItem {
  value: number
  payload: IngresoMes
}

function IngresosTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
}) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0]
  return (
    <div className="rounded-md bg-[rgba(44,38,32,0.92)] text-white px-2.5 py-1.5 text-xs shadow-medium">
      <div className="font-semibold">{point.payload.label}</div>
      <div>{formatMXN(point.value)}</div>
    </div>
  )
}

export default function ChartIngresos({ data, loading }: ChartIngresosProps) {
  const totalM = data.reduce((acc, d) => acc + d.total, 0) / 1_000_000

  return (
    <div className="bg-white rounded-xl border border-neutro-borde p-5 shadow-soft">
      <div className="flex items-center justify-between flex-wrap gap-1 mb-4">
        <h3 className="text-sm font-semibold text-verde-tipografia">
          Ingresos últimos 6 meses
        </h3>
        {!loading && data.length > 0 && (
          <span className="text-[10.5px] text-verde-suave font-normal">
            Total: ${totalM.toFixed(2)}M MXN
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-[200px] rounded-lg bg-neutral-200 animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-verde-suave">
          Sin datos de ingresos
        </div>
      ) : (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ingresosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TERRACOTA} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={TERRACOTA} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4D7C3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#748880' }}
                tickLine={false}
                axisLine={{ stroke: '#E4D7C3' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#748880' }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<IngresosTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke={TERRACOTA}
                strokeWidth={2.5}
                fill="url(#ingresosGradient)"
                dot={{ r: 3, fill: '#fff', stroke: TERRACOTA, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: TERRACOTA, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
