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
  // Fase 4b (sesión 40): CP1 y RS1. `monto_descuento` sigue siendo SOLO el manual; el cupón va aparte.
  cupon_id?: string | null
  cupon_codigo?: string | null
  monto_cupon?: number
  /** % de comisión del reseller guardado al crear la reserva (null = sin reseller o sin comisión). */
  comision_pct?: number | null
  fecha_creacion: string
  fecha_actualizacion: string
  guias?: Guia[]
  addons?: AddonReserva[]
  pagos?: PagoReserva[]
  // Desde la 4b, la forma real del backend (C5). `Cotizacion` queda solo por compatibilidad de nombre.
  cotizacion?: CotizacionReserva
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
  // Precio del GRUPO (cubre hasta personasIncluidas). Desde la 4b lo da el servidor (`PreciosReserva`): el del
  // catálogo o la tarifa del reseller (RS1).
  precioBase: number
  precioAdicional: number
  // Personas que cubre precioBase; tambien el minimo de invitados (antes 9 fijo)
  personasIncluidas: number
  // Fase 4b (NI1): lo que paga un niño que ocupa un lugar ADICIONAL (= precioAdicional si la experiencia no tiene regla)
  precioNinoAdicional: number
  fuentePrecio: FuentePrecio
  reglaNino: ReglaNinoPrecio | null
  /** El precio del grupo del catálogo, para mostrar «Catálogo: $X» junto a una tarifa de reseller. */
  precioCatalogo: number
  /** La comisión que el reseller tiene hoy (se guarda en la reserva al crearla). */
  comisionPct: number | null
  /** CP1: el resultado de `POST /api/admin/reservas/evaluar-cupon` para `codigoPromocional` (null = sin evaluar). */
  cuponEvaluado: CuponEvaluado | null
  /** Reservas del Sheet: el subtotal guardado NO se re-precia (null en el asistente). */
  subtotalFijo: number | null
  /** La propina GUARDADA tal cual (Sheet; add-ons): espejo de `propina_fija` del backend. null = se calcula con el %. */
  propinaFija: number | null
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
  // Fase 4b: precios que da el servidor para (experiencia, reseller) y el cupón evaluado
  | { type: 'SET_PRECIOS'; precios: PreciosReserva }
  | { type: 'SET_CUPON'; cupon: CuponEvaluado | null }

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
  precioNinoAdicional: 0,
  fuentePrecio: 'catalogo',
  reglaNino: null,
  precioCatalogo: 0,
  comisionPct: null,
  cuponEvaluado: null,
  subtotalFijo: null,
  propinaFija: null,
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

// Helper de cotizacion (C02 + C03 + C09) — ESPEJO EXACTO de `cotizar()` en `arca_tierra_api/services/precio_privada.py`
// (Fase 4b, sesión 40). Los mismos casos viven en sus doctests; si cambias uno, cambia el otro.
// - Precio de GRUPO: precioBase cubre hasta personasIncluidas; cada adicional paga precioAdicional.
// - NI1 (D16): los niños llenan PRIMERO los lugares adicionales y ahí pagan precioNinoAdicional; dentro de las
//   incluidas no cambia nada.
// - Propina sobre el subtotal de la EXPERIENCIA, antes de descuentos (NO sobre addons).
// - CP1 (D16): el cupón se SUMA al descuento manual; su base es experiencia + add-ons y nunca deja lo facturable
//   bajo cero.
// - Cortesía: lo cobrable en $0 (subtotales de referencia). Sheet (`subtotalFijo`): el subtotal guardado tal cual.
// - `propinaFija` (Sheet, add-ons): la propina guardada tal cual (en cortesía, 0).
export type CotizableData = Pick<
  WizardData,
  | 'invMin' | 'ninos' | 'precioBase' | 'precioAdicional' | 'personasIncluidas' | 'precioNinoAdicional' | 'addons'
  | 'propinaPct' | 'descuento' | 'anticipo' | 'cortesia' | 'cuponEvaluado' | 'subtotalFijo'
> & Partial<Pick<WizardData, 'propinaFija'>>

/** Centavos con redondeo comercial (como `dinero()` del backend): 1500.485 → 1500.49. */
export function redondearCentavos(n: number): number {
  return Math.round(Number((n * 100).toFixed(4))) / 100
}

/** Espejo de `cupones.calcular_descuento`: porcentaje sobre la base o fijo sin pasar de la base. */
export function descuentoDeCupon(tipo: string | null | undefined, valor: number | null | undefined, base: number): number {
  if (base <= 0 || valor == null) return 0
  if (tipo === 'porcentaje') return redondearCentavos((base * valor) / 100)
  if (tipo === 'fijo') return Math.min(redondearCentavos(valor), redondearCentavos(base))
  return 0
}

export function calcularCotizacion(data: CotizableData) {
  const incluidas = data.personasIncluidas || 9
  const adicionales = Math.max(0, data.invMin - incluidas)
  const ninos_adicionales = Math.min(Math.max(0, data.ninos || 0), adicionales)
  const adultos_adicionales = adicionales - ninos_adicionales
  const precioNino = data.precioNinoAdicional ?? data.precioAdicional
  const subtotal_experiencia =
    data.subtotalFijo != null
      ? redondearCentavos(data.subtotalFijo)
      : redondearCentavos(
          data.precioBase + adultos_adicionales * data.precioAdicional + ninos_adicionales * precioNino,
        )
  const subtotal_addons = redondearCentavos(
    data.addons.reduce((sum, a) => sum + a.cantidad * a.precio_unitario, 0),
  )
  const descuento = redondearCentavos(data.descuento || 0)
  let propina_monto = 0
  let monto_cupon = 0
  let total = 0
  if (!data.cortesia) {
    propina_monto =
      data.propinaFija != null
        ? redondearCentavos(data.propinaFija)
        : redondearCentavos((subtotal_experiencia * data.propinaPct) / 100)
    const cupon = data.cuponEvaluado
    if (cupon && cupon.aplicado && (cupon.tipo === 'porcentaje' || cupon.tipo === 'fijo')) {
      const base = subtotal_experiencia + subtotal_addons
      const tope = Math.max(0, redondearCentavos(base - descuento))
      monto_cupon = Math.min(descuentoDeCupon(cupon.tipo, cupon.valor, base), tope)
    }
    total = redondearCentavos(subtotal_experiencia + propina_monto + subtotal_addons - descuento - monto_cupon)
  }
  const balance = data.cortesia ? 0 : redondearCentavos(total - data.anticipo)
  return {
    adicionales,
    ninos_adicionales,
    adultos_adicionales,
    subtotal_experiencia,
    subtotal_addons,
    propina_monto,
    monto_cupon,
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

// ─── Fase 3 de PLAN-EXP-SIN-FALLAS (sesión 38, 30-sep-2026) · contrato EXP-FASE3-CONTRATO.md ───

/**
 * D10 (MD1): los tres rangos del Manifest del día. `desde` y `dias` son días contados desde HOY
 * de México y viajan tal cual a `GET /api/admin/reservas/manifest-del-dia?desde=&dias=`
 * (rango = hoy+desde … hoy+dias, los dos incluidos). Antes «Hoy» traía dos días y «Mañana» tres.
 */
export type ManifestRango = 'hoy' | 'manana' | 'semana'

export const MANIFEST_RANGOS: { value: ManifestRango; label: string; desde: number; dias: number }[] = [
  { value: 'hoy', label: 'Hoy', desde: 0, dias: 0 },
  { value: 'manana', label: 'Mañana', desde: 1, dias: 1 },
  { value: 'semana', label: 'Próximos 7 días', desde: 0, dias: 6 },
]

/** Respuesta completa de `manifest-del-dia` (C6). `desde`/`hasta` = el rango pedido, `YYYY-MM-DD`. */
export interface ManifestDelDiaResponse {
  items: unknown[]
  total: number
  dias: ManifestDelDia[]
  desde: string
  hasta: string
}

/**
 * B6 (D9): «Marcar como realizada» solo desde Confirmada o Pagada y con la fecha de la
 * experiencia hoy o antes (México). La regla de verdad vive en el PATCH del backend (C7);
 * esto solo decide qué pinta el botón. `hoy` = `hoyMexico()` de `@/lib/dates`.
 */
export function puedeMarcarRealizada(
  r: Pick<Reserva, 'estado' | 'fecha_experiencia'>,
  hoy: string,
): { puede: boolean; motivo: string | null } {
  if (r.estado !== 'confirmada' && r.estado !== 'pagada') {
    return { puede: false, motivo: 'Solo una reserva Confirmada o Pagada se marca como realizada.' }
  }
  if (!r.fecha_experiencia || r.fecha_experiencia.slice(0, 10) > hoy) {
    return { puede: false, motivo: 'Se puede marcar desde el día de la experiencia.' }
  }
  return { puede: true, motivo: null }
}

// ─── Fase 4b de PLAN-EXP-SIN-FALLAS (sesión 40, 1-oct-2026) · contrato EXP-FASE4B-CONTRATO.md ───

/** De dónde salió el precio del grupo: el catálogo o la tarifa negociada del reseller (RS1). */
export type FuentePrecio = 'catalogo' | 'tarifa_reseller'

/** La regla de niño de la experiencia (NI1): `valor` = % del precio ADICIONAL o monto fijo. */
export interface ReglaNinoPrecio {
  edad_maxima: number
  tipo: 'porcentaje' | 'monto'
  valor: number
}

/** `GET /api/admin/reservas/precios?experiencia_id=&reseller_id=` (C2): los precios con que el asistente cotiza. */
export interface PreciosReserva {
  experiencia_id: string
  reseller_id: string | null
  precio_grupo: number
  precio_adicional: number
  precio_nino_adicional: number
  personas_incluidas: number
  fuente_precio: FuentePrecio
  regla_nino: ReglaNinoPrecio | null
  /** El precio del grupo del CATÁLOGO (igual a precio_grupo si no hay tarifa). */
  precio_catalogo: number
  /** La comisión del reseller hoy (null sin reseller o sin comisión). */
  comision_pct: number | null
}

/** `POST /api/admin/reservas/evaluar-cupon` (C3). Un código que no es cupón NO es error: queda como referencia. */
export interface CuponEvaluado {
  codigo: string
  /** true = existe un cupón con ese código (activo o no). */
  es_cupon: boolean
  /** true = descuenta en esta reserva. */
  aplicado: boolean
  cupon_id: string | null
  tipo: 'porcentaje' | 'fijo' | 'envio_gratis' | null
  valor: number | null
  /** Lo que descuenta sobre la base enviada (antes del tope por el descuento manual). */
  descuento: number
  /** Por qué no aplica, o el texto para mostrar («No es un cupón: se guarda como referencia»). null si aplicó. */
  motivo: string | null
}

/** El objeto `cotizacion` de `GET /api/admin/reservas/{id}` desde la 4b (C5). */
export interface CotizacionReserva {
  /** = precio del grupo GUARDADO en la reserva (el del catálogo si la reserva es anterior a la 4b). */
  precio_base_experiencia: number
  precio_adicional_por_persona: number
  precio_nino_adicional: number
  invitados: number
  invitados_incluidos: number
  adicionales_cobrados: number
  ninos: number
  ninos_adicionales: number
  adultos_adicionales: number
  subtotal_experiencia: number
  subtotal_addons: number
  propina_pct: number
  propina_monto: number
  /** Solo el descuento manual. */
  monto_descuento: number
  monto_cupon: number
  cupon: { codigo: string; tipo: 'porcentaje' | 'fijo'; valor: number } | null
  /** null = reserva del Sheet o anterior a la 4b sin precios guardados. */
  fuente_precio: FuentePrecio | null
  /** false = reserva del Sheet: su subtotal nunca se re-precia. */
  se_reprecia: boolean
  monto_total: number
  monto_pagado_acumulado: number
  monto_balance: number
  comision_pct: number | null
}

/** «Cupón X aplicado: −$Y» / el motivo de por qué no. Para el asistente y el detalle. */
export function textoCupon(c: CuponEvaluado | null | undefined, montoAplicado?: number): string {
  if (!c || !c.codigo) return ''
  if (c.aplicado) return `Cupón ${c.codigo} aplicado: −${formatMXN(montoAplicado ?? c.descuento)}`
  return c.motivo || `«${c.codigo}» se guarda como referencia, sin descuento`
}
