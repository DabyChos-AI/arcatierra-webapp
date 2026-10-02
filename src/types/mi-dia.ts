// Mi día del guía (K4, R8, sesión 48, 2-oct-2026). Dueño: el líder.
// Forma exacta de routers/admin_mi_dia.py (prefijo /api/admin/mi-dia, permiso `mi_dia`). Contrato: R8-CONTRATO.md §4.
// DR22 (David, 2-oct 20:22 UTC): el guía ve SUS experiencias de hoy (y mañana) con personas, niños, idioma y alergias de cada
// invitado, SIN teléfono ni correo del cliente, y un check «Llegaron». Cocina y encargadas (no guías) ven todas las del día.

export type DiaMiDia = 'hoy' | 'manana'

/**
 * - `guia`: la cuenta está ligada (personal.usuario_id) a una ficha de guía: solo sus reservas (tabla pivote de guías).
 * - `todas`: la cuenta no es de guía (cocina, encargadas, admin): todas las reservas del día.
 * - `sin_ficha`: la cuenta tiene el rol «guía» pero aún no está ligada a su ficha de Personal: lista vacía y el aviso de ligarla.
 */
export type ModoMiDia = 'guia' | 'todas' | 'sin_ficha'

/** Un invitado del manifest, SIN contacto (solo lo que el guía necesita). */
export interface InvitadoMiDia {
  nombre: string | null
  edad: number | null
  idioma: string | null
  alergias: string | null
}

export interface GuiaMiDia {
  personal_id: string
  nombre: string
}

export interface LlegadaReserva {
  /** ISO con zona (timestamptz). La pantalla la muestra en hora de México. */
  llegada_en: string
  /** Nombre de quien la marcó (nunca el correo); null si la cuenta ya no existe. */
  registrada_por_nombre: string | null
  personas_llegaron: number | null
}

export interface ReservaMiDia {
  reserva_id: string
  booking_id: string
  /** HH:MM:SS */
  hora_inicio: string
  hora_fin: string | null
  experiencia_nombre: string
  chinampa: string | null
  /** 'es' | 'en' */
  idioma: string | null
  /** Personas de la reserva (los invitados; los niños van incluidos). */
  personas: number
  ninos: number
  /** Nombre del cliente (sin contacto) o del reseller, para saludar al grupo. */
  grupo_nombre: string | null
  /** Notas de alergias de la reserva (texto libre, sin correos ni teléfonos). */
  notas_alergias: string | null
  invitados: InvitadoMiDia[]
  guias: GuiaMiDia[]
  estado: 'confirmada' | 'pagada' | 'realizada'
  llegada: LlegadaReserva | null
  /** El servidor decide: es HOY y quien pregunta es guía de la reserva o tiene el permiso `reservas`. */
  puede_marcar_llegada: boolean
}

export interface MiDiaResponse {
  dia: DiaMiDia
  /** YYYY-MM-DD (México) */
  fecha: string
  modo: ModoMiDia
  /** Nombre del guía cuando modo = 'guia'. */
  guia_nombre: string | null
  items: ReservaMiDia[]
  total_personas: number
  total_ninos: number
}

/** GET /api/admin/mi-dia/conteo → badge del menú (reservas de HOY en el modo de quien pregunta; sin_ficha = 0). */
export interface MiDiaConteo {
  count: number
}

/** Body de POST /api/admin/mi-dia/{reserva_id}/llegada (extra="forbid"). */
export interface MarcarLlegadaPayload {
  personas_llegaron?: number | null
}

/** Respuesta de POST y DELETE …/llegada. */
export interface LlegadaResponse {
  reserva_id: string
  llegada: LlegadaReserva | null
}

/** Hora de México «10:42» de un ISO con zona. */
export function horaMexico(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Mexico_City' })
}
