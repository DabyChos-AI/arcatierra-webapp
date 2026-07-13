// Tipos compartidos Fase D Ola 2 — frontend admin plantillas email
// Sincronizado con backend Fase D Ola 1 (admin_plantillas_email.py, 6 endpoints CRUD + preview)
// Tabla: plantillas_email_experiencia + emails_enviados

export type PlantillaTipo =
  | 'confirmacion'
  | 'recordatorio'
  | 'cotizacion'
  | 'cancelacion'
  | 'reagendamiento'

export type PlantillaIdioma = 'es' | 'en'

export interface Plantilla {
  id: string                          // uuid
  experiencia_id: string | null       // uuid (NULL = generica)
  experiencia_nombre: string | null   // join con experiencias.nombre, solo en GET
  tipo: PlantillaTipo
  idioma: PlantillaIdioma
  asunto: string                      // max 500 chars
  cuerpo_html: string                 // sin limite, Jinja2 con {{vars}}
  cuerpo_texto: string | null
  activa: boolean
  created_at: string                  // ISO 8601
  updated_at: string
}

export interface PlantillasListResponse {
  items: Plantilla[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
}

export interface PlantillaPayload {
  experiencia_id?: string | null
  tipo: PlantillaTipo
  idioma: PlantillaIdioma
  asunto: string
  cuerpo_html: string
  cuerpo_texto?: string | null
  activa?: boolean
}

export interface PreviewResponse {
  success: boolean
  email_destino: string
  resend_id?: string | null
}

// Mock data Jinja2 para iframe preview en cliente (hardcoded — NO loguea en backend).
// Las claves deben coincidir con Apendice A del FASE-D-PLAN.md.
export const MOCK_PLANTILLA: Record<string, string> = {
  nombre_cliente: 'Cliente Demo',
  booking_id: 'AT-EXP-2026-05-001',
  fecha: 'Sábado 30 de mayo, 2026',
  hora_inicio: '09:30',
  experiencia_nombre: 'Amanecer Chinampero Privado',
  punto_encuentro: 'Embarcadero Cuemanco',
  monto_total: '15,400.00',
  monto_anticipo: '7,700.00',
  monto_balance: '7,700.00',
  addons_lista:
    '<li>Mariachi × 1 — $6,300.00 MXN</li><li>Decoración floral × 1 — $2,800.00 MXN</li>',
  propina_monto: '2,310.00',
  guias_lista: 'Sofía Santiago, Daniela Alemán',
  idioma: 'es',
}

// Variables Jinja2 disponibles para los chips clickeables del editor.
// Orden coincide con Apendice A del plan.
export const VARIABLES_JINJA: { key: string; descripcion: string }[] = [
  { key: 'nombre_cliente', descripcion: 'Nombre del cliente' },
  { key: 'booking_id', descripcion: 'ID de reserva (ej. AT-EXP-2026-05-001)' },
  { key: 'fecha', descripcion: 'Fecha localizada' },
  { key: 'hora_inicio', descripcion: 'Hora HH:MM' },
  { key: 'experiencia_nombre', descripcion: 'Nombre de la experiencia' },
  { key: 'punto_encuentro', descripcion: 'Ubicación del encuentro' },
  { key: 'monto_total', descripcion: 'Monto total con formato' },
  { key: 'monto_anticipo', descripcion: 'Monto del anticipo' },
  { key: 'monto_balance', descripcion: 'Saldo pendiente' },
  { key: 'addons_lista', descripcion: 'HTML <li> con desglose de addons (C03)' },
  { key: 'propina_monto', descripcion: 'Propina sugerida (C09)' },
  { key: 'guias_lista', descripcion: 'Guías asignados (CSV)' },
]

export const TIPO_LABELS: Record<PlantillaTipo, string> = {
  confirmacion: 'Confirmación',
  recordatorio: 'Recordatorio',
  cotizacion: 'Cotización',
  cancelacion: 'Cancelación',
  reagendamiento: 'Reagendamiento',
}

export const IDIOMA_LABELS: Record<PlantillaIdioma, string> = {
  es: 'ES',
  en: 'EN',
}

// Render Jinja2 minimal en cliente — usado solo para iframe srcDoc preview.
// NO sustituye al render real de backend (Jinja2 Python con autoescape).
export function renderMock(template: string, mock: Record<string, string>): string {
  if (!template) return ''
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key) => {
    const value = mock[key]
    return value !== undefined ? value : `{{${key}}}`
  })
}
