/**
 * Stock de la tienda y checkout de productos — R2 del roadmap (sesión 42, 1-oct-2026). DR7 y DR7-b de David.
 * Contrato: build-with-agent-team/projects/arcatierra/docs/decisiones/R2-CONTRATO.md (§3 y §5).
 *
 * Lo escribe el LÍDER («archivo de todos»): úsalo, no redefinas estos tipos en los componentes. Si te falta algo,
 * pídeselo al líder. La regla de verdad vive en el backend (`services/tienda_reglas.py`, `services/stock_tienda.py`);
 * aquí solo lo que la pantalla necesita para mostrar y armar los payloads.
 */

// ─── DR7-b: la tienda cobra solo con tarjeta o saldo de MercadoPago (como experiencias) ──────────────────────
export const TEXTO_PAGO_TIENDA =
  'Pagas con tarjeta de crédito o débito, o con saldo de MercadoPago (no con efectivo ni OXXO).'
/** Renglón corto del resumen («Método de pago»), igual para productos, experiencias y extras con canasta. */
export const TEXTO_METODO_PAGO_CORTO = 'Tarjeta o saldo de MercadoPago'

// ─── DR7-2: avisos cuando el carrito cambia por falta de stock ──────────────────────────────────────────────
export const TEXTO_AGOTADO = 'Agotado por ahora'
export const TEXTO_CARRITO_CAMBIO =
  'Actualizamos tu carrito porque algunos productos se agotaron o ya no alcanzan. Revisa y vuelve a pagar.'

// ─── POST /api/cart/sync-and-validate (§3.3) ────────────────────────────────────────────────────────────────
/** Un producto que el servidor QUITÓ del carrito: no tiene stock disponible (contando lo apartado por otros). */
export interface ProductoQuitado {
  itemcode: string
  nombre: string
  motivo: string
  disponible: number
}

/** Un producto cuya cantidad el servidor BAJÓ a lo que hay (`cantidad` < `pedida`). */
export interface ProductoAjustado {
  itemcode: string
  nombre: string
  pedida: number
  cantidad: number
  motivo: string
}

export interface ApartadoCheckout {
  id: string
  vence_en: string // ISO con zona
  segundos_restantes: number
}

/** Respuesta del sync (llaves de antes + `quitados` y `ajustados`). */
export interface SyncCarritoRespuesta {
  success: boolean
  validated_items: Array<Record<string, unknown>>
  total: number
  /** null solo si no quedó nada que apartar. Con productos, siempre trae uno (DR7-1). */
  apartado: ApartadoCheckout | null
  quitados: ProductoQuitado[]
  ajustados: ProductoAjustado[]
  message?: string
}

/** ¿El carrito cambió? Si sí, la pantalla aplica los cambios al carrito, avisa y NO va a pagar (el cliente revisa). */
export function carritoCambio(r: Pick<SyncCarritoRespuesta, 'quitados' | 'ajustados'>): boolean {
  return (r.quitados?.length ?? 0) > 0 || (r.ajustados?.length ?? 0) > 0
}

/** Un renglón por producto, para el aviso. */
export function textoCambiosCarrito(r: Pick<SyncCarritoRespuesta, 'quitados' | 'ajustados'>): string[] {
  return [
    ...(r.quitados ?? []).map((q) => `${q.nombre}: ${q.motivo}`),
    ...(r.ajustados ?? []).map((a) => `${a.nombre}: ${a.motivo} (pediste ${a.pedida}, van ${a.cantidad})`),
  ]
}

// ─── Lectores públicos de productos (§5 STK3) ───────────────────────────────────────────────────────────────
/** Llaves nuevas de GET /api/products, /api/products/{itemcode} y búsquedas. `stock_actual` llega como NÚMERO. */
export interface DisponibilidadProducto {
  stock_actual: number
  /** stock menos lo apartado por otros en este momento; nunca negativo. */
  disponible: number
  /** visible y con al menos una unidad disponible. Si es false, la ficha dice «Agotado por ahora» y no deja agregar. */
  en_venta: boolean
}

/** El listado viejo mandaba `stock_actual` como texto («90.0000»): siempre pasar por aquí antes de comparar. */
export function aNumero(valor: unknown): number {
  const n = typeof valor === 'number' ? valor : Number(valor)
  return Number.isFinite(n) ? n : 0
}

// ─── Panel: pedido pagado sin stock (§5 STK4) ───────────────────────────────────────────────────────────────
export const ESTADO_PAGADO_SIN_STOCK = 'pagado_sin_stock'
export const ETIQUETA_PAGADO_SIN_STOCK = 'Pagado sin stock'

/** Un renglón de `pedidos.stock_faltante` (lo que no se pudo descontar al llegar el pago). */
export interface StockFaltante {
  itemcode: string
  nombre: string
  cantidad: number
  disponible: number
}

export const TEXTO_PAGADO_SIN_STOCK =
  'El pago llegó cuando ya no había stock de lo marcado abajo. Ofrece un cambio o reembolsa desde aquí; nada se devuelve solo.'

// ─── Textos del apartado según lo que hay en el carrito (C6, a pedido de front-checkout) ──────────────────────
// Con SOLO experiencias se conservan los textos de siempre (`TEXTO_APARTADO`, `TEXTO_APARTADO_VENCIDO` de
// compra-experiencias.ts): estas funciones los devuelven idénticos en ese caso.
type Contenido = { hayExperiencias: boolean; hayProductos: boolean }

function queSeAparta({ hayExperiencias, hayProductos }: Contenido): { sujeto: string; verbo: string } {
  if (hayExperiencias && hayProductos) return { sujeto: 'Tu pedido', verbo: 'está apartado' }
  if (hayProductos) return { sujeto: 'Tus productos', verbo: 'están apartados' }
  return { sujeto: 'Tus lugares', verbo: 'están apartados' }
}

/** Texto del reloj; `{reloj}` = mm:ss (se parte igual que `TEXTO_APARTADO`). */
export function textoApartado(c: Contenido): string {
  if (!c.hayProductos) {
    return 'Tus lugares están apartados por {reloj}. Paga pronto: hay mucha demanda y, al terminar el tiempo, se liberan.'
  }
  const { sujeto, verbo } = queSeAparta(c)
  return `${sujeto} ${verbo} por {reloj}. Paga pronto: al terminar el tiempo, se liberan para otros clientes.`
}

export function textoApartadoVencido(c: Contenido): string {
  if (!c.hayProductos) return 'Tu apartado venció y los lugares se liberaron. Vuelve a apartarlos para pagar.'
  if (c.hayExperiencias) return 'Tu apartado venció y tu pedido se liberó. Vuelve a apartarlo para pagar.'
  return 'Tu apartado venció y tus productos se liberaron. Vuelve a intentar el pago para apartarlos de nuevo.'
}

/** «Tus productos siguen apartados hasta las 19:45» (pending/failure). `hora` = HH:MM de México. */
export function textoApartadoHasta(c: Contenido, hora: string): string {
  const { sujeto } = queSeAparta(c)
  const sigue = c.hayExperiencias && c.hayProductos ? 'sigue apartado' : 'siguen apartados'
  return `${sujeto} ${sigue} hasta las ${hora}`
}
