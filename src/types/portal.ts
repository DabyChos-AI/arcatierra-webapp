// Portal del cliente (G1, R9, sesión 49, 3-oct-2026). Dueño: el líder.
// Forma exacta de routers/portal_reserva.py (público, prefijo /api/portal) y de routers/usuario_reservas.py
// (/api/usuario/mis-reservas, con sesión). Contrato: R9-CONTRATO.md §4. Reglas y textos del backend:
// arca_tierra_api/services/portal_reglas.py (sin I/O, del líder).
//
// DR23 (David, 3-oct ≈01:02 UTC): el cliente ve su reserva (o su compra web), descarga el QR y pide cambio o
// cancelación (le llega al equipo por correo). El QR codifica la URL de Mi día del PANEL (pide sesión de empleado):
// el guía lo escanea con la cámara y llega a la reserva con «Llegaron». Las compras web no llevan QR.
// R9-c: total, pagado, saldo y «Pagar saldo» con el link VIGENTE (nunca uno nuevo); sin montos en reseller ni Sheet.

/** `reserva` = reservas_experiencias (privadas y del panel) · `compra` = pedido de la web con fechas públicas. */
export type TipoPortal = 'reserva' | 'compra'

export interface PortalExperiencia {
  nombre: string
  /** YYYY-MM-DD (México). La pantalla la pinta larga con `formatFechaMexico`. */
  fecha: string
  /** HH:MM (sin segundos); null si la reserva no tiene hora. */
  hora_inicio: string | null
  hora_fin: string | null
  /** Personas (los niños van incluidos). En una compra web, los lugares de esa fecha. */
  personas: number
  ninos: number
  /** 'es' | 'en' | null */
  idioma: string | null
  /** `COALESCE(fecha.ubicacion, experiencia.ubicacion)`; lo capturan las encargadas en Catálogos › Experiencias. */
  punto_encuentro: string | null
  /** Liga de Google Maps si la experiencia tiene coordenadas; si no, null (no se inventa). */
  mapa_url: string | null
  incluye: string[]
  informacion_importante: string[]
  requisitos: string[]
}

export interface PortalLinkPago {
  /** init_point de MercadoPago (link VIGENTE más reciente: pendiente y no vencido). */
  url: string
  monto: number
  /** ISO con zona, o null si no vence. */
  vence_en: string | null
}

export interface PortalPago {
  moneda: string
  total: number
  pagado: number
  saldo: number
  /** sin_pagar | anticipo | pagado | reembolsado | cortesia (en una compra: pagado | reembolsado) */
  estado_pago: string
  estado_pago_texto: string
  link_pago: PortalLinkPago | null
}

/** GET /api/portal/{token} → 200. Nada interno: sin contacto, correos, teléfonos, notas, guía, chinampa ni reseller. */
export interface PortalResponse {
  tipo: TipoPortal
  /** booking_id (AT-EXP-…) o numero_pedido (AT-AAAAMMDD-XXXX). */
  folio: string
  /** Solo el primer nombre, para saludar («Hola, Ana»); null si no hay. */
  nombre: string | null
  /** Valor crudo (tentativo, confirmada, pagada, realizada, cancelada, reagendada · pagado, entregado, reembolsado, cancelado). */
  estado: string
  /** Texto para el cliente («Por confirmar», «Confirmada», «Pagada», «Cancelada», «Reembolsada»…). */
  estado_texto: string
  /** Una en una reserva; una o varias en una compra web. Ordenadas por fecha y hora. */
  experiencias: PortalExperiencia[]
  /** null en reservas de reseller y del Sheet (R9-c). */
  pago: PortalPago | null
  /** Solo reservas confirmadas o pagadas desde hoy (DR23). La pantalla dibuja el QR de `url` con el npm `qrcode`. */
  qr: { url: string } | null
  /** Mostrar el formulario «Pedir cambio o cancelación». */
  puede_solicitar: boolean
  /** Compra web: la política de reembolso (`compra_reglas.TEXTO_POLITICA_REEMBOLSO`); null en una reserva. */
  politica: string | null
}

/** Errores del GET: el `detail` viene listo para el cliente. */
export const PORTAL_HTTP = {
  /** token inválido, reserva o compra que no existe, o compra que nunca se cobró */
  invalido: 404,
  /** más de 30 días después de la última fecha */
  vencido: 410,
  /** límite de intentos (30/min por IP) */
  demasiados: 429,
  /** el servidor no tiene el secreto del portal */
  sinServicio: 503,
} as const

export type TipoSolicitudPortal = 'cambio' | 'cancelacion'

export const TIPOS_SOLICITUD_PORTAL: { valor: TipoSolicitudPortal; texto: string }[] = [
  { valor: 'cambio', texto: 'Cambio de fecha u hora' },
  { valor: 'cancelacion', texto: 'Cancelación' },
]

export const MENSAJE_SOLICITUD_MAX = 1000

/** POST /api/portal/{token}/solicitud (extra="forbid"). `fecha_preferida` solo con `cambio` (YYYY-MM-DD, desde hoy). */
export interface SolicitudPortalBody {
  tipo: TipoSolicitudPortal
  /** 1 a 1000 caracteres (se recorta). */
  mensaje: string
  fecha_preferida?: string | null
}

/**
 * 200 → `{ recibida: true, mensaje }` (el texto para mostrar).
 * 400 → `detail` (ya no admite cambios: cancelada, realizada o fecha pasada) · 422 (validación) ·
 * 429 → `detail` (más de 3 en 24 h por reserva, o 5/min por IP) · 503 → `detail` (el correo al equipo falló: no se
 * registró nada; que lo intente otra vez o escriba).
 */
export interface SolicitudPortalRespuesta {
  recibida: true
  mensaje: string
}

/** GET /api/usuario/mis-reservas (sesión del cliente) → sus reservas y compras web, cada una con su link. */
export interface MiReservaItem {
  tipo: TipoPortal
  folio: string
  /** Nombre de la experiencia; en una compra con varias fechas, «N experiencias». */
  titulo: string
  /** YYYY-MM-DD de la próxima fecha (o la última, si ya pasaron todas). */
  fecha: string | null
  hora_inicio: string | null
  estado_texto: string
  /** URL completa del portal (`<FRONTEND_URL>/reserva/<token>`); null si el servidor no tiene el secreto. */
  portal_url: string | null
  /** true si la fecha ya pasó (la lista las pone al final). */
  pasada: boolean
}

export interface MisReservasResponse {
  items: MiReservaItem[]
}
