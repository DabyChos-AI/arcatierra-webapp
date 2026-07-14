'use client'

import type { LucideIcon } from 'lucide-react'

export type KpiColor =
  | 'terracota'
  | 'verde'
  | 'amarillo'
  | 'azul'
  | 'morado'
  | 'rosa'

interface KpiCardProps {
  icon: LucideIcon
  iconColor: KpiColor
  title: string
  value: string | number
  /** Variación porcentual vs periodo anterior. >0 verde ▲, <0 rojo ▼, undefined omite. */
  trend?: number
  detail?: string
}

/**
 * Mapa estático color → clases Tailwind COMPLETAS.
 * Tailwind no detecta clases construidas dinámicamente (`bg-${x}-bg`), por eso
 * cada clase aparece aquí como string literal. terracota/verde no tienen
 * variante `-bg` en la config → se usa valor arbitrario (mismos hex que el demo).
 */
const COLOR_MAP: Record<KpiColor, { text: string; bg: string }> = {
  terracota: { text: 'text-terracota', bg: 'bg-[#FFF8F5]' },
  verde: { text: 'text-verde', bg: 'bg-[#F1F5F2]' },
  amarillo: { text: 'text-amarillo', bg: 'bg-amarillo-bg' },
  azul: { text: 'text-azul', bg: 'bg-azul-bg' },
  morado: { text: 'text-morado', bg: 'bg-morado-bg' },
  rosa: { text: 'text-rosa', bg: 'bg-rosa-bg' },
}

export default function KpiCard({
  icon: Icon,
  iconColor,
  title,
  value,
  trend,
  detail,
}: KpiCardProps) {
  const colors = COLOR_MAP[iconColor]
  const hasTrend = trend !== undefined && !Number.isNaN(trend)
  const trendUp = hasTrend && (trend as number) >= 0

  return (
    <div className="bg-white rounded-xl border border-neutro-borde p-4 shadow-soft transition-transform hover:-translate-y-0.5">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors.bg}`}
      >
        <Icon className={`h-4 w-4 ${colors.text}`} aria-hidden="true" />
      </div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-verde-suave mb-1">
        {title}
      </p>
      <p className="text-[27px] leading-none font-bold text-verde mb-1.5">
        {value}
      </p>
      {(hasTrend || detail) && (
        <div className="text-[11.5px] text-verde-suave flex items-center gap-1.5 flex-wrap">
          {hasTrend && (
            <span
              className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded ${
                trendUp
                  ? 'bg-[#D1FAE5] text-[#059669]'
                  : 'bg-rojo-bg text-rojo'
              }`}
            >
              {trendUp ? '▲' : '▼'} {Math.abs(trend as number)}%
            </span>
          )}
          {detail && <span>{detail}</span>}
        </div>
      )}
    </div>
  )
}
