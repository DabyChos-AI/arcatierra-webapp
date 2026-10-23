// R11b · WF11 (sesión 51, 22-oct-2026). Dueño: el líder. Contrato: docs/decisiones/R11B-CONTRATO.md §4.3.
// Formularios públicos que hoy fingen enviar (/contacto, newsletter del pie y del pie de /prensa) → bandeja «Mensajes» del
// panel (permiso `mensajes`), con aviso en la campana. DR71: el newsletter guarda el correo con su consentimiento; se ve y se
// exporta desde el panel; no se manda ningún correo a nadie.

// ─── Público (sin sesión; directo a `${API_URL}`, como /restaurantes; 5/min por IP) ──────────────────────────────────
/** POST /api/contacto → 201 RespuestaFormularioPublico · 422 (detalle) · 429. `sitio` es la trampa del campo oculto. */
export interface ContactoPayload {
  nombre: string // 2..120
  email: string
  asunto: string | null // ..150
  mensaje: string // 1..5000
  acepto_privacidad: true
  /** Trampa: '' para personas (campo oculto). Si trae algo, el backend responde igual y no guarda (L1). */
  sitio: string
}

export type OrigenNewsletter = 'pie' | 'popup' | 'prensa'

/** POST /api/newsletter → 200 RespuestaFormularioPublico (la MISMA respuesta si el correo ya estaba) · 422 · 429. */
export interface NewsletterPayload {
  email: string
  acepto: true
  origen: OrigenNewsletter
  /** Trampa: '' para personas (campo oculto). Si trae algo, el backend responde igual y no guarda (L1). */
  sitio: string
}

export interface RespuestaFormularioPublico {
  success: true
  message: string
}

/** Texto del consentimiento que se guarda tal cual con cada correo (y que la casilla muestra). */
export const TEXTO_CONSENTIMIENTO_NEWSLETTER =
  'Acepto recibir correos de Arca Tierra con noticias, temporadas y experiencias. Puedo pedir mi baja cuando quiera.'

// ─── Panel (permiso `mensajes`; directo a `${API_URL}` con Bearer, como el resto del panel) ────────────────────────────
export type EstadoMensaje = 'nuevo' | 'leido' | 'respondido' | 'archivado'

export const ETIQUETA_ESTADO_MENSAJE: Record<EstadoMensaje, string> = {
  nuevo: 'Nuevo',
  leido: 'Leído',
  respondido: 'Respondido',
  archivado: 'Archivado',
}

export interface MensajeContacto {
  id: string
  nombre: string
  email: string
  asunto: string | null
  mensaje: string
  estado: EstadoMensaje
  /** ISO con zona */
  creado_en: string
  atendido_en: string | null
  /** Nombre de quien lo cambió de estado por última vez (nunca su correo). */
  atendido_por_nombre: string | null
}

/** GET /api/admin/mensajes?estado=<EstadoMensaje|''>&q=<texto>&page=1&limit=20 (más nuevos primero). */
export interface MensajesRespuesta {
  items: MensajeContacto[]
  total: number
  /** Cuántos hay en «nuevo» (para la pestaña), sin importar el filtro. */
  nuevos: number
}

/** GET /api/admin/mensajes/{id} → MensajeContacto · 404. PATCH /api/admin/mensajes/{id} {estado} → MensajeContacto. */
export interface CambiarEstadoMensaje {
  estado: EstadoMensaje
}

export type EstadoSuscriptor = 'activo' | 'baja'

export interface SuscriptorNewsletter {
  id: string
  email: string
  origen: OrigenNewsletter | 'perfil'
  estado: EstadoSuscriptor
  consentido_en: string
  baja_en: string | null
}

/** GET /api/admin/newsletter?estado=<activo|baja|''>&q=&page=1&limit=50 */
export interface NewsletterRespuesta {
  items: SuscriptorNewsletter[]
  total: number
  activos: number
}

/**
 * PATCH /api/admin/newsletter/{id} {estado} → SuscriptorNewsletter.
 * GET /api/admin/newsletter/csv → text/csv (solo activos): email, origen, consentido_en (hora de México), consentimiento.
 */
export interface CambiarEstadoSuscriptor {
  estado: EstadoSuscriptor
}
