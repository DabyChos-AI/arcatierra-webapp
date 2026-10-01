// Fase 4b de PLAN-EXP-SIN-FALLAS (sesión 40) · CP1: estado de un cupón en la tabla del panel (F3).
// Orden aprobado por el líder (contrato §10): Inactivo → Vigente → Agotado → Vencido → Programado.
// `vigente` lo calcula el backend con el «hoy» de México; aquí solo se explica POR QUÉ no lo está.

import type { Cupon } from '@/types/cupones'

export type EstadoCupon = 'inactivo' | 'vigente' | 'agotado' | 'vencido' | 'programado'

export const ESTADO_CUPON_LABEL: Record<EstadoCupon, string> = {
  inactivo: 'Inactivo',
  vigente: 'Vigente',
  agotado: 'Agotado',
  vencido: 'Vencido',
  programado: 'Programado',
}

/** Clases completas (Tailwind no ve las armadas con plantillas). */
export const ESTADO_CUPON_CLASE: Record<EstadoCupon, string> = {
  inactivo: 'bg-neutro-light text-verde-suave',
  vigente: 'bg-verde/10 text-verde',
  agotado: 'bg-amarillo-bg text-terracota-oscuro',
  vencido: 'bg-rojo-bg text-rojo',
  programado: 'bg-neutro-crema text-verde-claro',
}

/** `hoy` = `hoyMexico()` ('YYYY-MM-DD'). */
export function estadoCupon(c: Cupon, hoy: string): EstadoCupon {
  if (!c.activo) return 'inactivo'
  if (c.vigente) return 'vigente'
  if (c.usos_maximos != null && c.usos >= c.usos_maximos) return 'agotado'
  if (c.fecha_fin && c.fecha_fin < hoy) return 'vencido'
  if (c.fecha_inicio && c.fecha_inicio > hoy) return 'programado'
  // El backend lo ve fuera de vigencia y aquí no (p. ej. justo a la medianoche de México): se nombra por su fecha.
  return c.fecha_fin ? 'vencido' : 'programado'
}
