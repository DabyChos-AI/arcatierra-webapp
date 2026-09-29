// Planeación semanal de experiencias (PS1, sesión 35 · 2026-09-30).
// Contrato con el backend: routers/admin_catalogos.py y routers/admin_eventos.py (etapas 1 y 2).
// Plan: build-with-agent-team/projects/arcatierra/docs/decisiones/PS1-CONTRATO-ETAPAS-1-2.md
// Una sola fuente de verdad para el asistente, el detalle, los catálogos y las pantallas de eventos.

// ── Catálogos editables ─────────────────────────────────────────────────────
// GET/POST /api/admin/catalogos/{tipo} · PATCH/DELETE /api/admin/catalogos/{tipo}/{id}
export type TipoCatalogo = 'fuentes' | 'chinampas' | 'cocinas'
export type TipoFuente = 'canal' | 'persona'
export type TipoCocina = 'cocina' | 'chef_invitado'

export interface ItemCatalogo {
  id: string
  nombre: string
  // fuentes: 'canal' | 'persona' · cocinas: 'cocina' | 'chef_invitado' · chinampas: null
  tipo: TipoFuente | TipoCocina | null
  // solo fuentes de tipo persona que están en Personal
  personal_id: string | null
  personal_nombre: string | null
  activo: boolean
  orden: number
  // reservas + eventos + ventas de tickets que lo usan (con uso, DELETE archiva en vez de borrar)
  en_uso: number
}

export interface ListaCatalogo {
  items: ItemCatalogo[]
  total: number
}

export interface ItemCatalogoPayload {
  nombre: string
  tipo?: TipoFuente | TipoCocina
  personal_id?: string | null
  orden?: number
}

export interface ItemCatalogoPatch {
  nombre?: string
  tipo?: TipoFuente | TipoCocina
  personal_id?: string | null
  activo?: boolean
  orden?: number
}

// DELETE responde esto: sin uso se borra; con uso se archiva (activo=false)
export interface ResultadoBorrarCatalogo {
  eliminado: boolean
  archivado: boolean
  mensaje: string
}

// ── Fechas públicas y eventos internos ──────────────────────────────────────
// tipo_evento en la base: 'experiencia_publica' (fecha pública) | 'interno' (Scouting, Montaje…)
export type TipoEventoPlaneacion = 'publica' | 'interno' | 'otro'

export interface GuiaEvento {
  personal_id: string
  nombre: string
  es_externo: boolean
}

export interface EventoPlaneacion {
  id: string
  tipo: TipoEventoPlaneacion
  tipo_evento: string
  nombre_evento: string
  descripcion: string | null
  fecha_evento: string // YYYY-MM-DD
  hora_inicio: string // HH:MM:SS
  hora_fin: string | null
  experiencia_id: string | null
  experiencia_nombre: string | null
  chinampa: string | null
  cocina_id: string | null
  cocina_nombre: string | null
  idioma: 'es' | 'en' | null
  // internos: cuántas personas van (Scouting de 26, etc.)
  personas: number | null
  capacidad_maxima: number | null
  capacidad_ocupada: number
  // suma de ventas_tickets registradas a mano (por canal o «sin desglose»)
  tickets_registrados: number
  // lo que ocupó la web por su cuenta: max(0, capacidad_ocupada - tickets_registrados)
  tickets_web: number
  visible_publico: boolean
  estado: string
  notas_internas: string | null
  origen: string | null
  guias: GuiaEvento[]
}

export interface ListaEventos {
  items: EventoPlaneacion[]
  total: number
}

// POST /api/admin/eventos/internos
export interface EventoInternoPayload {
  nombre_evento: string
  descripcion?: string | null
  fecha_evento: string
  hora_inicio: string // HH:MM o HH:MM:SS
  hora_fin?: string | null
  chinampa?: string | null
  cocina_id?: string | null
  idioma?: 'es' | 'en' | null
  personas?: number | null
  notas_internas?: string | null
  guias_ids?: string[]
}

// PATCH /api/admin/eventos/{id} — en una fecha pública solo se editan
// chinampa, cocina_id, idioma, notas_internas y guias_ids (lo demás, en Experiencias)
export type EventoPlaneacionPatch = Partial<EventoInternoPayload>

// ── Tickets de fechas públicas por canal ────────────────────────────────────
// GET/POST /api/admin/eventos/{id}/tickets · PATCH/DELETE /api/admin/eventos/{id}/tickets/{venta_id}
export interface VentaTicket {
  id: string
  fuente_id: string | null // null = «sin desglose» (carga del Sheet)
  fuente_nombre: string | null
  cantidad: number
  monto: number | null
  fecha_venta: string // YYYY-MM-DD
  notas: string | null
  origen: string | null
  created_at: string
}

export interface ResumenTickets {
  tickets_registrados: number
  tickets_web: number
  capacidad_ocupada: number
  capacidad_maxima: number | null
  disponibles: number | null
}

export interface ListaTickets {
  evento: EventoPlaneacion
  items: VentaTicket[]
  resumen: ResumenTickets
}

export interface VentaTicketPayload {
  fuente_id: string
  cantidad: number
  monto?: number | null
  fecha_venta?: string // default: hoy (México)
  notas?: string | null
}

export type VentaTicketPatch = Partial<VentaTicketPayload>

// ── Planeación semanal y Junta Turismo (Ola 2 · etapa 3) ─────────────────────
// GET /api/admin/planeacion/semana?fecha=YYYY-MM-DD (permiso 'planeacion').
// La semana va de LUNES a DOMINGO (decisión de David). Sin montos, comerciales, contacto,
// fuente, estado de pago ni código: eso solo sale en el Excel completo (permiso 'reportes').
export type TipoFilaPlaneacion = 'privada' | 'publica' | 'interno'

export interface FilaJunta {
  tipo: TipoFilaPlaneacion
  id: string // reserva o evento
  folio: string | null // booking_id (solo privadas)
  horario: string // "09:00 – 13:00" o "09:00"
  evento: string // experiencia o nombre del evento interno
  invitado: string | null // nombre del cliente (privadas) · «Tickets: N» (públicas) · descripción (internos)
  privado_publico: 'Privado' | 'Público' | 'Interno'
  chinampa: string | null
  pax: number | null // privadas: invitados · públicas: tickets vendidos · internos: personas
  ninos: number
  staff: number
  idioma: string | null // 'Español' | 'Inglés'
  guias: string | null // «Dany, Zara, Tony (G.E)»
  cocina: string | null
  observaciones: string | null
}

export interface DiaPlaneacion {
  fecha: string // YYYY-MM-DD
  dia: string // 'LUNES' … 'DOMINGO'
  filas: FilaJunta[]
}

export interface SemanaPlaneacion {
  lunes: string
  domingo: string
  dias: DiaPlaneacion[] // siempre 7, de lunes a domingo
  totales: { eventos: number; pax: number; ninos: number; staff: number }
  // true si el usuario puede bajar la planeación completa (permiso 'reportes' o super_admin)
  puede_ver_completa: boolean
}
