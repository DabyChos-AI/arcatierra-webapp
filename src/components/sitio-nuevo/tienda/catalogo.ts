// R15 v2 · F3 (tienda): el catálogo de «Compra suelto» con la misma llamada y las mismas reglas de la tienda de hoy
// (GET /api/products?limit=200, src/app/tienda/page.tsx:514). La API pública solo trae lo EN VENTA (routers/products.py:111-127).
// Diferencias medidas y decididas: las canastas no van aquí (viven en «Canasta lista» con «Solo esta vez», DR-15, D-F3-24 T-18); sin el
// catálogo local de respaldo con precios escritos (tienda/page.tsx:500, :576, :588), sin calificaciones (D-6) ni «Agricultor Local».
import { aNumero, esCanasta } from '@/types/tienda'
import { enOracion } from './oracion'
import { disponibleDe, enVentaDe, type DisponibilidadApi } from './disponibilidad'

export interface ProductoApi extends DisponibilidadApi {
  itemcode: string
  nombre: string
  descripcion?: string | null
  categoria?: string | null
  precio_unitario: string | number
  unidad_medida?: string | null
  imagen_url?: string | null
}

export interface ProductoTienda {
  id: string
  /** Como lo pinta (y lo guarda en el carrito) la tienda de hoy: `toSentenceCase`. */
  nombre: string
  categoria: string
  precio: number
  imagen: string
  descripcion: string
  stock: number
  enVenta: boolean
  unidad: string
}

/** Un producto de la API como lo arma la tienda de hoy (tienda/page.tsx:519-545, sin los rellenos inventados). */
export function deApi(item: ProductoApi): ProductoTienda {
  const enVenta = enVentaDe(item)
  return {
    id: item.itemcode,
    nombre: enOracion(item.nombre),
    categoria: item.categoria || SIN_CATEGORIA,
    precio: aNumero(item.precio_unitario),
    imagen: item.imagen_url || '',
    descripcion: item.descripcion || '',
    stock: enVenta ? disponibleDe(item) : 0,
    enVenta,
    unidad: item.unidad_medida || '',
  }
}

/** La llave que la tienda de hoy pone a un producto sin categoría (tienda/page.tsx:524). */
export const SIN_CATEGORIA = 'sin-categoria'

/** Lee `{items}` de GET /api/products; undefined si la respuesta no se puede leer. */
export function leerProductos(respuesta: unknown): ProductoApi[] | undefined {
  const items = (respuesta as { items?: unknown } | null)?.items
  if (!Array.isArray(items)) return undefined
  return items.filter(
    (i): i is ProductoApi => !!i && typeof (i as ProductoApi).itemcode === 'string' && typeof (i as ProductoApi).nombre === 'string',
  )
}

/** Lo que va en «Compra suelto»: todo menos las canastas (1885–1891, con o sin U). Los productos QA, como hoy (C47). */
export function sueltos(productos: ProductoTienda[]): ProductoTienda[] {
  return productos.filter((p) => !esCanasta(p.id))
}

/** Las categorías de la lista, sin las vacías ni «sin categoría» (tienda/page.tsx:608-620). */
export function categoriasDe(productos: ProductoTienda[]): string[] {
  const vistas = new Set<string>()
  for (const p of productos) {
    const c = p.categoria
    if (!c || c === 'null' || c.trim() === '') continue
    const minus = c.toLowerCase().trim()
    if (minus === 'sin categoría' || minus === 'sin categoria' || minus === SIN_CATEGORIA) continue
    vistas.add(c)
  }
  return [...vistas]
}

export type Orden = 'mas-recientes' | 'precio-menor' | 'precio-mayor' | 'nombre-az' | 'nombre-za'

export const TODAS = 'all'

/** Filtro y orden de hoy (tienda/page.tsx:793-825): favoritos solos, o búsqueda en el nombre + categoría; luego el orden. */
export function filtrar(
  productos: ProductoTienda[],
  { busqueda, categoria, soloFavoritos, favoritos, orden }: {
    busqueda: string
    categoria: string
    soloFavoritos: boolean
    favoritos: readonly string[]
    orden: Orden
  },
): ProductoTienda[] {
  const texto = busqueda.toLowerCase()
  const lista = productos.filter((p) => {
    if (soloFavoritos) return favoritos.includes(p.id)
    return p.nombre.toLowerCase().includes(texto) && (categoria === TODAS || p.categoria === categoria)
  })
  const ordenada = [...lista]
  ordenada.sort((a, b) => {
    switch (orden) {
      case 'precio-menor':
        return a.precio - b.precio
      case 'precio-mayor':
        return b.precio - a.precio
      case 'nombre-az':
        return a.nombre.localeCompare(b.nombre)
      case 'nombre-za':
        return b.nombre.localeCompare(a.nombre)
      default:
        return 0
    }
  })
  return ordenada
}

/** «¡Solo quedan N disponibles!» solo con pocas piezas, como hoy (`UMBRAL_QUEDAN_POCOS`, tienda/page.tsx:79, :1551). */
const UMBRAL_QUEDAN_POCOS = 10

export function quedanPocos(p: Pick<ProductoTienda, 'enVenta' | 'stock'>): number | null {
  const n = p.enVenta ? p.stock : 0
  return n > 0 && n < UMBRAL_QUEDAN_POCOS ? n : null
}
