/**
 * R5 · Reembolsos y Auditoría (sesión 45, 2-oct-2026). Archivo del LÍDER: espejo de
 * `arca_tierra_api/services/reembolso_reglas.py` y `services/auditoria_reglas.py`. Úsalo, no lo copies; si te falta algo, pídelo.
 *
 * Decisiones de David (2-oct): DR15 — solo el reembolso TOTAL libera lugares y devuelve stock; el botón «Reembolsar» es solo para
 * quien tiene el permiso `reembolsos` (admin; super_admin pasa siempre), con confirmación e idempotente; un contracargo se avisa,
 * no se procesa. DR16 — un pago doble se avisa y el equipo devuelve el de más con el botón. TOT1 — en reservas del Sheet se captura
 * «Total pactado (con propina)» y «Ya pagado (fuera del sistema)».
 */

// ─── Reembolsos (RE1) ─────────────────────────────────────────────────────────────────────────────────────────────────────

export type EstadoReembolso = 'solicitado' | 'aprobado' | 'rechazado' | 'error'
export type OrigenReembolso = 'panel' | 'cancelar_reserva' | 'mercadopago'

/** Códigos de resultado (mismo texto que el backend): 200 aprobado; 409 los cuatro siguientes; 502 los de MercadoPago. */
export type CodigoReembolso =
  | 'aprobado'
  | 'ya_reembolsado'
  | 'en_proceso'
  | 'pago_no_aprobado'
  | 'sin_mercadopago'
  | 'mp_rechazo'
  | 'mp_error'

/** El reembolso de UN pago (uno total por pago). Viene en `pagos[].reembolso` del detalle de pedido y de reserva. */
export interface ReembolsoPago {
  id: string
  estado: EstadoReembolso
  monto: number
  origen: OrigenReembolso
  creado_en: string
  actualizado_en: string
  /** Nombre del empleado que lo pidió (nunca su correo); null = MercadoPago o el sistema. */
  solicitado_por_nombre: string | null
  /** Texto corto si quedó en 'error' o 'rechazado' (sin datos personales). */
  error: string | null
}

/**
 * POST /api/admin/reembolsos  body { pago_id, motivo, confirmar: true }  (permiso `reembolsos`).
 * La MISMA forma viene en 200, 409 y 502 (y en `reembolsos[]` de cancelar con reembolso): mira `codigo` y muestra `message` tal cual.
 */
export interface ResultadoReembolso {
  ok: boolean
  codigo: CodigoReembolso
  message: string
  pago_id: string
  monto: number
  reembolso: ReembolsoPago | null
  /** Efectos (solo con `ok`): lugares liberados de experiencias, unidades de stock devueltas y el estado nuevo. */
  lugares_liberados: number
  stock_devuelto: number
  estado_pedido: string | null
  estado_pago_reserva: string | null
}

/** Avisos de dinero de un pedido (detalle de Pedidos, DR15/DR16). */
export interface AvisosPagoPedido {
  /** Más de un pago aprobado en el mismo pedido (DR16). */
  pago_doble: boolean
  pagos_aprobados: number
  /** Algún pago en contracargo o disputa (charged_back / in_mediation). */
  contracargo: boolean
  /** Algún pago con reembolso parcial hecho en MercadoPago. */
  reembolso_parcial: boolean
  /** Frases listas para mostrar (en el orden en que se muestran). Vacío = nada que avisar. */
  textos: string[]
}

/** Alerta de un pedido en la LISTA de Pedidos (null = ninguna). */
export type AlertaPedido = 'pago_doble' | 'contracargo' | null

export const TEXTO_CONFIRMAR_REEMBOLSO = (monto: string) =>
  `Se devolverá ${monto} al comprador por MercadoPago. Es dinero real y no se puede deshacer. ` +
  'Si el pago es de un pedido de experiencias, se liberan sus lugares; si es de productos, vuelve el stock.'

export const TEXTO_MARCAR_REEMBOLSADO =
  'Marcar «reembolsado» NO devuelve dinero: solo anota que ya se devolvió por fuera. Para devolver con MercadoPago usa «Reembolsar».'

export const ETIQUETA_ESTADO_REEMBOLSO: Record<EstadoReembolso, string> = {
  solicitado: 'Reembolso en proceso',
  aprobado: 'Reembolsado',
  rechazado: 'Reembolso rechazado por MercadoPago',
  error: 'Reembolso sin completar (se puede reintentar)',
}

/** ¿Se puede pulsar «Reembolsar» o «Reintentar» para este pago? (el backend vuelve a decidir; esto solo pinta el botón). */
export function puedeReembolsarPago(p: {
  mp_status?: string | null
  mp_payment_id?: string | null
  reembolso?: ReembolsoPago | null
}): boolean {
  if (!p.mp_payment_id || p.mp_status !== 'approved') return false
  if (!p.reembolso) return true
  return p.reembolso.estado === 'error' || p.reembolso.estado === 'rechazado'
}

/** REEM1: causa de la cancelación en Pedidos ('arca_tierra' = reembolso del 100 % aunque falten menos de 48 h). */
export type CausaCancelacion = 'arca_tierra' | 'cliente'

// ─── Auditoría de reservas (AU1) ──────────────────────────────────────────────────────────────────────────────────────────

/** GET /api/admin/reservas/{id}/cambios → { items, total }, del más nuevo al más viejo. */
export interface CambioReserva {
  id: number
  campo: string
  /** Etiqueta en español («Chinampa», «Total», «Guías»…). */
  etiqueta: string
  /** Ya traducidos a nombre (vendedora, guía, fuente, cocina, experiencia, cupón). null = vacío, o «solo cambió» (ver `solo_cambio`). */
  valor_anterior: string | null
  valor_nuevo: string | null
  /** true = no se muestran valores (manifest, ids técnicos, o montos sin el permiso `reportes`). */
  solo_cambio: boolean
  /** Nombre del empleado (nunca su correo); null = «Sistema». */
  usuario_nombre: string | null
  /** 'panel' | 'mercadopago' | 'reembolso' | 'sistema' */
  origen: string
  /** Mismo número = mismo guardado (varios campos a la vez). */
  lote: number
  creado_en: string
}

export interface CambiosReservaResponse {
  items: CambioReserva[]
  total: number
}

export const ETIQUETA_ORIGEN_CAMBIO: Record<string, string> = {
  panel: 'Panel',
  mercadopago: 'MercadoPago',
  reembolso: 'Reembolso',
  sistema: 'Sistema',
}

// ─── TOT1 (reservas del Sheet) ────────────────────────────────────────────────────────────────────────────────────────────

/** Campos extra del PATCH /api/admin/reservas/{id} (solo reservas del Sheet y con `reportes`; si no, 400/403). Con `version`. */
export interface CapturaTotalPatch {
  /** Total pactado CON propina (> 0). */
  monto_total_pactado?: number
  /** Lo que el cliente ya pagó fuera del sistema (0 … total). Si no se manda y la reserva dice «pagado», pagado = total. */
  monto_pagado_externo?: number
  version?: string
}
