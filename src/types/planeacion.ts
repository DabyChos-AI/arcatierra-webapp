// Planeación semanal de experiencias (PS1, sesión 35 · 2026-09-29).
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
  // R4: VERSIÓN del evento; se manda tal cual en `version` en el PATCH (409 si alguien lo cambió)
  fecha_actualizacion?: string | null
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
// R4: `version` = fecha_actualizacion que se leyó (opcional; si no coincide → 409 ConflictoVersion)
export type EventoPlaneacionPatch = Partial<EventoInternoPayload> & { version?: string | null }

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
  // R4 (TENT1): reserva privada con estado 'tentativo'
  tentativa: boolean
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

// ── R4 · Grilla semanal editable (sesión 44 · 2026-10-01) ────────────────────
// Contrato: build-with-agent-team/projects/arcatierra/docs/decisiones/R4-CONTRATO.md
// API: services/planeacion_reglas.py (huecos y versión) · GET /api/admin/planeacion/grilla?fecha=YYYY-MM-DD
// DR14 (David): edita quien tiene `reservas`; guías y cocina solo ven; los montos se VEN solo con `reportes`
// y se editan en el detalle de la reserva; las 57 «pagadas en $0» del Sheet = hueco calculado `pagada_sin_monto`.

// Huecos de una reserva privada (HUE1). El orden de HUECOS es el orden en que se muestran.
export type CodigoHueco =
  | 'sin_total'
  | 'pagada_sin_monto'
  | 'anticipo_sin_monto'
  | 'sin_chinampa'
  | 'sin_fuente'
  | 'sin_guia'

export const HUECOS: ReadonlyArray<{ codigo: CodigoHueco; etiqueta: string }> = [
  { codigo: 'sin_total', etiqueta: 'Sin total' },
  { codigo: 'pagada_sin_monto', etiqueta: 'Pagada sin monto' },
  { codigo: 'anticipo_sin_monto', etiqueta: 'Anticipo sin monto' },
  { codigo: 'sin_chinampa', etiqueta: 'Sin chinampa' },
  { codigo: 'sin_fuente', etiqueta: 'Sin fuente' },
  { codigo: 'sin_guia', etiqueta: 'Sin guía' },
]

// Para `?hueco=` en GET /api/admin/reservas: uno o varios códigos (OR) o 'cualquiera'.
export type FiltroHueco = CodigoHueco | 'cualquiera'

export function etiquetaHueco(codigo: string): string {
  return HUECOS.find((h) => h.codigo === codigo)?.etiqueta ?? codigo
}

// Montos de una reserva privada: SOLO llegan con `reportes` (si no, `montos` es null).
export interface MontosGrilla {
  estado_pago: string // 'sin_pagar' | 'anticipo' | 'pagado' | 'cortesia' | 'reembolsado'
  total: number
  pagado: number
  anticipo: number
}

export interface ItemGrilla {
  tipo: TipoFilaPlaneacion // 'privada' | 'publica' | 'interno'
  id: string // reserva (privada) o evento (pública/interno)
  // fecha_actualizacion ISO: se devuelve TAL CUAL en `version` al editar. null si el usuario no edita.
  version: string | null
  fecha: string // YYYY-MM-DD
  hora_inicio: string | null // 'HH:MM'
  hora_fin: string | null // 'HH:MM'
  titulo: string // experiencia (privada/pública) o nombre del evento interno
  experiencia_id: string | null
  folio: string | null // booking_id, solo privadas
  invitado: string | null // misma regla que FilaJunta.invitado
  pax: number // privadas: invitados · públicas: tickets vendidos · internos: personas
  ninos: number
  staff: number
  idioma: 'es' | 'en' | null
  tentativa: boolean // TENT1: reserva con estado 'tentativo' (solo privadas)
  estado: string // estado crudo de la reserva o del evento
  chinampa: string | null // NOMBRE (texto libre en la base, se elige del catálogo)
  cocina_id: string | null
  cocina_nombre: string | null
  fuente_id: string | null // solo privadas Y solo si puede_editar; si no, null
  fuente_nombre: string | null // ídem
  guias: GuiaEvento[]
  observaciones: string // texto de la Junta (sin contacto ni bitácora): lo ven todos
  notas_internas: string | null // CRUDO, solo si puede_editar (lo que se edita); si no, null
  huecos: CodigoHueco[] // solo privadas y solo si puede_editar; si no, []
  montos: MontosGrilla | null // solo privadas y solo si puede_ver_montos
}

export interface DiaGrilla {
  fecha: string // YYYY-MM-DD
  dia: string // 'LUNES' … 'DOMINGO'
  items: ItemGrilla[] // por hora de inicio
}

export interface SemanaGrilla {
  lunes: string
  domingo: string
  dias: DiaGrilla[] // siempre 7, de lunes a domingo
  totales: { eventos: number; pax: number; ninos: number; staff: number; con_huecos: number }
  puede_editar: boolean // permiso `reservas` (o super_admin)
  puede_ver_montos: boolean // permiso `reportes` (o super_admin)
  puede_ver_completa: boolean // igual que SemanaPlaneacion: botón del Excel completo
}

// 409 de cualquier PATCH con `version` vieja (reservas, guías de reserva, eventos). No se escribió nada.
export interface ConflictoVersion {
  detail: string
  codigo: 'version_vieja'
  version_actual: string | null
}

export function esConflictoVersion(status: number, cuerpo: unknown): cuerpo is ConflictoVersion {
  return (
    status === 409 &&
    typeof cuerpo === 'object' &&
    cuerpo !== null &&
    (cuerpo as { codigo?: unknown }).codigo === 'version_vieja'
  )
}
