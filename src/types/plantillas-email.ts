// Tipos compartidos Fase D Ola 2 — frontend admin plantillas email
// Sincronizado con backend Fase D Ola 1 (admin_plantillas_email.py, 6 endpoints CRUD + preview)
// Tabla: plantillas_email_experiencia + emails_enviados

export type PlantillaTipo =
  | 'confirmacion'
  | 'recordatorio'
  | 'cotizacion'
  | 'cancelacion'
  | 'reagendamiento'
  // D14 (30-sep): correo del link de pago, editable. La base lo acepta cuando David corre el DDL
  // de docs/fases/fase2-plantillas.sql (chk_plantilla_tipo); antes, crear una da error del servidor.
  | 'link_pago'

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
  // Fase 2 (30-sep)
  hora_fin: '12:30',
  fecha_anterior: '2026-05-23',
  hora_anterior: '08:00',
  motivo_reagenda: 'Clima',
  link_pago: 'https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=DEMO',
  monto_link: '4,620.00',
  concepto_link: 'Anticipo reserva AT-EXP-2026-05-001',
  vence_link: '2026-06-06',
  // Fase 3 (N4b): la propina aparte, como recomendación (monto_total la incluye)
  total_sin_propina: '13,090.00',
  total_con_propina: '15,400.00',
  // TPL1 (R1): las 4 del cupón (Fase 4b, CP1), con los MISMOS nombres que `_construir_contexto_reserva`
  // de services/email_reservas.py. La muestra lleva un cupón fijo de $1,000 para que la vista previa
  // nunca las pinte vacías, y cuadra con los totales de arriba: experiencia + add-ons 14,090.00
  // − cupón 1,000.00 = total_sin_propina 13,090.00; + propina 2,310.00 = monto_total 15,400.00.
  monto_cupon: '1,000.00',
  codigo_cupon: 'BIENVENIDA',
  descuento_manual: '0.00',
  monto_descuento: '1,000.00',
  // R9 (G1, sesión 49): link al portal del cliente (`services/portal_reglas.portal_url`). Ejemplo, no un token real.
  portal_url: 'https://arcatierra.dabychos.com/reserva/EJEMPLO',
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
  { key: 'monto_total', descripcion: 'Monto total con formato (INCLUYE la propina sugerida)' },
  { key: 'monto_anticipo', descripcion: 'Monto del anticipo' },
  { key: 'monto_balance', descripcion: 'Saldo pendiente' },
  { key: 'addons_lista', descripcion: 'HTML <li> con desglose de addons (C03)' },
  { key: 'propina_monto', descripcion: 'Propina sugerida (opcional, no facturable)' },
  { key: 'total_sin_propina', descripcion: 'Total de la experiencia SIN propina (lo facturable)' },
  { key: 'total_con_propina', descripcion: 'Total con la propina sugerida (= monto_total)' },
  { key: 'monto_cupon', descripcion: 'Descuento del cupón con formato (0.00 si no lleva cupón)' },
  { key: 'codigo_cupon', descripcion: 'Código del cupón aplicado (vacío si no lleva cupón)' },
  { key: 'descuento_manual', descripcion: 'Descuento manual con formato (sin el cupón)' },
  { key: 'monto_descuento', descripcion: 'Descuento total = manual + cupón (lo que el cliente ve como descuento)' },
  { key: 'guias_lista', descripcion: 'Guías asignados (CSV)' },
  { key: 'hora_fin', descripcion: 'Hora de término HH:MM (vacía si la reserva no la tiene)' },
  { key: 'fecha_anterior', descripcion: 'Solo Reagendamiento: fecha antes del cambio' },
  { key: 'hora_anterior', descripcion: 'Solo Reagendamiento: hora de inicio antes del cambio' },
  { key: 'motivo_reagenda', descripcion: 'Solo Reagendamiento: motivo (Clima, A petición del cliente…)' },
  { key: 'link_pago', descripcion: 'Solo Link de pago: la dirección del link de MercadoPago' },
  { key: 'monto_link', descripcion: 'Solo Link de pago: monto del link con formato' },
  { key: 'concepto_link', descripcion: 'Solo Link de pago: concepto que ve el cliente' },
  { key: 'vence_link', descripcion: 'Solo Link de pago: último día para pagar (vacío = sin vencimiento)' },
  {
    key: 'portal_url',
    descripcion:
      'Link a la página de la reserva del cliente (fecha, punto de encuentro, QR, pedir cambio). Si no lo pones, Confirmación, Recordatorio, Link de pago y Reagendamiento agregan al final el botón «Ver mi reserva»',
  },
]

// R9-a (David, 3-oct ≈01:09 UTC): el botón «Ver mi reserva» lo agrega el CÓDIGO al final de estos correos cuando la
// plantilla no usa {{portal_url}} (espejo de `services/portal_reglas.insertar_boton_portal`; no se edita ninguna
// plantilla). Para que la vista previa del panel muestre lo mismo que recibe el cliente.
export const TIPOS_CON_BOTON_PORTAL: PlantillaTipo[] = ['confirmacion', 'recordatorio', 'link_pago', 'reagendamiento']

const TEXTO_BOTON_PORTAL: Record<PlantillaIdioma, { boton: string; ayuda: string }> = {
  es: {
    boton: 'Ver mi reserva',
    ayuda: 'En tu página de reserva ves la fecha, la hora, el punto de encuentro y el código QR, y puedes pedir un cambio.',
  },
  en: {
    boton: 'View my booking',
    ayuda: 'Your booking page shows the date, time, meeting point and QR code, and lets you request a change.',
  },
}

/** Agrega el botón del portal a un HTML YA armado (con `renderMock`) si es de un tipo con botón y no trae la URL. */
export function insertarBotonPortalMock(
  html: string,
  tipo: PlantillaTipo,
  idioma: PlantillaIdioma,
  url: string = MOCK_PLANTILLA.portal_url,
): string {
  if (!html || !TIPOS_CON_BOTON_PORTAL.includes(tipo) || html.includes(url)) return html
  const t = TEXTO_BOTON_PORTAL[idioma] ?? TEXTO_BOTON_PORTAL.es
  const boton =
    '<div data-portal-boton="1" style="margin:28px 0;text-align:center;font-family:Arial,Helvetica,sans-serif">' +
    `<a href="${url}" style="display:inline-block;background:#B15543;color:#ffffff;text-decoration:none;` +
    `padding:12px 24px;border-radius:6px;font-weight:bold">${t.boton}</a>` +
    `<p style="margin:10px 0 0;color:#555555;font-size:13px">${t.ayuda}</p></div>`
  const i = html.toLowerCase().lastIndexOf('</body')
  return i === -1 ? html + boton : html.slice(0, i) + boton + html.slice(i)
}

export const TIPO_LABELS: Record<PlantillaTipo, string> = {
  confirmacion: 'Confirmación',
  recordatorio: 'Recordatorio',
  cotizacion: 'Cotización',
  cancelacion: 'Cancelación',
  reagendamiento: 'Reagendamiento',
  link_pago: 'Link de pago',
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
