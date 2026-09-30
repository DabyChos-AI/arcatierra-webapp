// Fechas de una experiencia vistas desde Exp. Públicas / Exp. Privadas › Eventos
// (ExperienciasAdminPage). Fase 3 de PLAN-EXP-SIN-FALLAS (sesión 38): EV3 + NV1.
// Contrato: docs/decisiones/EXP-FASE3-CONTRATO.md §C1. Backend: routers/experiencias_admin.py.

/** Una fila de `GET /api/experiencias/admin/{id}/eventos` (`eventos[]`) y del PATCH (C1). */
export interface EventoExperiencia {
  id: string
  nombre_evento: string
  descripcion: string | null
  fecha_evento: string // YYYY-MM-DD
  hora_inicio: string | null // HH:MM:SS
  hora_fin: string | null
  ubicacion: string | null
  /** null = sin cupo definido; 999 (CAPACIDAD_SIN_TOPE) = sin tope. `sinTope()` trata los dos. */
  capacidad_maxima: number | null
  capacidad_ocupada: number
  lugares_disponibles: number | null
  precio_base: number | null
  estado: 'activo' | 'inactivo' | 'cancelado' | string
  notas_internas: string | null
  requiere_reserva: boolean
  visible_publico: boolean
  fecha_creacion: string | null
}

/**
 * Cuerpo de `PATCH /api/experiencias/admin/eventos/{id}` (proxy del front:
 * `/api/experiencias-admin/eventos/{id}`). Solo se mandan las llaves que cambian.
 * - `capacidad_maxima`: vacío en el formulario = sin tope = CAPACIDAD_SIN_TOPE (999); nunca 0.
 * - `precio_base`: null = usa el precio de la experiencia.
 * - `hora_fin`: si cambia `hora_inicio` y no mandas `hora_fin`, el back la mueve igual (misma duración).
 * - `motivo` + `confirmar_con_vendidos`: mover día u hora de una fecha con lugares vendidos (D7).
 */
export interface EditarFechaPayload {
  fecha_evento?: string
  hora_inicio?: string // HH:MM
  hora_fin?: string | null
  capacidad_maxima?: number | null
  precio_base?: number | null
  visible_publico?: boolean
  notas_internas?: string | null
  motivo?: string | null
  confirmar_con_vendidos?: boolean
}

export interface EditarFechaResponse {
  success: true
  evento: EventoExperiencia
  /** Textos para mostrar tal cual (aviso de publicar sin compra en línea, fecha movida con vendidos). */
  avisos: string[]
}

/** `detail` del 409 cuando se mueve día u hora de una fecha con lugares vendidos sin confirmar (D7). */
export interface RequiereConfirmacionDetalle {
  code: 'requiere_confirmacion'
  vendidos: number
  mensaje: string
}

export function esRequiereConfirmacion(detail: unknown): detail is RequiereConfirmacionDetalle {
  return (
    typeof detail === 'object' &&
    detail !== null &&
    (detail as { code?: unknown }).code === 'requiere_confirmacion'
  )
}
