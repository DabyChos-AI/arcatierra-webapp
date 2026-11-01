// R15 v2 · F4 (eventos): las experiencias privadas de la base, con la llamada de hoy (D-F4-04, D-F4-07 P-7).
// `GET /api/experiencias?tipo=privada` (pública; `routers/experiencias.py:207-286`, item = `_item_lista` :141-176; CATALOGO-API.md:611).
// Hoy `/experiencias` pide la misma ruta sin `tipo` y filtra en el navegador (`src/app/experiencias/page.tsx:95-107`): misma ruta, mismo
// dato (C46). Se recorren las páginas que diga la API, con tope, y si una página después de la primera falla se usa lo que ya llegó, como hoy.
import { API_URL } from '@/lib/api'

/** Lo que /eventos y el formulario leen de un item (las llaves de `_item_lista`, tal como llegan). */
export type ExperienciaPrivada = {
  id: string
  slug: string
  nombre: string
  /** Precio por grupo (`precio_por_persona` de la base); null si la respuesta no lo trae (no se inventa). */
  precio: number | null
  precio_persona_adicional: number | null
  personas_incluidas: number | null
  descripcion?: string
  duracion_horas?: number
  imagen_principal?: string
}

/** Como hoy (`experiencias/page.tsx:31-32`): hasta 100 por página (el máximo de la API) y tope de páginas. */
const POR_PAGINA = 100
const MAX_PAGINAS = 10

const numero = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const texto = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)

/** Un item de la API a `ExperienciaPrivada`; null si le falta lo indispensable (id, slug, nombre) o no es privada. */
export function aPrivada(item: unknown): ExperienciaPrivada | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.slug !== 'string' || typeof o.nombre !== 'string') return null
  if (o.tipo !== undefined && o.tipo !== 'privada') return null
  const personas = o.personas_incluidas
  return {
    id: o.id,
    slug: o.slug,
    nombre: o.nombre,
    precio: numero(o.precio),
    precio_persona_adicional: numero(o.precio_persona_adicional),
    personas_incluidas: typeof personas === 'number' && Number.isInteger(personas) ? personas : null,
    descripcion: texto(o.descripcion),
    duracion_horas: numero(o.duracion_horas) ?? undefined,
    imagen_principal: texto(o.imagen_principal) || undefined,
  }
}

/** Las privadas de la API. Lanza si la primera página no llega (la pantalla dice el error de hoy y ofrece «Reintentar»). */
export async function pedirPrivadas(): Promise<ExperienciaPrivada[]> {
  const items: ExperienciaPrivada[] = []
  let paginas = 1
  for (let page = 1; page <= Math.min(paginas, MAX_PAGINAS); page++) {
    let res: Response
    try {
      res = await fetch(`${API_URL}/api/experiencias?tipo=privada&limit=${POR_PAGINA}&page=${page}`)
    } catch (error) {
      if (page === 1) throw error
      break
    }
    if (!res.ok) {
      if (page === 1) throw new Error(String(res.status))
      break
    }
    const data: { items?: unknown; pages?: unknown } = await res.json()
    for (const item of Array.isArray(data.items) ? data.items : []) {
      const privada = aPrivada(item)
      if (privada) items.push(privada)
    }
    paginas = typeof data.pages === 'number' ? data.pages : 1
  }
  return items
}
