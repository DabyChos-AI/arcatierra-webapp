// R15 v2 · F3 (tienda): lo que la tienda agrega al carrito. La escritura en `arcaTierraCart` es UNA para la ficha y la tienda:
// `agregarAlCarrito` de ficha/ficha.ts (D-F3-24 P-18); el `name` lo pone quien llama: aquí, el de `toSentenceCase` de hoy
// (src/app/tienda/page.tsx:523, :914). En una canasta se agrega SIEMPRE la de compra única (…U) con su nombre, precio y piezas
// (`productoParaComprar`, tienda/page.tsx:890-902; frontend-v11 R7). Nunca abre el carrito lateral (D-F3-13).
import { agregarAlCarrito } from '@/components/sitio-nuevo/ficha/ficha'
import type { ProductoTienda } from './catalogo'

/** Agrega `cantidad` del producto; false si no está en venta o si no se pudo guardar. */
export function agregarProducto(p: ProductoTienda, cantidad: number = 1): boolean {
  if (!p.enVenta || cantidad < 1) return false
  return agregarAlCarrito({ id: p.id, itemcode: p.id, name: p.nombre, price: p.precio, image: p.imagen, unit: p.unidad }, cantidad)
}

/** «{nombre} agregado al carrito» (D-F3-22 P-13), el mismo texto que la ficha. */
export function textoAgregado(nombre: string): string {
  return `${nombre} agregado al carrito`
}
