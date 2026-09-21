/**
 * Costo de envío — espejo exacto de `services/envio.py` del backend.
 *
 * Existía en cuatro lugares con tres fórmulas distintas, y las tres malas
 * trataban un carrito en $0 como "por debajo del mínimo de envío gratis" en vez
 * de "no hay nada que enviar":
 *
 *   checkout/page.tsx:115   subtotal >= 1000 ? 0 : 100   → con $0 MANDABA 100
 *   checkout/page.tsx:164   idem                          → mostraba "$100.00"
 *   checkout/page.tsx:213   idem                          → sumaba 100 al total
 *   CheckoutFormSingleStep  > 0 && < 1000 ? 100 : 0       → esta sí daba 0
 *
 * El cliente veía "GRATIS" en el formulario y "$100.00" en el resumen, y el
 * pedido se creaba por $100.
 *
 * ⚠️ Quien manda es el backend: `payments.py` recalcula el envío con los precios
 * que lee de la base. Esto es solo para que la pantalla diga lo mismo.
 */

export const UMBRAL_ENVIO_GRATIS = 1000
export const COSTO_ENVIO = 100

export type TipoEntrega = 'envio_domicilio' | 'recoger_almacen'

/**
 * Costo de envío a partir del subtotal de mercancía.
 *
 *   0            → 0    (nada que llevar: es el caso de los productos gratuitos)
 *   1..999.99    → 100
 *   >= 1000      → 0
 *   recoger      → 0
 */
export function calcularCostoEnvio(
  subtotalProductos: number,
  tipoEntrega: TipoEntrega = 'envio_domicilio'
): number {
  if (tipoEntrega === 'recoger_almacen') return 0
  const sub = Number(subtotalProductos) || 0
  if (sub <= 0) return 0
  if (sub >= UMBRAL_ENVIO_GRATIS) return 0
  return COSTO_ENVIO
}

/** Subtotal de la mercancía: todo lo que no es experiencia. */
export function subtotalProductos(cartItems: any[]): number {
  return (cartItems || [])
    .filter((item) => item?.tipo !== 'experiencia')
    .reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 0), 0)
}
