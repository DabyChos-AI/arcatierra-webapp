/**
 * Contenido del sitio (WF7, DR61) — R15 · F1 (sesión 54, tmux at-r15-f1, 28-oct-2026).
 * Contrato: build-with-agent-team/projects/arcatierra/docs/decisiones/R15-CONTRATO.md §9 C13–C15.
 * Tabla: `contenido_sitio` (migrations/2026-10-28-r15-f1-contenido-sitio.sql en la API).
 *
 * Lo escribe el LÍDER («archivo de todos»): úsalo, no redefinas estos tipos en los componentes. Si te falta algo,
 * pídeselo al líder. La validación de verdad vive en la API (`schemas/contenido_sitio.py`).
 *
 * Regla de David (28-oct): no se inventa nada. Lo que no esté publicado aquí, el sitio nuevo lo pinta con
 * `<Falta …/>` (src/components/sitio-nuevo/Falta.tsx); nunca con un texto de relleno.
 */

// ─── Secciones y estados (= los CHECK de la tabla) ──────────────────────────────────────────────────────────
export const SECCIONES_CONTENIDO = [
  'portada',
  'cinta',
  'anuncio',
  'prensa',
  'faq',
  'instagram',
  'cifras',
  'equipo',
] as const
export type SeccionContenido = (typeof SECCIONES_CONTENIDO)[number]

export const ESTADOS_CONTENIDO = ['borrador', 'publicado', 'archivado'] as const
export type EstadoContenido = (typeof ESTADOS_CONTENIDO)[number]

/** Nombre de cada sección en el panel. */
export const NOMBRE_SECCION: Record<SeccionContenido, string> = {
  portada: 'Portada',
  cinta: 'Cinta',
  anuncio: 'Anuncio emergente',
  prensa: 'Prensa',
  faq: 'Preguntas frecuentes',
  instagram: 'Fotos de Instagram',
  cifras: 'Cifras',
  equipo: 'Equipo',
}

/** Secciones con un elemento por `clave` (obligatoria); en las demás `clave` es null. */
export const SECCIONES_CON_CLAVE: readonly SeccionContenido[] = ['portada', 'cifras']

/** Tope de fotos de Instagram PUBLICADAS a la vez (la maqueta trae 8). La API responde 409 si se pasa. */
export const MAX_INSTAGRAM_PUBLICADAS = 8

// ─── `datos` de cada sección (strings recortados; los opcionales pueden faltar o venir null) ─────────────────
/** URL: http(s)://… o una ruta del propio sitio que empieza con «/» (p. ej. /uploads/contenido-sitio/…). */
export type Url = string

export interface DatosPortada {
  titulo?: string | null // ≤ 200
  texto?: string | null // ≤ 1000
  imagen_url?: Url | null
  enlace_texto?: string | null // ≤ 80
  enlace_url?: Url | null
}
export interface DatosCinta {
  texto: string // 1–160
}
export interface DatosAnuncio {
  titulo: string // 1–120
  texto: string // 1–600
  imagen_url?: Url | null
  boton_texto?: string | null // ≤ 60
  boton_url?: Url | null
}
export interface DatosPrensa {
  medio: string // 1–80
  titulo?: string | null // ≤ 200
  url?: Url | null
  logo_url?: Url | null
  fecha?: string | null // AAAA-MM-DD
}
export interface DatosFaq {
  categoria: string // 1–60
  pregunta: string // 1–300
  respuesta: string // 1–3000
}
export interface DatosInstagram {
  imagen_url: Url
  url?: Url | null
  texto_alternativo: string // 1–200
}
export interface DatosCifra {
  valor: string // 1–40 («60+», «10», «60 %», «siglo IX»)
  descripcion: string // 1–200
}
export interface DatosEquipo {
  nombre: string // 1–120
  rol: string // 1–120
  bio?: string | null // ≤ 600
  foto_url?: Url | null
}

export interface DatosPorSeccion {
  portada: DatosPortada
  cinta: DatosCinta
  anuncio: DatosAnuncio
  prensa: DatosPrensa
  faq: DatosFaq
  instagram: DatosInstagram
  cifras: DatosCifra
  equipo: DatosEquipo
}

// ─── Panel: /api/admin/contenido-sitio (permiso `contenido_sitio`) ──────────────────────────────────────────
/** Un elemento tal como lo devuelve el panel (`ItemContenido`). Fechas en ISO con zona. */
export interface ItemContenido<S extends SeccionContenido = SeccionContenido> {
  id: string
  seccion: S
  clave: string | null
  orden: number
  datos: DatosPorSeccion[S]
  estado: EstadoContenido
  vigente_desde: string | null
  vigente_hasta: string | null
  /** De dónde salió el dato; la API la exige en `cifras`. */
  fuente: string | null
  /** Sube en cada cambio. El PATCH la manda; si otro la cambió antes, 409. */
  version: number
  actualizado_en: string
  actualizado_por_nombre: string | null
}

/** GET /api/admin/contenido-sitio?seccion=…&incluir_archivados=false → 200 */
export interface ListaContenido {
  items: ItemContenido[]
}

/** POST /api/admin/contenido-sitio → 201 ItemContenido · 409 si la clave ya existe (no archivada) o si se pasa de 8 fotos */
export interface CrearContenido<S extends SeccionContenido = SeccionContenido> {
  seccion: S
  clave?: string | null
  orden?: number
  datos: DatosPorSeccion[S]
  estado?: Exclude<EstadoContenido, 'archivado'> // por omisión 'borrador'
  vigente_desde?: string | null
  vigente_hasta?: string | null
  fuente?: string | null
}

/** PATCH /api/admin/contenido-sitio/{id} → 200 ItemContenido · 409 versión vieja · 404. Solo los campos que cambian;
 *  `datos` se reemplaza completo. Archivar = { estado: 'archivado' }; desarchivar = { estado: 'borrador' }. */
export interface EditarContenido {
  version: number
  clave?: string | null
  orden?: number
  datos?: Record<string, unknown>
  estado?: EstadoContenido
  vigente_desde?: string | null
  vigente_hasta?: string | null
  fuente?: string | null
}

/** POST /api/admin/contenido-sitio/reordenar → 200 ListaContenido (la sección completa, ya ordenada). */
export interface ReordenarContenido {
  seccion: SeccionContenido
  /** Los ids NO archivados de la sección, en el orden nuevo (todos y solo esos; si no, 409). */
  ids: string[]
}

/** Cuerpo de todo 409 del panel de contenido (como ConflictoVersion de planeación). Un 409 sin `codigo` (forma vieja) se
 *  trata igual que `version_vieja`: releer y comparar. */
export type CodigoConflictoContenido = 'version_vieja' | 'clave_repetida' | 'tope_instagram' | 'lista_no_cuadra'
export interface ConflictoContenido {
  detail: string
  codigo: CodigoConflictoContenido
  /** Solo en `version_vieja`: la versión que tiene la base ahora. */
  version_actual?: number
}
export function esConflictoContenido(x: unknown): x is ConflictoContenido {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as { detail?: unknown }).detail === 'string' &&
    ['version_vieja', 'clave_repetida', 'tope_instagram', 'lista_no_cuadra'].includes(
      String((x as { codigo?: unknown }).codigo),
    )
  )
}

/** POST /api/admin/contenido-sitio/imagen (multipart, campo `file`: JPEG, PNG o WebP ≤ 10 MB, lado mayor ≤ 2000 px,
 *  girada según su EXIF) → 201 */
export interface ImagenSubida {
  url: Url // /uploads/contenido-sitio/…
}

// ─── Público: GET /api/contenido-sitio (sin sesión; solo lo PUBLICADO y vigente ahora) ───────────────────────
export interface ElementoPublico<D> {
  id: string
  datos: D
}

/** Lo vacío viene como [] / {} / null: el sitio nuevo pinta la marca FALTA en su lugar. */
export interface ContenidoPublico {
  /** Un elemento por clave (`tagline`, `hero_vive`, `hero_come`; F2 puede agregar las suyas). */
  portada: Record<string, DatosPortada>
  cinta: ElementoPublico<DatosCinta>[]
  /** El anuncio vigente de menor `orden` (o el primero), o null. Vigente = publicado y ahora entre desde y hasta (null = abierto). */
  anuncio: (ElementoPublico<DatosAnuncio> & { vigente_hasta: string | null }) | null
  prensa: ElementoPublico<DatosPrensa>[]
  faq: ElementoPublico<DatosFaq>[]
  /** A lo más 8. */
  instagram: ElementoPublico<DatosInstagram>[]
  /** Por clave: familias, familias_catering, estados, anios, desde, colonias, chinampas, chinampas_abandonadas,
   *  hectareas_urbanas, area_agroecologica, chinampas_desde, estrella_verde (sembradas del Word del 28-oct). */
  cifras: Record<string, DatosCifra>
  equipo: ElementoPublico<DatosEquipo>[]
  generado_en: string
}
