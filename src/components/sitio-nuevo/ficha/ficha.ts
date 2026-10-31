// R15 v2 · F3 (sesión 61): lo que la ficha de producto del sitio nuevo calcula, sin interfaz. Contrato v2 §9-F3 D-F3-06, D-F3-22;
// cadena-v2/f3/ficha-F3.md §4.6.
// Las reglas de la ficha de hoy viven dentro de src/app/producto/[id]/client-page.tsx sin exportarse (D-F3-06: no se toca el código de
// hoy), así que aquí se escriben de nuevo, con una prueba que compara cada una contra la de hoy en las mismas entradas:
// - la venta de una fila de `GET /api/products/{itemcode}` (client-page.tsx:29-38);
// - la foto de las 4 canastas por su nombre (client-page.tsx:41-48);
// - la descripción partida en «CARACTERÍSTICAS:» y «✅» (client-page.tsx:300-323);
// - agregar al carrito local (client-page.tsx:177-205): UNA sola función para la ficha y la tienda nuevas (D-F3-24, D-F3-28); quien llama
//   pasa el nombre que hoy escribe su pantalla (la ficha, el de la API tal cual; la tienda, el suyo en tipo oración).
// Una canasta sin U se vende como su compra única: precio, existencias, nombre y lo que entra al carrito son los de la U (FIC1, CAR1).
import { API_URL } from '@/lib/api'
import { guardarCarrito, leerCarrito } from '@/lib/carrito'
import { aNumero, esCanasta, itemcodeCompraUnica } from '@/types/tienda'

/** Las llaves de `GET /api/products/{itemcode}` que lee la ficha (routers/products.py:24-29). */
export interface ProductoApi {
  itemcode: string
  nombre: string
  categoria?: string | null
  precio_unitario?: unknown
  stock_actual?: unknown
  disponible?: unknown
  en_venta?: unknown
  unidad_medida?: string | null
  descripcion?: string | null
  imagen_url?: string | null
}

export interface Venta {
  precio: number
  /** Unidades enteras que se pueden pedir (0 si no está en venta). */
  stock: number
  enVenta: boolean
}

export interface ProductoFicha {
  /** El itemcode de la dirección (el de la base en una canasta): con él se guardan los favoritos, como hoy. */
  itemcode: string
  /** El que entra al carrito: en una canasta, el de compra única (con U). */
  itemcodeCarrito: string
  nombre: string
  categoria: string | null
  descripcion: string
  /** `imagen_url` de la API tal cual (vacío si no viene): es lo que hoy entra al carrito. */
  imagen: string
  unidad: string
  /** false = una canasta cuya compra única no existe: no hay precio que mostrar y no se vende. */
  conPrecio: boolean
  venta: Venta
}

/** Unidades enteras disponibles: `disponible` y, si no viene, `stock_actual` (que llegaba como texto «90.0000»); nunca negativo. */
export function disponibleDe(fila: Pick<ProductoApi, 'disponible' | 'stock_actual'>): number {
  const valor = fila.disponible === undefined || fila.disponible === null ? fila.stock_actual : fila.disponible
  return Math.max(0, Math.floor(aNumero(valor)))
}

/** Precio, existencias y si está en venta (`en_venta` manda; si no viene, que haya al menos una unidad). */
export function ventaDe(fila: Pick<ProductoApi, 'precio_unitario' | 'en_venta' | 'disponible' | 'stock_actual'>): Venta {
  const unidades = disponibleDe(fila)
  const enVenta = typeof fila.en_venta === 'boolean' ? fila.en_venta : unidades >= 1
  return { precio: parseFloat(String(fila.precio_unitario)), stock: enVenta ? unidades : 0, enVenta }
}

const FOTOS_DE_CANASTA: ReadonlyArray<readonly [string, string]> = [
  ['canasta individual', '/images/canastas/canastaindividual.jpg'],
  ['canasta media', '/images/canastas/canastamedia.jpg'],
  ['canasta completa', '/images/canastas/canastacompleta.jpg'],
  ['canasta familiar', '/images/canastas/canastafamiliar.jpg'],
]
const SIN_FOTO = '/images/placeholder-producto.webp'

/** La foto de la ficha: la de la canasta por su nombre, si no la de la API y si no la de «sin foto». */
export function fotoDeCanasta(nombre: string, original?: string | null): string {
  const enMinusculas = nombre.toLowerCase()
  const deCanasta = FOTOS_DE_CANASTA.find(([parte]) => enMinusculas.includes(parte))
  if (deCanasta) return deCanasta[1]
  return original && original.trim() !== '' ? original : SIN_FOTO
}

const MARCA_CARACTERISTICAS = 'CARACTERÍSTICAS:'
const PALOMITA = '✅'

/** La descripción de la base: el párrafo de antes de «CARACTERÍSTICAS:» y, después, una por cada «✅». */
export function partirDescripcion(descripcion: string): { parrafo: string; caracteristicas: string[] } {
  const partes = descripcion.split(MARCA_CARACTERISTICAS)
  const parrafo = (partes[0] ?? '').trim()
  if (!descripcion.includes(MARCA_CARACTERISTICAS)) return { parrafo, caracteristicas: [] }
  const caracteristicas = (partes[1] ?? '')
    .split(PALOMITA)
    .filter((renglon) => renglon.trim().length > 0)
    .map((renglon) => renglon.trim())
  return { parrafo, caracteristicas }
}

/** El segmento de la dirección tal como lo entrega Next 15 (codificado), ya decodificado; si no se puede, tal cual. */
export function idDeLaDireccion(segmento: string): string {
  try {
    return decodeURIComponent(segmento)
  } catch {
    return segmento
  }
}

async function pedirProducto(itemcode: string): Promise<ProductoApi | null> {
  const respuesta = await fetch(`${API_URL}/api/products/${encodeURIComponent(itemcode)}`)
  return respuesta.ok ? ((await respuesta.json()) as ProductoApi) : null
}

/**
 * Los datos de la ficha, con las mismas llamadas de hoy (client-page.tsx:68, :83). `null` = no existe, está oculto, la API respondió
 * con error o no hubo red: la pantalla hace lo de hoy (manda a la tienda).
 */
export async function pedirFicha(itemcode: string): Promise<ProductoFicha | null> {
  try {
    const base = await pedirProducto(itemcode)
    if (!base) return null
    let venta = ventaDe(base)
    let itemcodeCarrito = base.itemcode
    let nombre = base.nombre
    let conPrecio = true
    if (esCanasta(base.itemcode) && !base.itemcode.endsWith('U')) {
      itemcodeCarrito = itemcodeCompraUnica(base.itemcode)
      const compraUnica = await pedirProducto(itemcodeCarrito)
      if (compraUnica) {
        venta = ventaDe(compraUnica)
        if (typeof compraUnica.nombre === 'string' && compraUnica.nombre.trim() !== '') nombre = compraUnica.nombre
      } else {
        venta = { precio: 0, stock: 0, enVenta: false }
        conPrecio = false
      }
    }
    return {
      itemcode: base.itemcode,
      itemcodeCarrito,
      nombre,
      categoria: base.categoria ?? null,
      descripcion: base.descripcion ?? '',
      imagen: base.imagen_url ?? '',
      unidad: base.unidad_medida ?? '',
      conPrecio,
      venta,
    }
  } catch {
    return null
  }
}

/** Lo que entra al carrito (el renglón de siempre de `arcaTierraCart`, sin la cantidad ni el tipo, que pone `agregarAlCarrito`). */
export interface ItemParaCarrito {
  /** El itemcode que se compra (en una canasta, el de la U). */
  id: string
  itemcode: string
  /** El nombre tal como lo escribe hoy la pantalla que llama. */
  name: string
  price: number
  image: string
  unit: string
}

/**
 * Agrega al carrito local como la ficha de hoy: el renglón de siempre y, si ya estaba, se le suma la cantidad (`aNumero`). `guardarCarrito`
 * escribe `arcaTierraCart` y avisa con `cartUpdated` (el contador de la cabecera sube solo); un carrito dañado se lee como vacío
 * (`leerCarrito`). Nunca abre el carrito lateral (D-F3-13). Devuelve false si no se pudo guardar: quien llama pinta su aviso.
 */
export function agregarAlCarrito(item: ItemParaCarrito, cantidad: number): boolean {
  try {
    const renglones = leerCarrito()
    const yaEsta = renglones.find((renglon) => renglon.id === item.id)
    if (yaEsta) {
      yaEsta.quantity = aNumero(yaEsta.quantity) + cantidad
    } else {
      renglones.push({
        id: item.id,
        itemcode: item.itemcode,
        name: item.name,
        price: item.price,
        quantity: cantidad,
        image: item.image,
        unit: item.unit,
        tipo: 'producto',
      })
    }
    guardarCarrito(renglones)
    return true
  } catch {
    return false
  }
}

/** El renglón de la ficha: en una canasta, la compra única; el nombre de la API tal cual, como la ficha de hoy (client-page.tsx:180-189). */
export function itemDeLaFicha(producto: ProductoFicha): ItemParaCarrito {
  return {
    id: producto.itemcodeCarrito,
    itemcode: producto.itemcodeCarrito,
    name: producto.nombre,
    price: producto.venta.precio,
    image: producto.imagen,
    unit: producto.unidad,
  }
}
