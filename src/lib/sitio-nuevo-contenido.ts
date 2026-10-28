/**
 * R15 · F1 (WF1 + WF7, sesión 54, 28-oct-2026): lo que lee del servidor el sitio nuevo (src/app/nuevo/**).
 * Contrato: build-with-agent-team/projects/arcatierra/docs/decisiones/R15-CONTRATO.md §9 C13–C16 y C18.
 *
 * SOLO SERVIDOR: lo importan los componentes de servidor de src/app/nuevo/** (layout y páginas). Habla con la API por la red
 * interna (`INTERNAL_API_URL`, como el middleware y los proxies) con una caché corta de Next (`REVALIDAR_SEGUNDOS`).
 *
 * Regla de David (28-oct): no se inventa nada. Si la API no responde o una sección viene vacía, aquí se devuelve vacío y la
 * página pinta `<Falta …/>` (src/components/sitio-nuevo/Falta.tsx) en su lugar: nunca un texto de relleno, y la página no
 * truena. Los precios salen siempre de la base (lo que mande la API), nunca de la maqueta.
 */
import { cache } from 'react'
import type {
  ContenidoPublico,
  DatosAnuncio,
  DatosCifra,
  DatosCinta,
  ElementoPublico,
} from '@/types/contenido-sitio'
import { aNumero, esCanasta } from '@/types/tienda'
import type { FechaPublica } from '@/types/compra-experiencias'

if (typeof window !== 'undefined') {
  throw new Error('src/lib/sitio-nuevo-contenido.ts es solo de servidor')
}

/** Segundos que Next guarda cada respuesta antes de volver a pedirla (la API también cachea poco). */
export const REVALIDAR_SEGUNDOS = 60
/** Si la API tarda más que esto, se pinta la marca y la página sigue. */
const ESPERA_MS = 4000

function baseApi(): string {
  return process.env.INTERNAL_API_URL || 'http://arca-api:8000'
}

/** GET a la API interna; null si no responde, si no es 2xx o si no es JSON. Nunca lanza. */
async function pedirJson(ruta: string): Promise<unknown> {
  try {
    const res = await fetch(`${baseApi()}${ruta}`, {
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

// ─── Contenido del sitio (GET /api/contenido-sitio, WF7) ─────────────────────────────────────────────────────

/** Sin nada publicado: así se ve el sitio nuevo cuando la API no responde (todo con la marca). */
export const CONTENIDO_VACIO: ContenidoPublico = Object.freeze({
  portada: {},
  cinta: [],
  anuncio: null,
  prensa: [],
  faq: [],
  instagram: [],
  cifras: {},
  equipo: [],
  generado_en: '',
}) as ContenidoPublico

export interface LecturaContenido {
  contenido: ContenidoPublico
  /** false = la API no respondió (o respondió algo que no es el contrato): todo sale con la marca. */
  respondio: boolean
}

function elementos<D>(crudo: unknown, valido: (datos: Record<string, unknown>) => D | null): ElementoPublico<D>[] {
  if (!Array.isArray(crudo)) return []
  const salida: ElementoPublico<D>[] = []
  for (const el of crudo) {
    if (!esObjeto(el) || !esTexto(el.id) || !esObjeto(el.datos)) continue
    const datos = valido(el.datos)
    if (datos) salida.push({ id: el.id, datos })
  }
  return salida
}

const cintaValida = (d: Record<string, unknown>): DatosCinta | null => (esTexto(d.texto) ? { texto: d.texto.trim() } : null)

const anuncioValido = (d: Record<string, unknown>): DatosAnuncio | null =>
  esTexto(d.titulo) && esTexto(d.texto)
    ? {
        titulo: d.titulo.trim(),
        texto: d.texto.trim(),
        imagen_url: textoOpcional(d.imagen_url),
        boton_texto: textoOpcional(d.boton_texto),
        boton_url: textoOpcional(d.boton_url),
      }
    : null

const cifraValida = (d: unknown): DatosCifra | null =>
  esObjeto(d) && esTexto(d.valor) && esTexto(d.descripcion) ? { valor: d.valor.trim(), descripcion: d.descripcion.trim() } : null

/** Pasa lo que llegó por el contrato de `src/types/contenido-sitio.ts`; lo que no lo cumple se trata como vacío (marca). */
function normalizarContenido(crudo: unknown): ContenidoPublico | null {
  if (!esObjeto(crudo)) return null
  const cifras: Record<string, DatosCifra> = {}
  if (esObjeto(crudo.cifras)) {
    for (const [clave, datos] of Object.entries(crudo.cifras)) {
      const cifra = cifraValida(datos)
      if (cifra) cifras[clave] = cifra
    }
  }
  let anuncio: ContenidoPublico['anuncio'] = null
  if (esObjeto(crudo.anuncio) && esTexto(crudo.anuncio.id) && esObjeto(crudo.anuncio.datos)) {
    const datos = anuncioValido(crudo.anuncio.datos)
    if (datos) {
      anuncio = { id: crudo.anuncio.id, datos, vigente_hasta: textoOpcional(crudo.anuncio.vigente_hasta) }
    }
  }
  // Prensa, FAQ, Instagram, equipo y portada los pinta F2–F4: aquí solo se pasan tal cual si traen la forma básica.
  const tal = <D,>(v: unknown) => elementos<D>(v, (d) => d as unknown as D)
  return {
    portada: esObjeto(crudo.portada) ? (crudo.portada as ContenidoPublico['portada']) : {},
    cinta: elementos(crudo.cinta, cintaValida),
    anuncio,
    prensa: tal(crudo.prensa),
    faq: tal(crudo.faq),
    instagram: tal(crudo.instagram),
    cifras,
    equipo: tal(crudo.equipo),
    generado_en: typeof crudo.generado_en === 'string' ? crudo.generado_en : '',
  }
}

/**
 * Lo publicado y vigente del contenido del sitio. Una sola petición por render (`cache` de React: el layout y la página la
 * comparten) y caché de Next de `REVALIDAR_SEGUNDOS`.
 */
export const leerContenidoSitio = cache(async (): Promise<LecturaContenido> => {
  const contenido = normalizarContenido(await pedirJson('/api/contenido-sitio'))
  return contenido ? { contenido, respondio: true } : { contenido: CONTENIDO_VACIO, respondio: false }
})

/** Claves de las cifras sembradas del Word del 28-oct (contrato C9/C13). Las que no estén publicadas salen con la marca. */
export const CLAVES_CIFRAS = [
  'familias',
  'familias_catering',
  'estados',
  'anios',
  'desde',
  'colonias',
  'chinampas',
  'chinampas_abandonadas',
  'hectareas_urbanas',
  'area_agroecologica',
  'chinampas_desde',
  'estrella_verde',
] as const

// ─── Catálogo (las mismas rutas públicas que usa el sitio de hoy) ────────────────────────────────────────────

/** Un producto de `GET /api/products` listo para la tarjeta (precio de la base, `precio_unitario`). */
export interface ProductoMuestra {
  itemcode: string
  nombre: string
  precio: number
  unidad: string | null
  descripcion: string | null
  categoria: string | null
  imagenUrl: string | null
  enVenta: boolean
}

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

async function listaProductos(consulta: string): Promise<ProductoMuestra[] | null> {
  const crudo = await pedirJson(`/api/products?${consulta}`)
  if (!esObjeto(crudo) || !Array.isArray(crudo.items)) return null
  return crudo.items.map(aProducto).filter((p): p is ProductoMuestra => p !== null)
}

export interface MuestraProductos {
  productos: ProductoMuestra[]
  /** De dónde salieron: los marcados como destacados en el panel o, si no hay, los primeros en venta por nombre. */
  origen: 'destacados' | 'primeros'
}

/** Productos sueltos (sin canastas) en venta para la muestra de tarjetas; null si la API no respondió. */
export async function leerProductosMuestra(cuantos = 4): Promise<MuestraProductos | null> {
  const sueltos = (lista: ProductoMuestra[]) => lista.filter((p) => p.enVenta && !esCanasta(p.itemcode))
  const destacados = await listaProductos('destacados=true&limit=50')
  if (destacados === null) return null
  const elegidos = sueltos(destacados).slice(0, cuantos)
  if (elegidos.length > 0) return { productos: elegidos, origen: 'destacados' }
  const primeros = await listaProductos('limit=50&order_by=nombre&order=asc')
  if (primeros === null) return null
  return { productos: sueltos(primeros).slice(0, cuantos), origen: 'primeros' }
}

/** El producto suelto (sin canastas) más barato en venta: el «desde $…» de «Compra suelto». null si no se pudo leer. */
export async function leerPrecioMinimoSuelto(): Promise<number | null> {
  const lista = await listaProductos('limit=100&order_by=precio_unitario&order=asc')
  if (lista === null) return null
  const primero = lista.find((p) => p.enVenta && !esCanasta(p.itemcode))
  return primero ? primero.precio : null
}

/** El plan de suscripción más barato (`GET /api/subscriptions/planes`, precio de la base): el «desde $…» de la canasta. */
export async function leerPrecioMinimoCanasta(): Promise<number | null> {
  const crudo = await pedirJson('/api/subscriptions/planes')
  if (!esObjeto(crudo) || !Array.isArray(crudo.planes)) return null
  const precios = crudo.planes
    .map((p) => (esObjeto(p) ? aNumero(p.price) : 0))
    .filter((n) => n > 0)
  return precios.length > 0 ? Math.min(...precios) : null
}

/** Una experiencia de `GET /api/experiencias` lista para la tarjeta. */
export interface ExperienciaMuestra {
  id: string
  slug: string
  nombre: string
  tipo: 'publica' | 'privada'
  precio: number
  precioPersonaAdicional: number | null
  personasIncluidas: number | null
  duracionHoras: number | null
  descripcion: string
  imagenUrl: string | null
  /** Solo públicas: la próxima fecha que se vende en línea (del feed `GET /api/calendario/eventos`). */
  proximaFecha: { fecha: string; horaInicio: string | null; disponibles: number | null } | null
}

function aExperiencia(item: unknown): ExperienciaMuestra | null {
  if (!esObjeto(item) || !esTexto(item.id) || !esTexto(item.slug) || !esTexto(item.nombre)) return null
  if (item.tipo !== 'publica' && item.tipo !== 'privada') return null
  if (item.disponible === false) return null
  const precio = aNumero(item.precio)
  const adicional = aNumero(item.precio_persona_adicional)
  const incluidas = typeof item.personas_incluidas === 'number' && Number.isInteger(item.personas_incluidas) && item.personas_incluidas > 0
    ? item.personas_incluidas
    : null
  const duracion = aNumero(item.duracion_horas)
  return {
    id: item.id,
    slug: item.slug,
    nombre: item.nombre.trim(),
    tipo: item.tipo,
    precio,
    precioPersonaAdicional: adicional > 0 ? adicional : null,
    personasIncluidas: incluidas,
    duracionHoras: duracion > 0 ? duracion : null,
    descripcion: typeof item.descripcion === 'string' ? item.descripcion.trim() : '',
    imagenUrl: textoOpcional(item.imagen_principal),
    proximaFecha: null,
  }
}

/** La misma regla que `esVendible` de components/experiencias/SelectorFecha.tsx (ese archivo es de cliente). */
function seVendeEnLinea(f: Partial<FechaPublica>): boolean {
  return f.vendible_en_linea === true && f.precio_efectivo != null && !!f.experiencia_id && (f.max_por_compra ?? 0) >= 1
}

async function proximaFechaVendible(experienciaId: string): Promise<ExperienciaMuestra['proximaFecha']> {
  const crudo = await pedirJson(`/api/calendario/eventos?experiencia_id=${encodeURIComponent(experienciaId)}&limit=10`)
  if (!esObjeto(crudo) || !Array.isArray(crudo.items)) return null
  for (const f of crudo.items as Partial<FechaPublica>[]) {
    if (!esObjeto(f) || f.experiencia_id !== experienciaId || !esTexto(f.fecha_evento)) continue
    if (!seVendeEnLinea(f)) continue
    return {
      fecha: f.fecha_evento,
      horaInicio: textoOpcional(f.hora_inicio),
      disponibles: typeof f.disponibles === 'number' ? f.disponibles : null,
    }
  }
  return null
}

/** Las experiencias disponibles (públicas con su próxima fecha vendible); null si la API no respondió. */
export async function leerExperienciasMuestra(cuantas = 6): Promise<ExperienciaMuestra[] | null> {
  const crudo = await pedirJson('/api/experiencias?limit=100')
  if (!esObjeto(crudo) || !Array.isArray(crudo.items)) return null
  const lista = crudo.items.map(aExperiencia).filter((e): e is ExperienciaMuestra => e !== null).slice(0, cuantas)
  return Promise.all(
    lista.map(async (e) => (e.tipo === 'publica' ? { ...e, proximaFecha: await proximaFechaVendible(e.id) } : e)),
  )
}
