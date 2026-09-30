/**
 * Compra en línea de fechas públicas (WEB1) y regla de niño (NI1) — Fase 4 de PLAN-EXP-SIN-FALLAS (sesión 39).
 * Contrato: build-with-agent-team/projects/arcatierra/docs/decisiones/EXP-FASE4-CONTRATO.md (§C y §F).
 *
 * Lo escribe el LÍDER («archivo de todos»): úsalo, no redefinas estos tipos en los componentes. Si te falta algo,
 * pídeselo al líder. Las reglas de negocio de verdad viven en el backend (`services/compra_reglas.py`); aquí solo
 * lo que la pantalla necesita para mostrar y armar los payloads.
 */

// ─── Reglas de David (D13, plan §3.1) — mismas cifras que services/compra_reglas.py ─────────────────────────
export const MAX_LUGARES_POR_COMPRA = 10
export const MINUTOS_APARTADO = 10
export const TEXTO_POLITICA_REEMBOLSO =
  'Reembolso del 100 % si cancelas hasta 48 horas antes de la experiencia. Después ya no hay reembolso.'
export const TEXTO_SOLO_TARJETA = 'Las experiencias se pagan solo con tarjeta de crédito o débito.'
export const TEXTO_SIN_CUPONES_EXPERIENCIAS = 'Los códigos de descuento no aplican a experiencias.'
/** Texto del reloj de apartado (D13-8). `{reloj}` = mm:ss. */
export const TEXTO_APARTADO =
  'Tus lugares están apartados por {reloj}. Paga pronto: hay mucha demanda y, al terminar el tiempo, se liberan.'
export const TEXTO_APARTADO_VENCIDO = 'Tu apartado venció y los lugares se liberaron. Vuelve a apartarlos para pagar.'

/** localStorage: el carrito de siempre (productos y experiencias). */
export const CLAVE_CARRITO = 'arcaTierraCart'
/** sessionStorage: el apartado vigente del checkout (sobrevive a «atrás» desde MercadoPago). */
export const CLAVE_APARTADO = 'arcaTierraApartado'

// ─── Feed público GET /api/calendario/eventos y GET /api/calendario/eventos/{id} (C5) ───────────────────────
/** Un item del feed tal como llega (JSON). Solo los campos que usa la web. */
export interface FechaPublica {
  id: string // evento_id
  nombre_evento: string
  descripcion: string | null
  fecha_evento: string // YYYY-MM-DD
  hora_inicio: string // HH:MM:SS
  hora_fin: string | null
  ubicacion: string | null
  capacidad_maxima: number | null
  /** Lugares que quedan para comprar YA descontando los apartados vigentes; null = sin cupo definido. */
  disponibles: number | null
  precio_efectivo: number | null
  experiencia_id: string | null
  experiencia_nombre: string | null
  experiencia_slug: string | null
  // ── Fase 4 (C5) ──
  apartados: number
  vendible_en_linea: boolean
  /** Por qué no se vende en línea (un renglón para el cliente); null si se vende. */
  motivo_no_vendible: string | null
  /** Cuándo cierra la venta en línea (ISO con zona). */
  cierre_venta: string | null
  /** Tope del selector: min(10, disponibles); 0 si no se vende en línea. */
  max_por_compra: number
  /** Precio de UN niño con la regla de la experiencia; null = sin regla (paga como adulto). */
  precio_nino: number | null
  edad_maxima_nino: number | null
  /** ubicacion de la fecha o, si no tiene, la de la experiencia. */
  punto_encuentro: string | null
}

// ─── Carrito (localStorage CLAVE_CARRITO) ─────────────────────────────────────────────────────────────────────
/**
 * Una fecha de experiencia en el carrito. `id` = `evento_id`: dos fechas de la misma experiencia son dos renglones
 * (antes la llave era la experiencia y chocaban). Los productos siguen con su forma de siempre (`id` = itemcode).
 */
export interface ItemCarritoExperiencia {
  id: string // = evento_id
  tipo: 'experiencia'
  evento_id: string
  experiencia_id: string
  name: string // nombre de la experiencia
  fecha: string // YYYY-MM-DD
  hora: string // HH:MM
  hora_fin: string | null // HH:MM
  adultos: number
  ninos: number
  /** adultos + ninos (lo que suma el badge del carrito) */
  quantity: number
  /** precio por adulto (el de la fecha) */
  price: number
  /** precio por niño; igual a `price` si la experiencia no tiene regla */
  precio_nino: number
  edad_maxima_nino: number | null
  punto_encuentro: string | null
  image: string
  unit: 'personas'
}

export function esItemExperiencia(item: unknown): item is ItemCarritoExperiencia {
  const x = item as Partial<ItemCarritoExperiencia> | null
  return !!x && x.tipo === 'experiencia' && typeof x.evento_id === 'string' && x.evento_id.length > 0
}

/** Un renglón viejo de experiencia (antes de la Fase 4: sin `evento_id`). Se quita del carrito con aviso. */
export function esExperienciaVieja(item: unknown): boolean {
  const x = item as { tipo?: string; evento_id?: string } | null
  return !!x && x.tipo === 'experiencia' && !x.evento_id
}

/** «3 personas (2 adultos, 1 niño)» · «1 persona (1 adulto)» · «2 personas (2 niños)». */
export function textoPersonas(adultos: number, ninos: number): string {
  const total = adultos + ninos
  const partes: string[] = []
  if (adultos > 0) partes.push(`${adultos} ${adultos === 1 ? 'adulto' : 'adultos'}`)
  if (ninos > 0) partes.push(`${ninos} ${ninos === 1 ? 'niño' : 'niños'}`)
  return `${total} ${total === 1 ? 'persona' : 'personas'}${partes.length ? ` (${partes.join(', ')})` : ''}`
}

export function subtotalExperiencia(item: Pick<ItemCarritoExperiencia, 'adultos' | 'ninos' | 'price' | 'precio_nino'>): number {
  return centavos(item.adultos * item.price + item.ninos * item.precio_nino)
}

// ─── Apartado (C2) y pago (C3) ───────────────────────────────────────────────────────────────────────────────
/** Viene en la respuesta de /api/cart/sync-and-validate cuando el carrito trae experiencias. */
export interface Apartado {
  id: string
  vence_en: string // ISO con zona
  /** Úsalo para el reloj (no confíes en el reloj de la computadora del cliente). */
  segundos_restantes: number
}

/** Lo que se guarda en sessionStorage CLAVE_APARTADO: el apartado + a qué carrito pertenece. */
export interface ApartadoGuardado extends Apartado {
  /** `firmaCarritoExperiencias()` al apartar: si el carrito cambió, el apartado ya no sirve. */
  firma: string
  /** Date.now() + segundos_restantes * 1000, calculado al recibirlo. */
  vence_local_ms: number
}

/** Una línea de experiencia validada por el servidor (dentro de `validated_items`). */
export interface LineaExperienciaValidada {
  tipo: 'experiencia'
  id: string // evento_id
  evento_id: string
  experiencia_id: string
  name: string
  fecha: string // YYYY-MM-DD
  hora: string // HH:MM
  hora_fin: string | null
  adultos: number
  ninos: number
  quantity: number
  precio_adulto: number
  precio_nino: number
  subtotal: number
  /** subtotal / quantity (compatibilidad con los lectores de `price * quantity`) */
  price: number
  punto_encuentro: string | null
  description: string
}

export interface LineaProductoValidada {
  id: string
  name: string
  price: number
  quantity: number
  description: string
  tipo?: 'producto'
}

export interface SyncValidateResponse {
  success: true
  validated_items: Array<LineaProductoValidada | LineaExperienciaValidada>
  total: number
  /** null si el carrito no trae experiencias */
  apartado: Apartado | null
  message: string
}

/** Cómo va una fecha en `items` de POST /api/crear-preferencia-pago (C3). */
export interface ExperienciaParaPagar {
  tipo: 'experiencia'
  evento_id: string
  adultos: number
  ninos: number
  alergias: string | null // máx. 500
}

/** 409 de crear-preferencia-pago (y de sync) cuando el apartado ya no sirve. */
export interface ErrorApartadoVencido {
  code: 'apartado_vencido'
  mensaje: string
}

export function esApartadoVencido(detail: unknown): detail is ErrorApartadoVencido {
  return !!detail && typeof detail === 'object' && (detail as { code?: string }).code === 'apartado_vencido'
}

/** Firma estable de las experiencias del carrito: fechas, adultos y niños (ordenadas por evento_id). */
export function firmaCarritoExperiencias(items: unknown[]): string {
  return items
    .filter(esItemExperiencia)
    .map((i) => `${i.evento_id}:${i.adultos}:${i.ninos}`)
    .sort()
    .join('|')
}

/** mm:ss para el reloj del apartado. */
export function relojApartado(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// ─── NI1 (panel: editor de la experiencia) ────────────────────────────────────────────────────────────────────
export type TipoPrecioNino = 'porcentaje' | 'monto'

/** Campos de la regla en GET/POST/PUT de /api/experiencias/admin (C7). Todos null = sin regla. */
export interface ReglaNino {
  edad_maxima_nino: number | null // 1–17
  tipo_precio_nino: TipoPrecioNino | null // al capturar una regla nueva, 'porcentaje' por defecto (D12)
  porcentaje_nino: number | null // 0–100, si tipo = porcentaje
  precio_nino: number | null // pesos, si tipo = monto
}

export const REGLA_NINO_VACIA: ReglaNino = {
  edad_maxima_nino: null,
  tipo_precio_nino: null,
  porcentaje_nino: null,
  precio_nino: null,
}

/** ¿La regla está completa? (la misma condición que `regla_nino()` del backend) */
export function reglaNinoCompleta(r: ReglaNino): boolean {
  if (r.edad_maxima_nino == null || r.tipo_precio_nino == null) return false
  return r.tipo_precio_nino === 'porcentaje' ? r.porcentaje_nino != null : r.precio_nino != null
}

/** Espejo de `precio_nino()` del backend, solo para mostrar (el servidor cobra con el suyo). */
export function precioNino(r: ReglaNino, precioAdulto: number): number {
  if (!reglaNinoCompleta(r)) return centavos(precioAdulto)
  if (r.tipo_precio_nino === 'porcentaje') return centavos((precioAdulto * (r.porcentaje_nino as number)) / 100)
  return Math.min(centavos(r.precio_nino as number), centavos(precioAdulto))
}

// ─── Ventas de una fecha (panel, C8) ──────────────────────────────────────────────────────────────────────────
/** Un renglón de GET /api/admin/eventos/{id}/tickets → `items[]`, con lo nuevo de la Fase 4. */
export interface VentaTicket {
  id: string
  fuente_id: string | null
  fuente_nombre: string | null
  cantidad: number
  monto: number | null
  fecha_venta: string
  notas: string | null
  origen: string | null
  created_at: string
  // ── Fase 4 ──
  ninos: number
  pedido_id: string | null
  numero_pedido: string | null
  /** true = venta de la página web: no se edita ni se borra aquí (se cancela desde Pedidos). */
  es_web: boolean
  comprador_nombre: string | null
  comprador_email: string | null
  comprador_telefono: string | null
  alergias: string | null
}

function centavos(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
