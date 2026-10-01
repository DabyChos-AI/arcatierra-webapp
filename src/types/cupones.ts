// Fase 4b de PLAN-EXP-SIN-FALLAS (sesión 40, 1-oct-2026) · CP1: pantalla de cupones del panel.
// Contrato: build-with-agent-team/projects/arcatierra/docs/decisiones/EXP-FASE4B-CONTRATO.md (C6).
// UN solo sistema de cupones para la tienda y las reservas privadas (D12/D16). En la WEB los cupones no aplican a
// experiencias (D13-3): `aplica_experiencias` solo cuenta en las reservas privadas del panel.

import { formatMXN } from '@/types/reservas'

export type TipoCupon = 'porcentaje' | 'fijo' | 'envio_gratis'

export const TIPO_CUPON_LABEL: Record<TipoCupon, string> = {
  porcentaje: 'Porcentaje',
  fijo: 'Monto fijo',
  envio_gratis: 'Envío gratis',
}

/** Una fila de `GET /api/admin/cupones`. */
export interface Cupon {
  id: string
  /** Siempre en MAYÚSCULAS (el backend normaliza al guardar). */
  codigo: string
  descripcion: string | null
  tipo: TipoCupon
  /** % (0–100) si es porcentaje; pesos si es fijo; 0 si es envío gratis. */
  valor: number
  minimo_compra: number
  /** null = sin límite. */
  usos_maximos: number | null
  /** Pedidos de la tienda cobrados + reservas privadas no canceladas que lo usan. */
  usos: number
  usos_pedidos: number
  usos_reservas: number
  aplica_productos: boolean
  /** Reservas privadas del panel (en la web nunca: D13-3). */
  aplica_experiencias: boolean
  /** 'YYYY-MM-DD' (hora de México). */
  fecha_inicio: string | null
  fecha_fin: string | null
  activo: boolean
  /** activo + dentro de fechas + con usos disponibles (hoy de México). */
  vigente: boolean
  created_at: string | null
  updated_at: string | null
}

export interface CuponesListResponse {
  items: Cupon[]
  total: number
}

/** Cuerpo de `POST /api/admin/cupones` y `PATCH /api/admin/cupones/{id}` (en el PATCH todo es opcional). */
export interface CuponPayload {
  codigo: string
  descripcion: string | null
  tipo: TipoCupon
  valor: number
  minimo_compra: number
  usos_maximos: number | null
  aplica_productos: boolean
  aplica_experiencias: boolean
  fecha_inicio: string | null
  fecha_fin: string | null
  activo: boolean
}

/** «10 %» · «$500.00» · «Envío gratis». */
export function textoValorCupon(c: Pick<Cupon, 'tipo' | 'valor'>): string {
  if (c.tipo === 'porcentaje') return `${Number(c.valor)} %`
  if (c.tipo === 'fijo') return formatMXN(Number(c.valor))
  return 'Envío gratis'
}

/** «Tienda y reservas privadas» · «Solo tienda» · «Solo reservas privadas» · «—». */
export function textoAplicaA(c: Pick<Cupon, 'aplica_productos' | 'aplica_experiencias'>): string {
  if (c.aplica_productos && c.aplica_experiencias) return 'Tienda y reservas privadas'
  if (c.aplica_productos) return 'Solo tienda'
  if (c.aplica_experiencias) return 'Solo reservas privadas'
  return '—'
}

/** «3 de 10» · «3 (sin límite)». */
export function textoUsos(c: Pick<Cupon, 'usos' | 'usos_maximos'>): string {
  return c.usos_maximos ? `${c.usos} de ${c.usos_maximos}` : `${c.usos} (sin límite)`
}
