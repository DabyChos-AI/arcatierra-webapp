'use client'

import type { ReservaEstadoPago } from '@/types/reservas'

interface BadgeEstadoPagoProps {
  estado: ReservaEstadoPago
}

const ESTADO_PAGO_CONFIG: Record<ReservaEstadoPago, { label: string; classes: string }> = {
  sin_pagar: {
    label: 'Sin pagar',
    classes: 'bg-rojo-bg text-rojo border border-rojo/30',
  },
  anticipo: {
    label: 'Anticipo',
    classes: 'bg-amarillo-bg text-amarillo border border-amarillo/30',
  },
  pagado: {
    label: 'Pagado',
    classes: 'bg-verde text-white',
  },
  reembolsado: {
    label: 'Reembolsado',
    classes: 'bg-neutro-borde text-verde-suave',
  },
}

export default function BadgeEstadoPago({ estado }: BadgeEstadoPagoProps) {
  const cfg = ESTADO_PAGO_CONFIG[estado] ?? ESTADO_PAGO_CONFIG.sin_pagar
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  )
}
