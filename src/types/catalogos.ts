// Tipos compartidos Fase E — catalogos editables (Personal, Resellers, Add-ons, Experiencias privadas)
// Single source of truth. Sincronizado con backend Ola 1:
//   - routers/admin_personal.py    → /api/admin/personal
//   - routers/admin_resellers.py   → /api/admin/resellers
//   - routers/admin_addons.py      → /api/admin/addons
//   - routers/experiencias_admin.py → /api/experiencias/admin (dias_disponibles + horarios_disponibles)
// TS strict, sin `any`.

// ─── Personal ────────────────────────────────────────────────────────────────

export type RolPersonal = 'vendedora' | 'guia'

/** Tabs de la vista Personal. OJO: 'multirol' SIN guion (matchea query param del backend). */
export type PersonalTab = 'todos' | 'vendedoras' | 'guias' | 'multirol'

export interface Personal {
  id: string
  usuario_id: string | null
  nombre: string
  apellidos: string | null
  email: string | null
  telefono: string | null
  es_vendedor: boolean
  es_guia: boolean
  puesto: string | null
  idiomas: string[]
  notas_internas: string | null
  activo: boolean
  created_at: string
  // Solo presente en GET /{id}
  eventos_mes_actual?: {
    como_vendedor: number
    como_guia: number
  }
}

export interface PersonalKPIs {
  total: number
  vendedoras_activas: number
  guias_activos: number
  multirol: number
}

export interface PersonalListResponse {
  items: Personal[]
  total: number
  total_count: number
  page: number
  per_page: number
  total_pages: number
  kpis: PersonalKPIs
}

/** Un evento (reserva) donde la persona participa como vendedor o guia. */
export interface EventoCargaTrabajo {
  reserva_id: string
  booking_id: string
  fecha: string
  hora_inicio: string
  experiencia_nombre: string | null
  invitados: number
  estado: string
}

export interface CargaTrabajo {
  como_vendedor: EventoCargaTrabajo[]
  como_guia: EventoCargaTrabajo[]
}

// ─── Resellers ───────────────────────────────────────────────────────────────

export type ResellerTipo =
  | 'turoperador'
  | 'corporativo'
  | 'hotel'
  | 'embajada'
  | 'medios'
  | 'restaurante'
  | 'otro'

export type MonedaTarifa = 'MXN' | 'USD'

export interface TarifaNegociada {
  precio_pp: number
  moneda: MonedaTarifa
}

/** keys = UUID de experiencia privada, value = tarifa. */
export type TarifasNegociadas = Record<string, TarifaNegociada>

export interface Reseller {
  id: string
  nombre: string
  tipo: ResellerTipo
  contacto_nombre: string | null
  contacto_email: string | null
  contacto_tel: string | null
  tarifas_negociadas: TarifasNegociadas
  comision_porcentaje: number | null
  idioma_default: string
  moneda_default: string
  notas_internas: string | null
  activo: boolean
  created_at: string
  reservas_count: number
}

/** Una reserva ligada al reseller (GET /{id}). */
export interface ReservaResumenReseller {
  booking_id: string
  fecha_experiencia: string
  monto_total: number | null
  estado: string
}

export interface ResellerDetalle extends Reseller {
  reservas: ReservaResumenReseller[]
}

export interface ResellerListResponse {
  items: Reseller[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
}

export interface ResellerStats {
  total: number
  activos: number
  inactivos: number
  por_tipo: Record<string, number>
}

// ─── Add-ons ─────────────────────────────────────────────────────────────────

export interface Addon {
  id: string
  nombre: string
  descripcion: string | null
  precio_por_persona: number
  capacidad_maxima: number
  disponible: boolean
  fecha_creacion: string
}

export interface AddonListResponse {
  items: Addon[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
}

// ─── Experiencias privadas (catalogo, para el editor de tarifas) ──────────────

export interface ExperienciaPrivada {
  id: string
  nombre: string
  tipo_experiencia: string
  precio_por_persona: number
  precio_persona_adicional: number
  capacidad_maxima: number
  duracion_horas: number
  disponible: boolean
  dias_disponibles: number[]
  horarios_disponibles: string[]
}

// ─── Sentinel de capacidad "sin tope" ────────────────────────────────────────

/** Valor centinela que el backend usa para "sin tope". NUNCA renderizar literal. */
export const CAPACIDAD_SIN_TOPE = 999
