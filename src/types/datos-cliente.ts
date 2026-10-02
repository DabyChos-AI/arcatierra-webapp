/**
 * R6 · Datos del cliente (sesión 46, 2-oct-2026). Archivo del LÍDER: espejo de
 * `arca_tierra_api/services/datos_cliente_reglas.py`. Úsalo, no lo copies; si te falta algo, pídelo.
 *
 * Decisiones de David (2-oct): DR17 — el correo es obligatorio en el asistente «Nueva reserva» salvo reseller (y Sheet,
 * que no pasa por el asistente). DR18 — se quitan Facebook e Instagram del registro. DR19 — no se entrega en los feriados
 * LFT ni en los días que agreguen las encargadas de Experiencias; la canasta de suscripción se corre al siguiente día
 * hábil. CINT1 — se quita la casilla «Cliente internacional». M10-a — los pedidos de la tienda ya agendados en un día que
 * se marca sin entrega NO se mueven: la pantalla los lista. M10-b — editar días sin entrega pide `dias_sin_entrega`
 * (solo admin); quien tiene `entregas` los ve.
 */

// ─── EML1 · correo obligatorio (DR17) ────────────────────────────────────────────────────────────────────────────────

export const TEXTO_FALTA_CORREO = 'Escribe el correo del cliente: sin él no le llega la confirmación ni el recordatorio.'
export const TEXTO_CORREO_INVALIDO = 'Ese correo no parece válido. Revísalo (ejemplo: nombre@dominio.com).'
export const TEXTO_CORREO_PROVISIONAL = 'Escribe el correo real del cliente (los @arcatierra.local no reciben nada).'

const RE_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function normalizarCorreo(correo: string | null | undefined): string {
  return (correo ?? '').trim().toLowerCase()
}

/** Forma mínima algo@algo.algo, sin espacios. Espejo de `correo_valido`. */
export function correoValido(correo: string | null | undefined): boolean {
  return RE_CORREO.test(normalizarCorreo(correo))
}

/**
 * El texto que el backend daría en el 400 de `crear_reserva` (venta directa), o null si el correo sirve. Espejo de
 * `motivo_correo_rechazado`: vacío → forma → provisional (`@arcatierra.local` solo para nombres «QA-»).
 */
export function motivoCorreoRechazado(correo: string | null | undefined, nombreCliente: string | null | undefined): string | null {
  const c = normalizarCorreo(correo)
  if (!c) return TEXTO_FALTA_CORREO
  if (!correoValido(c)) return TEXTO_CORREO_INVALIDO
  if (c.endsWith('@arcatierra.local') && !(nombreCliente ?? '').trim().startsWith('QA-')) return TEXTO_CORREO_PROVISIONAL
  return null
}

// ─── A12 · dirección estructurada en el checkout ─────────────────────────────────────────────────────────────────────

export const TEXTO_DIRECCION_INCOMPLETA = 'Completa la dirección: calle, número exterior, colonia y código postal.'
/** El 400 de crear-preferencia con un `direccion_id` ajeno o desactivado (texto que ya daba payments.py). */
export const TEXTO_DIRECCION_NO_ES_TUYA = 'La dirección seleccionada no existe o no es tuya'

export function textoCpSinCobertura(cp: string): string {
  return `No entregamos en el código postal ${cp}. Elige otra dirección o recoge en bodega.`
}

/** Una dirección guardada del cliente: `GET /api/direcciones` (proxy Next → `DireccionResponse` del backend). */
export interface DireccionGuardada {
  id: string
  nombre_direccion: string
  calle: string
  numero_exterior: string
  numero_interior: string | null
  colonia: string
  alcaldia: string | null
  codigo_postal: string
  ciudad: string
  estado: string
  referencias: string | null
  dia_preferido_entrega: string | null
  alergias_restricciones: string | null
  es_principal: boolean
  activa: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

/**
 * La dirección NUEVA que el checkout manda en `crear-preferencia-pago` como `direccion` (invitado o «Usar otra
 * dirección»). El backend la guarda en las direcciones del cliente (o reutiliza una idéntica) y enlaza el pedido.
 * Colonia y alcaldía salen de la zona elegida en el PostalCodeSelector (`zona.colonia`, `zona.municipio`).
 */
export interface DireccionNuevaPedido {
  nombre_direccion?: string | null
  calle: string
  numero_exterior: string
  numero_interior?: string | null
  colonia: string
  alcaldia?: string | null
  codigo_postal: string
  referencias?: string | null
}

/** null si está completa; si no, el texto para el formulario (mismo criterio que el 400 del backend). */
export function faltaEnDireccion(d: Partial<DireccionNuevaPedido> | null | undefined): string | null {
  if (!d) return TEXTO_DIRECCION_INCOMPLETA
  const cp = (d.codigo_postal ?? '').replace(/\D/g, '')
  if (!(d.calle ?? '').trim() || !(d.numero_exterior ?? '').trim() || !(d.colonia ?? '').trim() || cp.length < 4 || cp.length > 5) {
    return TEXTO_DIRECCION_INCOMPLETA
  }
  return null
}

/** El MISMO texto que guarda el backend en `pedidos.direccion_entrega` (`texto_direccion`). */
export function textoDireccion(d: {
  calle: string
  numero_exterior: string
  numero_interior?: string | null
  colonia: string
  codigo_postal: string
  ciudad?: string | null
}): string {
  const interior = (d.numero_interior ?? '').trim() ? ` int ${d.numero_interior}` : ''
  return `${d.calle.trim()} ${d.numero_exterior.trim()}${interior}, ${d.colonia.trim()}, CP ${d.codigo_postal}, ${d.ciudad || 'Ciudad de México'}`
}

// ─── M10 · días sin entrega (DR19, M10-a, M10-b) ─────────────────────────────────────────────────────────────────────

/** `GET /api/entregas/dias-no-habiles?desde&hasta` (público; solo los ACTIVOS, sin sábados ni domingos). */
export interface DiaNoHabil {
  fecha: string // YYYY-MM-DD
  motivo: string
}

export interface RespuestaDiasNoHabiles {
  desde: string
  hasta: string
  /** Hasta cuántos días adelante deja agendar la tienda (DIAS_MAXIMO_AGENDA del backend, hoy 60). */
  maximo_dias: number
  dias: DiaNoHabil[]
}

export type OrigenDiaNoHabil = 'lft' | 'panel'

/** Una fila del panel (`GET /api/admin/dias-no-habiles`), incluidos los inactivos. */
export interface DiaNoHabilAdmin extends DiaNoHabil {
  origen: OrigenDiaNoHabil
  activo: boolean
  /** 'lunes' … 'domingo' (lo calcula el backend). */
  dia_semana: string
  /** Nombre y apellidos de quien lo editó por última vez (nunca el correo); null en los LFT sin editar. */
  actualizado_por: string | null
  actualizado_en: string | null
}

export interface ListaDiasNoHabilesAdmin {
  dias: DiaNoHabilAdmin[]
  /** Tiene `dias_sin_entrega` (o es super_admin). false = solo ver; el backend responde 403 de todos modos. */
  puede_editar: boolean
}

/** Un pedido de la tienda con entrega ese día (M10-a: NO se mueve; el equipo le avisa al cliente). */
export interface PedidoEnDiaSinEntrega {
  id: string
  numero_pedido: string
  estado: string
  tipo_entrega: string
  /** Nombre del cliente para avisarle (panel interno). */
  cliente: string | null
}

/** Respuesta de POST y PATCH de `/api/admin/dias-no-habiles`. */
export interface ResultadoDiaNoHabil {
  dia: DiaNoHabilAdmin
  /** Canastas de suscripción programadas que se corrieron al siguiente día hábil (se acaba de marcar sin entrega). */
  entregas_corridas: number
  /** Canastas que regresaron a su fecha de la serie (se acaba de desactivar o borrar el día sin entrega). */
  entregas_regresadas: number
  /** Pedidos de la tienda (no cancelados ni reembolsados) con fecha_entrega ese día. */
  pedidos_ese_dia: PedidoEnDiaSinEntrega[]
}

/** El aviso que muestra la pantalla después de guardar. */
export function textoResultadoDia(r: ResultadoDiaNoHabil): string {
  const partes: string[] = []
  if (r.entregas_corridas > 0) {
    partes.push(`${r.entregas_corridas} ${r.entregas_corridas === 1 ? 'canasta de suscripción se corrió' : 'canastas de suscripción se corrieron'} al siguiente día hábil.`)
  }
  if (r.entregas_regresadas > 0) {
    partes.push(`${r.entregas_regresadas} ${r.entregas_regresadas === 1 ? 'canasta regresó' : 'canastas regresaron'} a su día.`)
  }
  if (r.pedidos_ese_dia.length > 0) {
    partes.push(`Hay ${r.pedidos_ese_dia.length} ${r.pedidos_ese_dia.length === 1 ? 'pedido de la tienda' : 'pedidos de la tienda'} con entrega ese día: no se movieron, avísales a los clientes.`)
  }
  return partes.length ? partes.join(' ') : 'Guardado. No había entregas ese día.'
}
