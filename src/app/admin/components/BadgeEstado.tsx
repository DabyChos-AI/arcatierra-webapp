'use client'

import type { ReservaEstado } from '@/types/reservas'

interface BadgeEstadoProps {
  estado: ReservaEstado
}

const ESTADO_CONFIG: Record<ReservaEstado, { label: string; classes: string }> = {
  tentativo: {
    label: 'Tentativa',
    classes: 'bg-amarillo-bg text-amarillo border border-amarillo/30',
  },
  tentativa: {
    label: 'Tentativa',
    classes: 'bg-amarillo-bg text-amarillo border border-amarillo/30',
  },
  confirmada: {
    label: 'Confirmada',
    classes: 'bg-verde/10 text-verde border border-verde/30',
  },
  pagada: {
    label: 'Pagada',
    classes: 'bg-verde text-white',
  },
  realizada: {
    label: 'Realizada',
    classes: 'bg-azul-bg text-azul border border-azul/30',
  },
  cancelada: {
    label: 'Cancelada',
    classes: 'bg-neutro-borde text-verde-suave line-through',
  },
  reagendada: {
    label: 'Reagendada',
    classes: 'bg-orange-100 text-orange-700',
  },
}

export default function BadgeEstado({ estado }: BadgeEstadoProps) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.tentativa
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  )
}
