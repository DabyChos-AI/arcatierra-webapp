// Tipos compartidos Fase C — frontend admin reservas
// Sincronizado con backend Fase B (admin_reservas.py, 17 endpoints + 1 conversion lead)
// Tabla: reservas_experiencias + reservas_experiencias_guias (pivote) + reservas_experiencias_addons

export type ReservaEstado =
  | 'tentativo'
  | 'tentativa'
  | 'confirmada'
  | 'pagada'
  | 'realizada'
  | 'cancelada'
  | 'reagendada'

export type ReservaEstadoPago = 'sin_pagar' | 'anticipo' | 'pagado' | 'reembolsado'

export type TipoCliente = 'directo' | 'reseller'

export type IdiomaCliente = 'es' | 'en'

export type TipoPago =
  | 'unico'
  | 'suscripcion'
  | 'reembolso'
  | 'anticipo'
  | 'balance'
  | 'pago_parcial'

export type MotivoReagenda =
  | 'cliente_solicito'
  | 'clima'
  | 'logistica_interna'
  | 'fuerza_mayor'
  | 'otro'

export interface Guia {
  id?: string
  personal_id?: string
  nombre: string
  apellidos?: string | null
  email?: string | null
  idiomas?: string[]
}

export interface Personal {
  id: string
  nombre: string
  apellidos?: string | null
  email?: string | null
  telefono?: string | null
  es_vendedor: boolean
  es_guia: boolean
  idiomas?: string[]
  activo: boolean
}

export interface Reseller {
  id: string
  nombre: string
  tipo: string
  contacto_nombre?: string | null
  contacto_email?: string | null
  contacto_tel?: string | null
  idioma_default?: string
  moneda_default?: string
  activo: boolean
}

export interface ExperienciaCatalogo {
  id: string
  nombre: string
  descripcion?: string
  tipo_experiencia: string
  duracion_horas: number
  precio_por_persona: number
  precio_persona_adicional?: number
  capacidad_maxima: number
  ubicacion?: string
  imagen_principal?: string | null
}

export interface AddonReserva {
  id: string
  addon_id: string
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  notas?: string | null
}

export interface PagoReserva {
  id: string
  tipo_pago: TipoPago
  monto_total: number
  moneda: string
  mp_status: string
  mp_payment_id?: string | null
  mp_preference_id?: string | null
  mp_payment_method?: string | null
  origen: string
  fecha_pago?: string | null
  fecha_registro: string
  init_point?: string | null
}

export interface ManifestInvitado {
  nombre?: string
  edad?: number | null
  idioma?: string
  alergias?: string | null
  notas?: string | null
}

export interface Cotizacion {
  precio_base: number
  subtotal_experiencia: number
  monto_addons: number
  monto_descuento: number
  motivo_descuento?: string | null
  propina_pct: number
  propina_monto: number
  monto_total: number
  monto_anticipo: number
  monto_balance: number
  monto_pagado_acumulado: number
  moneda: string
}

export interface Reserva {
  id: string
  booking_id: string
  experiencia_id: string
  experiencia_nombre?: string
  reseller_id?: string | null
  reseller_nombre?: string | null
  usuario_cliente_id?: string | null
  usuario_nombre?: string | null
  usuario_email?: string | null
  usuario_telefono?: string | null
  cliente_nombre?: string | null
  cliente_email?: string | null
  cliente_telefono?: string | null
  vendedor_id?: string | null
  vendedor_nombre?: string | null
  guia_id?: string | null
  fecha_experiencia: string
  hora_inicio: string
  hora_fin?: string | null
  chinampa_asignada?: string | null
  numero_invitados_min: number
  numero_invitados_max?: number | null
  manifest_invitados?: ManifestInvitado[]
  precio_base: number
  monto_addons: number
  monto_descuento: number
  motivo_descuento?: string | null
  monto_total: number
  monto_anticipo: number
  monto_balance: number
  monto_pagado_acumulado: number
  moneda: string
  idioma: IdiomaCliente
  notas_alergias?: string | null
  notas_internas?: string | null
  notas_cliente?: string | null
  estado: ReservaEstado
  estado_pago: ReservaEstadoPago
  flag_sap: boolean
  numero_ov_sap?: string | null
  fecha_subida_sap?: string | null
  propina_pct: number
  propina_monto: number
  fecha_creacion: string
  fecha_actualizacion: string
  guias?: Guia[]
  addons?: AddonReserva[]
  pagos?: PagoReserva[]
  cotizacion?: Cotizacion
}

export interface ReservaStats {
  tentativas: number
  tentativas_monto_anticipos: number
  confirmadas_mes: number
  delta_pct_confirmadas: number
  ingresos_mes: number
  manifest_manana_eventos: number
  manifest_manana_invitados: number
}

export interface ReservaFiltros {
  estado?: ReservaEstado | ''
  fecha_desde?: string
  fecha_hasta?: string
  vendedor_id?: string
  guia_id?: string
  reseller_id?: string
  busqueda?: string
  page?: number
  per_page?: number
}

export interface ManifestDelDia {
  fecha: string
  total_eventos: number
  total_invitados: number
  guias_unicos: number
  reservas: Reserva[]
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

export interface WizardAddon {
  id: string
  nombre: string
  cantidad: number
  precio_unitario: number
}

export interface WizardData {
  step: WizardStep
  tipoCliente: TipoCliente
  resellerId?: string
  leadId?: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  clienteIdioma: IdiomaCliente
  clienteInternacional: boolean
  experienciaId: string
  experienciaNombre?: string
  precioBase: number
  precioAdicional: number
  fecha: string
  horaInicio: string
  horaFin: string
  invMin: number
  invMax: number
  chinampa: string
  addons: WizardAddon[]
  descuento: number
  motivoDescuento: string
  propinaPct: number
  anticipo: number
  vendedorId: string
  guiasIds: string[]
  notasInternas: string
  notasAlergias: string
  notasCliente: string
  generarLinkMp: boolean
  enviarCotizacionPdf: boolean
}

export type WizardAction =
  | { type: 'RESET' }
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SET_FIELD'; field: keyof WizardData; value: WizardData[keyof WizardData] }
  | { type: 'SET_TIPO_CLIENTE'; tipo: TipoCliente }
  | { type: 'SET_EXPERIENCIA'; id: string; nombre: string; precioBase: number; precioAdicional: number; horaFinSugerida?: string }
  | { type: 'TOGGLE_ADDON'; addon: WizardAddon }
  | { type: 'UPDATE_ADDON_CANTIDAD'; addonId: string; cantidad: number }
  | { type: 'TOGGLE_GUIA'; guiaId: string }
  | { type: 'PREFILL_FROM_LEAD'; lead: { id: string; nombre: string; email?: string; telefono?: string } }

export const initialWizardData: WizardData = {
  step: 1,
  tipoCliente: 'directo',
  resellerId: undefined,
  leadId: undefined,
  clienteNombre: '',
  clienteEmail: '',
  clienteTelefono: '',
  clienteIdioma: 'es',
  clienteInternacional: false,
  experienciaId: '',
  experienciaNombre: undefined,
  precioBase: 0,
  precioAdicional: 0,
  fecha: '',
  horaInicio: '',
  horaFin: '',
  invMin: 1,
  invMax: 0,
  chinampa: '',
  addons: [],
  descuento: 0,
  motivoDescuento: '',
  propinaPct: 15,
  anticipo: 0,
  vendedorId: '',
  guiasIds: [],
  notasInternas: '',
  notasAlergias: '',
  notasCliente: '',
  generarLinkMp: true,
  enviarCotizacionPdf: true,
}

// Helper de cotizacion (C02 + C03 + C09)
// IMPORTANTE: precio_base cubre 1-9 personas. Adicional = MAX(0, invitados - 9).
// Propina 15% se aplica SOLO sobre subtotal_experiencia (NO sobre addons).
export function calcularCotizacion(data: WizardData) {
  const adicionales = Math.max(0, data.invMin - 9)
  const subtotal_experiencia = data.precioBase + adicionales * data.precioAdicional
  const subtotal_addons = data.addons.reduce(
    (sum, a) => sum + a.cantidad * a.precio_unitario,
    0
  )
  const propina_monto = subtotal_experiencia * (data.propinaPct / 100)
  const total = subtotal_experiencia + subtotal_addons + propina_monto - data.descuento
  const balance = total - data.anticipo
  return {
    adicionales,
    subtotal_experiencia,
    subtotal_addons,
    propina_monto,
    total: Math.max(0, total),
    balance: Math.max(0, balance),
  }
}

export function formatMXN(monto: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(monto)
}
