// ============================================================================
// R11 (sesión 50, 16-oct-2026) · Pulido II: búsqueda global (K3), campana (K5) y contadores del menú (K6).
// La forma EXACTA de lo que responde la API (R11-CONTRATO.md §4.1). La escribe el líder; si te falta algo, pídeselo.
// Ninguna respuesta trae correos ni teléfonos: se puede BUSCAR por correo, pero nunca se pinta.
// ============================================================================

// ─── K3 · GET /api/admin/buscar?q=<2..60>&limite=<1..10> ────────────────────────────────────────────────────────────
/** Los grupos salen en este orden y solo los que el rol activo puede ver (super_admin, todos). */
export type TipoResultadoBusqueda = 'reserva' | 'pedido' | 'cliente' | 'lead'

export interface ResultadoBusqueda {
  /** Id de la fila (uuid como texto). */
  id: string
  /** Reserva: «AT-EXP-2026-10-001 · Nombre del cliente». Pedido: «#1234 · Nombre». Cliente y lead: el nombre. */
  titulo: string
  /** Experiencia, fecha y estado (o total del pedido). Nunca correo ni teléfono. */
  subtitulo: string | null
  /** Ruta del panel que abre el detalle: /admin/reservas?reserva_id=…, /admin/pedidos?pedido_id=…, etc. */
  url: string
}

export interface GrupoBusqueda {
  tipo: TipoResultadoBusqueda
  /** «Reservas», «Pedidos», «Clientes», «Leads». */
  etiqueta: string
  items: ResultadoBusqueda[]
}

export interface BusquedaRespuesta {
  /** La búsqueda tal como la aplicó la API (sin espacios a los lados). */
  q: string
  /** Solo grupos con permiso Y con al menos un resultado. [] = sin resultados. */
  grupos: GrupoBusqueda[]
}

/** Menos de esto no se llama a la API (la API responde 422). */
export const BUSQUEDA_MIN = 2
export const BUSQUEDA_MAX = 60
/** Espera entre teclas antes de llamar (ms). */
export const BUSQUEDA_ESPERA_MS = 250

/** Parámetro de URL con el que cada página abre el detalle de un resultado. */
export const PARAM_DETALLE: Record<TipoResultadoBusqueda, string> = {
  reserva: 'reserva_id',
  pedido: 'pedido_id',
  cliente: 'cliente_id',
  lead: 'lead_id',
}

// ─── K5 · la campana ────────────────────────────────────────────────────────────────────────────────────────────────
export type TipoNotificacion =
  | 'lead_web'
  | 'catering'
  | 'restaurante'
  | 'portal_solicitud'
  | 'compra_web_pagada'
  | 'link_pagado'
  | 'pedido_pagado'
  | 'pagado_sin_stock'
  | 'suscripcion_nueva'
  | 'suscripcion_cancelada'
  | 'reembolso'

export interface Notificacion {
  id: number
  tipo: TipoNotificacion
  /** Sin nombres, correos ni teléfonos: folio, experiencia, monto o conteo. */
  titulo: string
  detalle: string | null
  /** Ruta del panel (empieza con /admin) o null. */
  url: string | null
  /** ISO 8601 con zona. */
  creada_en: string
  /** Leída por ESTA persona. */
  leida: boolean
  /** Atendida por alguien del equipo (solo los tipos que piden acción). */
  atendida: boolean
}

/** GET /api/admin/notificaciones?limite=20&antes_de=<id> — las de los últimos 30 días, más nuevas primero. */
export interface NotificacionesRespuesta {
  items: Notificacion[]
  /** No leídas por esta persona (de las que puede ver, últimos 30 días). */
  no_leidas: number
  /** id para pedir la página siguiente (antes_de) o null si no hay más. */
  siguiente: number | null
}

/** POST /api/admin/notificaciones/leidas */
export interface MarcarLeidasRespuesta {
  marcadas: number
}

/** Tipos que piden acción: llevan «Marcar como atendida» (POST /api/admin/notificaciones/{id}/atendida → 204). */
export const TIPOS_CON_ATENCION: TipoNotificacion[] = ['portal_solicitud', 'pagado_sin_stock']

export const ETIQUETA_NOTIFICACION: Record<TipoNotificacion, string> = {
  lead_web: 'Lead de la web',
  catering: 'Solicitud de catering',
  restaurante: 'Solicitud de restaurante',
  portal_solicitud: 'Solicitud del cliente (portal)',
  compra_web_pagada: 'Compra web pagada',
  link_pagado: 'Link de pago cobrado',
  pedido_pagado: 'Pedido pagado',
  pagado_sin_stock: 'Pagado sin stock',
  suscripcion_nueva: 'Suscripción nueva',
  suscripcion_cancelada: 'Suscripción cancelada',
  reembolso: 'Reembolso',
}

/** La campana relee cada tanto (ms) y al abrirse. */
export const NOTIFICACIONES_CADA_MS = 60_000

// ─── K6 · GET /api/admin/contadores ─────────────────────────────────────────────────────────────────────────────────
/** Solo vienen las llaves que el rol activo puede ver; una llave ausente = no se pinta ese contador. */
export interface ContadoresRespuesta {
  /** Reservas tentativas (las que esperan confirmación), permiso `reservas`. */
  reservas_tentativas?: number
  /** Leads con estado «nuevo», permiso `leads`. */
  leads_nuevos?: number
  /** Las de hoy de Mi día, permiso `mi_dia` (misma cuenta que /api/admin/mi-dia/conteo). */
  mi_dia_hoy?: number
  /** Pedidos por preparar (pagados sin entregar), permiso `pedidos`. */
  pedidos_por_preparar?: number
  /** No leídas de la campana: siempre viene. */
  notificaciones_no_leidas: number
}

/** El menú relee los contadores cada tanto (ms). */
export const CONTADORES_CADA_MS = 60_000
