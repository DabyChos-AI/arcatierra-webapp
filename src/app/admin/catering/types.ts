// Tipos y configuración compartida — Bandeja de Catering (Fase F)
// Fuente de verdad del contrato API admin de catering.
// C27: NO existe catálogo de menús con precios. El menú cotizado, si acaso,
// se registra en `notas_internas` o `mensaje`. No agregar tabs/columnas de menús.

export type EstadoCatering =
  | 'sin_contactar'
  | 'cotizando'
  | 'cerrada_ganada'
  | 'cerrada_perdida'

export type OrigenCatering =
  | 'formulario_publico'
  | 'admin_manual'
  | 'email'
  | 'whatsapp'

export interface CateringItem {
  id: string
  contacto_nombre: string
  contacto_email: string | null
  contacto_tel: string | null
  empresa: string | null
  tipo_evento: string | null
  fecha_evento: string | null // "YYYY-MM-DD" | null
  numero_invitados_aprox: number | null
  ubicacion: string | null
  restricciones: string | null
  presupuesto_aprox: number | null
  mensaje: string | null
  origen: OrigenCatering
  estado: EstadoCatering
  vendedor_asignado_id: string | null
  vendedor_nombre: string | null
  notas_internas: string | null
  monto_cotizado: number | null
  motivo_perdida: string | null
  fecha_solicitud: string // ISO
  fecha_actualizacion: string // ISO
}

export interface CateringListResponse {
  items: CateringItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface CateringStats {
  sin_contactar: number
  cotizando: number
  cerradas_ganadas_mes: number
  monto_cotizado_mes: number
}

export interface Vendedor {
  id: string
  nombre: string
}

// ─── Badges por estado (colores de marca) ────────────────────
export const ESTADO_BADGE: Record<
  EstadoCatering,
  { label: string; classes: string }
> = {
  sin_contactar: {
    label: 'Sin contactar',
    classes: 'bg-[#B15543]/10 text-[#B15543] border border-[#B15543]/30',
  },
  cotizando: {
    label: 'Cotizando',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  cerrada_ganada: {
    label: 'Cerrada ganada',
    classes: 'bg-[#33503E]/10 text-[#33503E] border border-[#33503E]/30',
  },
  cerrada_perdida: {
    label: 'Cerrada perdida',
    classes: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
}

// ─── Transiciones válidas de estado (deben reflejar backend) ──
// sin_contactar → cotizando
// cotizando → cerrada_ganada | cerrada_perdida | sin_contactar
// cerrada_ganada / cerrada_perdida → terminal (sin destinos)
export const TRANSICIONES: Record<EstadoCatering, EstadoCatering[]> = {
  sin_contactar: ['cotizando'],
  cotizando: ['cerrada_ganada', 'cerrada_perdida', 'sin_contactar'],
  cerrada_ganada: [],
  cerrada_perdida: [],
}

// ─── Etiquetas legibles de origen ────────────────────────────
export const ORIGEN_LABEL: Record<OrigenCatering, string> = {
  formulario_publico: 'Formulario público',
  admin_manual: 'Manual (admin)',
  email: 'Email',
  whatsapp: 'WhatsApp',
}

// ─── Formato de fecha SOLO fecha (YYYY-MM-DD) sin corrimiento TZ ──
// new Date("YYYY-MM-DD") interpreta UTC medianoche y America/Mexico_City
// la recorre al día anterior. Construimos la fecha en hora local.
export function formatFechaEvento(fecha: string | null): string {
  if (!fecha) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha)
  if (!m) return fecha
  const [, y, mo, d] = m
  const date = new Date(Number(y), Number(mo) - 1, Number(d))
  if (Number.isNaN(date.getTime())) return fecha
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
