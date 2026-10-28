/**
 * R15 · F2 (WF3, sesión 55, 28-oct-2026): lo que la tienda nueva lee del servidor. SOLO SERVIDOR (la importa
 * src/app/nuevo/tienda/page.tsx).
 *
 * Las MISMAS rutas públicas que llama hoy el sitio (DR-10, contrato §9): catálogo = `GET /api/products?limit=200` y
 * `GET /api/products/categories` (src/app/tienda/page.tsx:514 y :580); canastas = `GET /api/subscriptions/planes`
 * (el proxy de hoy src/app/api/subscriptions/planes/route.ts:7, y `leerPrecioMinimoCanasta` de F1). Aquí van por la red
 * interna como el resto de src/app/nuevo/** (src/lib/sitio-nuevo-contenido.ts), con la misma caché corta.
 *
 * No se inventa nada: si la API no responde, se devuelve null y la página dice que no pudo leer (no hay datos de relleno).
 */
import { aNumero, esCanasta } from '@/types/tienda'
import type { ProductoMuestra } from '@/lib/sitio-nuevo-contenido'
import { REVALIDAR_SEGUNDOS } from '@/lib/sitio-nuevo-contenido'
import { IDS_CANASTAS, type CategoriaTienda, type PlanCanasta } from './tipos'

if (typeof window !== 'undefined') {
  throw new Error('src/components/sitio-nuevo/tienda/datos.ts es solo de servidor')
}

const ESPERA_MS = 4000

async function pedirJson(ruta: string): Promise<unknown> {
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL || 'http://arca-api:8000'}${ruta}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDAR_SEGUNDOS },
      signal: AbortSignal.timeout(ESPERA_MS),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const esTexto = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const textoOpcional = (v: unknown): string | null => (esTexto(v) ? v.trim() : null)

/** Mismo mapeo que F1 (`aProducto` de src/lib/sitio-nuevo-contenido.ts): precio = `precio_unitario` de la base. */
function aProducto(item: unknown): ProductoMuestra | null {
  if (!esObjeto(item) || !esTexto(item.itemcode) || !esTexto(item.nombre)) return null
  const precio = aNumero(item.precio_unitario)
  if (!(precio > 0)) return null
  return {
    itemcode: item.itemcode,
    nombre: item.nombre.trim(),
    precio,
    unidad: textoOpcional(item.unidad_medida),
    descripcion: textoOpcional(item.descripcion),
    categoria: textoOpcional(item.categoria),
    imagenUrl: textoOpcional(item.imagen_url),
    enVenta: item.en_venta === true,
  }
}

export interface CatalogoTienda {
  /** Productos sueltos (sin canastas 1885–1891, como la tienda de hoy), en el orden de la API (por nombre). */
  productos: ProductoMuestra[]
  /** Categorías de `/categories` que tienen al menos un producto de la lista (así cada filtro deja algo). */
  categorias: CategoriaTienda[]
}

/**
 * El catálogo de «Compra suelto». `GET /api/products` público solo trae lo EN VENTA (`incluir_inactivos` ya no existe en
 * esa ruta: routers/products.py:123), así que no hay valor por omisión distinto que mandar. null si la API no respondió.
 */
export async function leerCatalogo(): Promise<CatalogoTienda | null> {
  const [crudo, crudoCategorias] = await Promise.all([
    pedirJson('/api/products?limit=200'),
    pedirJson('/api/products/categories'),
  ])
  if (!esObjeto(crudo) || !Array.isArray(crudo.items)) return null
  const productos = crudo.items
    .map(aProducto)
    .filter((p): p is ProductoMuestra => p !== null && !esCanasta(p.itemcode))

  const presentes = new Map<string, number>()
  for (const p of productos) if (p.categoria) presentes.set(p.categoria, (presentes.get(p.categoria) ?? 0) + 1)

  // `/categories` devuelve una lista de filas {categoria, total_productos, …} (routers/products.py:193).
  const filas = Array.isArray(crudoCategorias) ? crudoCategorias : []
  const categorias: CategoriaTienda[] = []
  for (const fila of filas) {
    if (!esObjeto(fila) || !esTexto(fila.categoria)) continue
    const total = presentes.get(fila.categoria)
    if (total) categorias.push({ nombre: fila.categoria, total })
  }
  return { productos, categorias }
}

/** Las 4 canastas fijas (C8) de `GET /api/subscriptions/planes`, con su precio de la base. null si no respondió. */
export async function leerCanastas(): Promise<PlanCanasta[] | null> {
  const crudo = await pedirJson('/api/subscriptions/planes')
  if (!esObjeto(crudo) || !Array.isArray(crudo.planes)) return null
  const planes: PlanCanasta[] = []
  for (const id of IDS_CANASTAS) {
    const p = crudo.planes.find((x) => esObjeto(x) && x.id === id)
    if (!esObjeto(p) || !esTexto(p.name)) continue
    const precio = aNumero(p.price)
    if (!(precio > 0)) continue
    planes.push({ id, itemcode: textoOpcional(p.itemcode) ?? '', nombre: p.name.trim(), precio })
  }
  return planes
}
