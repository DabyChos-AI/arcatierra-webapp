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
import { useTemaAdmin } from '../TemaAdminContext'

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

// K2 (DR77): recharts pinta por props, no por clases: los colores salen del tema. `claro` = los valores de
// siempre salvo el eje (CLARO1, R15 F1: #748880 daba 3.77 sobre blanco; #596C64 = verde-medio, 5.59); `oscuro` medido sobre la superficie #1C2420 (ejes 6.98, línea 6.47).
const COLORES = {
  claro: { linea: TERRACOTA, rejilla: '#E4D7C3', eje: '#596C64', punto: '#fff' },
  oscuro: { linea: '#E58F7C', rejilla: '#34413A', eje: '#A2AFA8', punto: '#1C2420' },
} as const

// Tooltip en oscuro: una superficie más clara con borde, para que no se pierda sobre la tarjeta.
const CLASE_TOOLTIP = {
  claro: 'rounded-md bg-[rgba(44,38,32,0.92)] text-white px-2.5 py-1.5 text-xs shadow-medium',
  oscuro: 'k2-tooltip-grafica rounded-md text-white px-2.5 py-1.5 text-xs shadow-medium',
} as const

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
  const { tema } = useTemaAdmin()
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0]
  return (
    <div className={CLASE_TOOLTIP[tema]}>
      <div className="font-semibold">{point.payload.label}</div>
      <div>{formatMXN(point.value)}</div>
    </div>
  )
}

export default function ChartIngresos({ data, loading }: ChartIngresosProps) {
  const { tema } = useTemaAdmin()
  const c = COLORES[tema]
  const totalM = data.reduce((acc, d) => acc + d.total, 0) / 1_000_000

  return (
    <div className="bg-white rounded-xl border border-neutro-borde p-5 shadow-soft">
      <div className="flex items-center justify-between flex-wrap gap-1 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-verde-tipografia">
            Ingresos últimos 6 meses
          </h3>
          <p className="text-[10.5px] text-verde-medio">
            Lo vendido por mes de la experiencia (confirmadas, pagadas y realizadas)
          </p>
        </div>
        {!loading && data.length > 0 && (
          <span className="text-[10.5px] text-verde-medio font-normal">
            Total: ${totalM.toFixed(2)}M MXN
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-[200px] rounded-lg bg-neutral-200 animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-verde-medio">
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
                  <stop offset="0%" stopColor={c.linea} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={c.linea} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={c.rejilla} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: c.eje }}
                tickLine={false}
                axisLine={{ stroke: c.rejilla }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: c.eje }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<IngresosTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke={c.linea}
                strokeWidth={2.5}
                fill="url(#ingresosGradient)"
                dot={{ r: 3, fill: c.punto, stroke: c.linea, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: c.linea, stroke: c.punto, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
