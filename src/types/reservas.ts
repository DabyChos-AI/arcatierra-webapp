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

// 'cortesia' (PS1, 30-sep): estado propio con total $0; sin link de pago ni anticipo.
export type ReservaEstadoPago = 'sin_pagar' | 'anticipo' | 'pagado' | 'reembolsado' | 'cortesia'

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
  /** ISO con zona: cuándo se asignó a la reserva (detalle, `guias[].asignado_en`). Auditoría (DT1-b). */
  asignado_en?: string | null
}

export interface Personal {
  id: string
  nombre: string
  apellidos?: string | null
  email?: string | null
  telefono?: string | null
  es_vendedor: boolean
  es_guia: boolean
  // PS1: guía externo (el Sheet los marca «G.E»)
  es_externo?: boolean
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
  personas_incluidas?: number
  disponible?: boolean
  capacidad_maxima: number
  ubicacion?: string
  imagen_principal?: string | null
}

/**
 * Un add-on tal como lo manda GET /api/admin/reservas/{id} (admin_reservas.py, bloque «Addons»).
 * AO1 (30-sep): el back manda el nombre en `addon_nombre`; `nombre` nunca llegó y por eso la
 * pestaña Add-ons salía sin nombres. `nombre` se conserva opcional solo para los objetos que el
 * propio front arma antes de guardar.
 */
export interface AddonReserva {
  id: string
  addon_id: string
  /** Nombre del add-on (JOIN con experiencias). NULL si el add-on ya no existe. */
  addon_nombre: string | null
  /** @deprecated el back no lo manda; usar `addon_nombre`. */
  nombre?: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  notas?: string | null
  created_at?: string | null
}

/**
 * Un correo (o intento) de una reserva: GET /api/admin/reservas/{id}/comunicaciones
 * → `{ items: Comunicacion[], total }` (admin_reservas.py, sección 19). DT1-a, 30-sep.
 */
export interface Comunicacion {
  id: string
  /** confirmacion | recordatorio | cotizacion | …; NULL en los avisos internos sin plantilla. */
  tipo: string | null
  idioma: string | null
  plantilla_id: string | null
  destinatario_email: string | null
  asunto: string | null
  resend_id: string | null
  /** 'enviado' | 'fallido' (y los que registre Resend) */
  estado: string | null
  /** Texto técnico del proveedor: truncarlo al mostrarlo. */
  error_detalle: string | null
  /** ISO con zona */
  enviado_at: string | null
  /** YYYY-MM-DD */
  enviado_fecha: string | null
}

export interface ComunicacionesResponse {
  items: Comunicacion[]
  total: number
}

export interface PagoReserva {
  id: string
  tipo_pago: TipoPago
  monto_total: number
  moneda: string
  mp_status: string
  /**
   * Fase 2: por qué quedó así. Links: 'link_generado' (pendiente), 'link_cobrado',
   * 'anulado_por_cortesia', 'anulado_por_cancelacion', 'anulado_por_pago_manual'.
   * Manual: 'manual'. MercadoPago: su status_detail ('accredited', 'pending_waiting_payment'…).
   */
  mp_status_detail?: string | null
  /** Fase 2: ISO con zona en que el link se anuló o se cerró por cobro (webhook_raw.anulado_en / cerrado_en); null si sigue abierto o no aplica. */
  cerrado_en?: string | null
  mp_payment_id?: string | null
  mp_preference_id?: string | null
  mp_payment_method?: string | null
  origen: string
  fecha_pago?: string | null
  fecha_registro: string
  init_point?: string | null
}

// ─── Fase 2 de PLAN-EXP-SIN-FALLAS (30-sep): correos y cobros ────────────────────────────
// Contrato: docs/decisiones/EXP-FASE2-CONTRATO.md (C1–C9). El back devuelve el CÓDIGO; el
// panel lo traduce con MOTIVO_NO_ENVIO_TEXTO. Ningún correo se escribe a reservas del Sheet,
// de reseller o sin correo real; sin plantilla activa no se manda nada (y no queda «fallido»).

export type MotivoNoEnvio =
  | 'origen_sheet'
  | 'reseller'
  | 'sin_correo'
  | 'correo_provisional'
  | 'sin_plantilla'
  | 'ya_enviado'
  | 'no_solicitado'
  | 'reserva_no_encontrada'
  | 'sin_guias'

export const MOTIVO_NO_ENVIO_TEXTO: Record<MotivoNoEnvio, string> = {
  origen_sheet: 'la reserva viene del Sheet de planeación (esas no reciben correos)',
  reseller: 'es de un reseller (el reseller avisa a su cliente)',
  sin_correo: 'el cliente no tiene correo registrado',
  correo_provisional: 'el correo del cliente es provisional (@arcatierra.local)',
  sin_plantilla:
    'no hay plantilla activa de ese correo en el idioma de la reserva (se activa en Plantillas Email)',
  ya_enviado: 'ya se le había mandado antes',
  no_solicitado: 'no se pidió avisar',
  reserva_no_encontrada: 'no se encontró la reserva',
  sin_guias: 'la reserva no tiene guías asignados',
}

/** Resultado de un correo que el endpoint encoló (o no) al CLIENTE. */
export interface ResultadoCorreo {
  encolado: boolean
  /** null cuando se encoló. */
  motivo: MotivoNoEnvio | null
}

/** Aviso a los guías asignados al reagendar (RG1). */
export interface ResultadoGuias {
  con_correo: number
  sin_correo: number
  encolado: boolean
  /** null cuando se encoló; 'sin_correo' = ninguno de los asignados tiene correo. */
  motivo: MotivoNoEnvio | null
}

/** «Se mandará…» / «No se mandó: <motivo>» — una frase para toasts y resultados. */
export function textoCorreo(r: ResultadoCorreo | null | undefined, destinatario = 'al cliente'): string {
  if (!r) return ''
  if (r.encolado) return `Se está mandando el correo ${destinatario}.`
  // Sin motivo = el servidor no pudo revisar la guardia (error); el correo no se encoló.
  if (!r.motivo) return `No se mandó correo ${destinatario}: no se pudo revisar si podía salir (error del servidor).`
  return `No se mandó correo ${destinatario}: ${MOTIVO_NO_ENVIO_TEXTO[r.motivo] ?? r.motivo}.`
}

/** POST /api/admin/reservas/{id}/cancelar (C5). */
export interface CancelarResponse {
  success: boolean
  estado: 'cancelada'
  reserva_id: string
  /** Links sin cobrar que se vencieron en MercadoPago y quedaron anulados. */
  links_vencidos: number
  /** preference_id de los links que MercadoPago NO venció (D4: vencerlos a mano). */
  links_sin_vencer: string[]
  /** Había un pago real pendiente (OXXO / en revisión): D15. */
  pago_en_camino: boolean
  correo_cliente: ResultadoCorreo
  /** Frases listas para mostrar (D4, D15). Vacío = nada que avisar. */
  avisos: string[]
}

/** POST /api/admin/reservas/{id}/reagendar (C6). */
export interface ReagendarResponse {
  success: boolean
  fecha_experiencia: string // YYYY-MM-DD
  hora_inicio: string // HH:MM:SS
  hora_fin: string | null // HH:MM:SS (se movió igual que el inicio) o null si no tenía
  reserva_id: string
  correo_cliente: ResultadoCorreo
  guias: ResultadoGuias
  avisos: string[]
}

/** POST /api/admin/reservas/{id}/link-pago (C7). Las llaves de antes no cambian. */
export interface LinkPagoResponse {
  success: boolean
  init_point: string | null
  sandbox_init_point?: string | null
  preference_id: string | null
  monto: number
  external_reference: string
  tipo?: string
  warning?: string
  /** ISO con zona (fin del día en México) o null = sin vencimiento. */
  vence_en?: string | null
  /** Lo que ve el cliente en MercadoPago (el `title` del renglón). */
  concepto?: string
  correo_cliente?: ResultadoCorreo
}

/** POST /api/admin/reservas/{id}/pagos (C3). Las llaves de antes no cambian. */
export interface PagoManualResponse {
  success: boolean
  pago_id: string
  monto_pagado_acumulado: number
  monto_balance: number
  estado: ReservaEstado
  estado_pago: ReservaEstadoPago
  /** Links cuyo monto quedó mayor que el saldo nuevo (D5): vencidos y anulados. */
  links_vencidos: number
  links_sin_vencer: string[]
  /** null si el pago no pasó la reserva de Tentativa a Confirmada. */
  correo_confirmacion: ResultadoCorreo | null
  avisos: string[]
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
  // PS1 (planeación semanal). De los invitados, cuántos son niños (pagan y cuentan).
  ninos: number
  // Staff: aparte de los invitados; no se cobra ni suma platos/sillas.
  staff: number
  cortesia: boolean
  codigo_promocional?: string | null
  contacto?: string | null
  fuente_id?: string | null
  fuente_nombre?: string | null
  fuente_tipo?: 'canal' | 'persona' | null
  cocina_id?: string | null
  cocina_nombre?: string | null
  // NULL = capturada en el panel; 'sheet_2026' = cargada del Google Sheet
  origen?: string | null
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

// Contrato de GET /api/admin/reservas/stats (backend lo alineo el 2026-09-25:
// antes mandaba otros nombres y la fila de tarjetas decia "undefined" y "$NaN")
export interface ReservaStats {
  tentativas: number
  // Lo que falta cobrar de las tentativas (suma de monto_balance)
  tentativas_monto_esperado: number
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
  // Personas que cubre precioBase; tambien el minimo de invitados (antes 9 fijo)
  personasIncluidas: number
  fecha: string
  horaInicio: string
  horaFin: string
  invMin: number
  invMax: number
  // PS1: de invMin, cuántos son niños; staff va aparte y no se cobra
  ninos: number
  staff: number
  // Nombre de la chinampa (catálogo /admin/catalogos/chinampas; se guarda el texto)
  chinampa: string
  fuenteId: string
  cocinaId: string
  contacto: string
  codigoPromocional: string
  // Cortesía: total $0, sin anticipo ni link de pago
  cortesia: boolean
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
  | { type: 'SET_EXPERIENCIA'; id: string; nombre: string; precioBase: number; precioAdicional: number; personasIncluidas: number; horaFinSugerida?: string }
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
  personasIncluidas: 9,
  fecha: '',
  horaInicio: '',
  horaFin: '',
  invMin: 1,
  invMax: 0,
  ninos: 0,
  staff: 0,
  chinampa: '',
  fuenteId: '',
  cocinaId: '',
  contacto: '',
  codigoPromocional: '',
  cortesia: false,
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
// IMPORTANTE: precio_base cubre 1..personasIncluidas personas (dato de cada
// experiencia, antes 9 fijo). Adicional = MAX(0, invitados - personasIncluidas).
// Propina 15% se aplica SOLO sobre subtotal_experiencia (NO sobre addons).
export function calcularCotizacion(data: WizardData) {
  const adicionales = Math.max(0, data.invMin - (data.personasIncluidas || 9))
  const subtotal_experiencia = data.precioBase + adicionales * data.precioAdicional
  const subtotal_addons = data.addons.reduce(
    (sum, a) => sum + a.cantidad * a.precio_unitario,
    0
  )
  // Cortesía (PS1): lo cobrado es $0. subtotal_experiencia y subtotal_addons se conservan
  // como valor de referencia (el backend guarda lo mismo: precio_base/monto_addons).
  const propina_monto = data.cortesia ? 0 : subtotal_experiencia * (data.propinaPct / 100)
  const total = data.cortesia ? 0 : subtotal_experiencia + subtotal_addons + propina_monto - data.descuento
  const balance = data.cortesia ? 0 : total - data.anticipo
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
