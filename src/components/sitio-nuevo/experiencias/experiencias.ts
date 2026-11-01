// R15 v2 · F4 (sesión 62): la lógica sin interfaz de `/experiencias` y de `/experiencias/<slug>` del sitio nuevo. Contrato v2 §9-F4 D-F4-04,
// D-F4-12; cadena-v2/f4/experiencias-F4.md §2, §3, §6, §7. Las reglas que hoy viven dentro de las páginas (sin exportar) se escriben de nuevo
// aquí con una prueba que las compara con las de hoy en las mismas entradas (D-F4-04); lo que ya está exportado se importa.
// Solo navegador: lo importan componentes de cliente y se llama en efectos (D-F2-03: nada de fetch en el servidor).
import { API_URL } from '@/lib/api'
import { esVendible, nombreDeFecha } from '@/components/experiencias/SelectorFecha'
import { horaCorta } from '@/app/admin/eventos/components/fechas'
import { decodificarSlug, normalizarSlug } from '@/app/experiencias/[slug]/slug'
import type { FechaPublica, ItemCarritoExperiencia } from '@/types/compra-experiencias'

/** Lo que el sitio nuevo lee de un item de GET /api/experiencias (ExperienciaResponse, schemas/experiencia.py). */
export interface ExperienciaApi {
  id: string
  slug: string
  nombre: string
  tipo: string
  precio: number
  precio_persona_adicional: number
  personas_incluidas: number | null
  precio_nino?: number | null
  edad_maxima_nino?: number | null
  descripcion: string
  duracion_horas: number
  incluye: string[]
  informacion_importante: string[]
  imagen_principal: string
  galeria_imagenes: string[]
}

/** Las de hoy: 100 por página y a lo más 10 páginas (experiencias/page.tsx:30-32 y calendario/page.tsx:79-80). */
const POR_PAGINA = 100
const MAX_PAGINAS = 10
/** Las de hoy de la ficha: cuántas próximas fechas se ofrecen (`MAX_FECHAS_SLUG`, [slug]/page.tsx:25). */
export const MAX_FECHAS_FICHA = 6
/** Renglones de fechas por tarjeta de la lista (la maqueta pinta 3, `.exp-dates-list`). */
export const FECHAS_POR_TARJETA = 3

/** La foto de una experiencia: la de la API o, si viene vacía, la de hoy por nombre (experiencias/page.tsx:131-138). */
export function fotoDeExperiencia(nombre: string, imagen: string | null | undefined): string {
  if (imagen) return imagen
  const mayusculas = nombre.toUpperCase()
  if (mayusculas === 'AMANECER CHINAMPERO CON THE CURIOUS MEXICAN') return '/images/experiencias/AMANECERCHINAMPERO.jpg'
  if (mayusculas === 'TALLER DE COCINA CON MARIANA OROZCO') return '/images/experiencias/TALLERDECOCINACONMARIANAOROZCO.jpg'
  if (mayusculas === 'CHINAMPA EN FAMILIA') return '/images/experiencias/CHINAMPAENFAMILIA.jpeg'
  return `/images/experiencias/${mayusculas.replace(/\s+/g, '')}.jpg`
}

/** La descripción corta de la tarjeta de hoy (experiencias/page.tsx:142). */
export function descripcionCorta(descripcion: string | null | undefined): string {
  return descripcion ? descripcion.substring(0, 150) + '...' : ''
}

/**
 * El emoji del principio de un renglón de `incluye`, COMPLETO (D-F4-18): lo que quita la expresión de hoy ([slug]/page.tsx:589), más todo
 * emoji que se pinta como emoji (`Emoji_Presentation`) o un pictográfico seguido de U+FE0F, la unión U+200D y el U+20E3; luego los
 * espacios. La de hoy deja restos (U+FE0F y espacio, medio emoji unido, o el emoji entero si está fuera de sus rangos); el sitio de hoy
 * queda como está (INCL1). Un símbolo de texto sin U+FE0F (la © de «© Arca Tierra») se queda. Con `RegExp` y una cadena: `\p{…}` pide
 * ES2018 y el proyecto compila a ES2017.
 */
const EMOJI_INICIAL = new RegExp(
  '^(?:[\\u{1F300}-\\u{1F9FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}\\u{2B50}\\u{2705}\\u{274C}\\u{1F4CD}\\u{FE0F}\\u{200D}\\u{20E3}]|\\p{Emoji_Presentation}|\\p{Extended_Pictographic}\\u{FE0F})+\\s*',
  'u',
)

/** Un renglón de `incluye` sin el emoji del principio (D-F4-18); lo demás, igual que hoy. */
export function sinEmojiInicial(renglon: string): string {
  return renglon.replace(EMOJI_INICIAL, '')
}

/** «1 lugar» / «3 lugares» (la de hoy, SelectorFecha.tsx:66-68; no se exporta). */
export function textoLugares(n: number): string {
  return `${n} ${n === 1 ? 'lugar' : 'lugares'}`
}

/** Lo que dice cada fecha de su venta en línea (los textos de hoy de la ficha, [slug]/page.tsx:932-936). */
export function textoDisponibilidad(fecha: FechaPublica): string {
  if (!esVendible(fecha)) return 'Reserva por WhatsApp'
  if (fecha.disponibles == null) return 'Compra en línea'
  return `Quedan ${fecha.disponibles} ${fecha.disponibles === 1 ? 'lugar' : 'lugares'}`
}

/** El mes `AAAA-MM` de una fecha `AAAA-MM-DD`. */
export function mesDe(fecha: string): string {
  return fecha.slice(0, 7)
}

/** Los meses que tienen fechas, en orden. */
export function mesesConFechas(fechas: readonly FechaPublica[]): string[] {
  return Array.from(new Set(fechas.map((f) => mesDe(f.fecha_evento)))).sort()
}

/**
 * Las experiencias públicas, todas las páginas (como experiencias/page.tsx:94-107, con `tipo=publica` como ExperienciasGrid.tsx:75).
 * Si una página falla después de la primera, se usa lo que llegó (como hoy); si no llegó nada, null (error).
 */
export async function pedirExperienciasPublicas(): Promise<ExperienciaApi[] | null> {
  try {
    const items: ExperienciaApi[] = []
    let paginas = 1
    let fallo = false
    for (let pagina = 1; pagina <= Math.min(paginas, MAX_PAGINAS); pagina++) {
      const respuesta = await fetch(`${API_URL}/api/experiencias?tipo=publica&limit=${POR_PAGINA}&page=${pagina}`)
      if (!respuesta.ok) {
        fallo = true
        break
      }
      const datos: { items?: ExperienciaApi[]; pages?: number } = await respuesta.json()
      items.push(...(Array.isArray(datos.items) ? datos.items : []))
      paginas = typeof datos.pages === 'number' ? datos.pages : 1
    }
    if (items.length === 0 && fallo) return null
    // Resguardo de hoy (experiencias/page.tsx:174): solo las públicas.
    return items.filter((e) => e.tipo === 'publica')
  } catch {
    return null
  }
}

/**
 * Todas las fechas públicas del feed (como calendario/page.tsx:189-219: todas las páginas, sin repetir una fecha por `id`). Si la primera
 * página falla, null (error); si falla una después, se usa lo que llegó.
 */
export async function pedirFechasPublicas(): Promise<FechaPublica[] | null> {
  try {
    const porId = new Map<string, FechaPublica>()
    let paginas = 1
    for (let pagina = 1; pagina <= Math.min(paginas, MAX_PAGINAS); pagina++) {
      const respuesta = await fetch(`${API_URL}/api/calendario/eventos?limit=${POR_PAGINA}&page=${pagina}`)
      if (!respuesta.ok) {
        if (pagina === 1) return null
        break
      }
      const datos: { items?: FechaPublica[]; pages?: number } = await respuesta.json()
      for (const f of Array.isArray(datos.items) ? datos.items : []) porId.set(f.id, f)
      paginas = typeof datos.pages === 'number' ? datos.pages : 1
    }
    return Array.from(porId.values())
  } catch {
    return null
  }
}

export type ResultadoFicha = { estado: 'ok'; experiencia: ExperienciaApi } | { estado: 'no-existe' } | { estado: 'error' }

/**
 * La experiencia de la ficha: `GET /api/experiencias?slug=` y la misma comparación de resguardo de hoy, exacta y luego normalizada
 * ([slug]/page.tsx:285-297). 400/404/422 o sin coincidencia = no existe (notFound, :347-349); otro estado o la red = error (:350-357).
 */
export async function pedirExperienciaPorSlug(slug: string): Promise<ResultadoFicha> {
  try {
    const pedido = decodificarSlug(slug)
    const respuesta = await fetch(`${API_URL}/api/experiencias?slug=${encodeURIComponent(pedido)}`)
    if (respuesta.ok) {
      const datos: { items?: ExperienciaApi[] } = await respuesta.json()
      const items = Array.isArray(datos.items) ? datos.items : []
      const normalizado = normalizarSlug(pedido)
      const encontrada =
        items.find((e) => e.slug === pedido) ?? items.find((e) => typeof e.slug === 'string' && normalizarSlug(e.slug) === normalizado)
      return encontrada ? { estado: 'ok', experiencia: encontrada } : { estado: 'no-existe' }
    }
    if (respuesta.status === 400 || respuesta.status === 404 || respuesta.status === 422) return { estado: 'no-existe' }
    return { estado: 'error' }
  } catch {
    return { estado: 'error' }
  }
}

/** Las próximas fechas de UNA experiencia ([slug]/page.tsx:376-384: el feed filtrado y el resguardo por `experiencia_id`). null = error. */
export async function pedirFechasDeExperiencia(experienciaId: string): Promise<FechaPublica[] | null> {
  try {
    const respuesta = await fetch(
      `${API_URL}/api/calendario/eventos?experiencia_id=${encodeURIComponent(experienciaId)}&limit=${MAX_FECHAS_FICHA}`,
    )
    if (!respuesta.ok) return null
    const datos: { items?: FechaPublica[] } = await respuesta.json()
    const items = Array.isArray(datos.items) ? datos.items : []
    return items.filter((f) => f.experiencia_id === experienciaId).slice(0, MAX_FECHAS_FICHA)
  } catch {
    return null
  }
}

/** Imagen del renglón del carrito cuando la página no tiene la de la experiencia (SelectorFecha.tsx:29). */
const IMAGEN_POR_DEFECTO = '/images/experiencias/hero-experiencias.jpg'

/**
 * El renglón que se le pasa a `agregarExperiencia` (lib/carrito.ts): las MISMAS llaves, en el MISMO orden y con los mismos valores que
 * `SelectorFecha.tsx:105-119`, así `arcaTierraCart` queda igual que hoy (D-F4-12; prueba byte a byte). Solo con una fecha vendible.
 */
export function itemDeFecha(
  fecha: FechaPublica,
  adultos: number,
  ninos: number,
  imagen: string | undefined,
): Omit<ItemCarritoExperiencia, 'id' | 'quantity' | 'tipo' | 'unit'> | null {
  if (!esVendible(fecha) || !fecha.experiencia_id) return null
  const precioAdulto = fecha.precio_efectivo ?? 0
  const conRegla = fecha.precio_nino != null
  return {
    evento_id: fecha.id,
    experiencia_id: fecha.experiencia_id,
    name: nombreDeFecha(fecha),
    fecha: fecha.fecha_evento,
    hora: horaCorta(fecha.hora_inicio),
    hora_fin: fecha.hora_fin ? horaCorta(fecha.hora_fin) : null,
    adultos,
    ninos,
    price: precioAdulto,
    precio_nino: conRegla ? (fecha.precio_nino as number) : precioAdulto,
    edad_maxima_nino: conRegla ? fecha.edad_maxima_nino : null,
    punto_encuentro: fecha.punto_encuentro,
    image: imagen || IMAGEN_POR_DEFECTO,
  }
}
