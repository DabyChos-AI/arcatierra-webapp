// «Contenido del sitio» (WF7, DR61) — R15 · F1. Funciones puras de la pantalla: campos de cada sección, lectura defensiva
// de las respuestas (llave faltante ≠ pantalla rota), validación igual a la de la API (schemas/contenido_sitio.py) y la
// vigencia del anuncio en hora de México. La forma exacta es `src/types/contenido-sitio.ts` (del líder): aquí no se
// redefine, solo se lee.

import { formatFechaHoraMexico, formatFechaMexico } from '@/lib/dates'
import {
  ESTADOS_CONTENIDO,
  SECCIONES_CON_CLAVE,
  SECCIONES_CONTENIDO,
  esConflictoContenido,
  type CrearContenido,
  type EditarContenido,
  type EstadoContenido,
  type ItemContenido,
  type SeccionContenido,
} from '@/types/contenido-sitio'

// ─── Límites (= schemas/contenido_sitio.py de la API) ───────────────────────────────────────────────────────────────
export const URL_MAX = 2000
export const FUENTE_MAX = 300
export const CLAVE_MAX = 60
export const PATRON_CLAVE = /^[a-z][a-z0-9_]{0,59}$/
export const IMAGEN_MAX_BYTES = 10 * 1024 * 1024
export const IMAGEN_TIPOS = ['image/jpeg', 'image/png', 'image/webp'] as const
const ZONA = 'America/Mexico_City'

// ─── Campos de `datos` por sección ──────────────────────────────────────────────────────────────────────────────────
export type TipoCampo = 'texto' | 'area' | 'url' | 'imagen' | 'fecha'

export interface CampoDatos {
  nombre: string
  etiqueta: string
  tipo: TipoCampo
  requerido: boolean
  /** Máximo de caracteres (las URL: URL_MAX). */
  max: number
  ayuda?: string
}

const AYUDA_URL = 'Empieza con https:// o con / si es una página del sitio.'
const AYUDA_IMAGEN = 'Sube un JPEG, PNG o WebP de hasta 10 MB, o pega la dirección de la imagen.'

export const CAMPOS: Record<SeccionContenido, CampoDatos[]> = {
  portada: [
    { nombre: 'titulo', etiqueta: 'Título', tipo: 'texto', requerido: false, max: 200 },
    { nombre: 'texto', etiqueta: 'Texto', tipo: 'area', requerido: false, max: 1000 },
    { nombre: 'imagen_url', etiqueta: 'Imagen', tipo: 'imagen', requerido: false, max: URL_MAX, ayuda: AYUDA_IMAGEN },
    { nombre: 'enlace_texto', etiqueta: 'Texto del enlace', tipo: 'texto', requerido: false, max: 80 },
    { nombre: 'enlace_url', etiqueta: 'Dirección del enlace', tipo: 'url', requerido: false, max: URL_MAX, ayuda: AYUDA_URL },
  ],
  cinta: [{ nombre: 'texto', etiqueta: 'Texto', tipo: 'texto', requerido: true, max: 160 }],
  anuncio: [
    { nombre: 'titulo', etiqueta: 'Título', tipo: 'texto', requerido: true, max: 120 },
    { nombre: 'texto', etiqueta: 'Texto', tipo: 'area', requerido: true, max: 600 },
    { nombre: 'imagen_url', etiqueta: 'Imagen', tipo: 'imagen', requerido: false, max: URL_MAX, ayuda: AYUDA_IMAGEN },
    { nombre: 'boton_texto', etiqueta: 'Texto del botón', tipo: 'texto', requerido: false, max: 60 },
    { nombre: 'boton_url', etiqueta: 'Dirección del botón', tipo: 'url', requerido: false, max: URL_MAX, ayuda: AYUDA_URL },
  ],
  prensa: [
    { nombre: 'medio', etiqueta: 'Medio', tipo: 'texto', requerido: true, max: 80 },
    { nombre: 'titulo', etiqueta: 'Título de la nota', tipo: 'texto', requerido: false, max: 200 },
    { nombre: 'url', etiqueta: 'Dirección de la nota', tipo: 'url', requerido: false, max: URL_MAX, ayuda: AYUDA_URL },
    { nombre: 'logo_url', etiqueta: 'Logo del medio', tipo: 'imagen', requerido: false, max: URL_MAX, ayuda: AYUDA_IMAGEN },
    { nombre: 'fecha', etiqueta: 'Fecha de la nota', tipo: 'fecha', requerido: false, max: 10 },
  ],
  faq: [
    { nombre: 'categoria', etiqueta: 'Categoría', tipo: 'texto', requerido: true, max: 60 },
    { nombre: 'pregunta', etiqueta: 'Pregunta', tipo: 'texto', requerido: true, max: 300 },
    { nombre: 'respuesta', etiqueta: 'Respuesta', tipo: 'area', requerido: true, max: 3000 },
  ],
  instagram: [
    { nombre: 'imagen_url', etiqueta: 'Foto', tipo: 'imagen', requerido: true, max: URL_MAX, ayuda: AYUDA_IMAGEN },
    {
      nombre: 'texto_alternativo',
      etiqueta: 'Descripción de la foto',
      tipo: 'texto',
      requerido: true,
      max: 200,
      ayuda: 'Lo leen quienes no ven la foto (lectores de pantalla) y Google.',
    },
    { nombre: 'url', etiqueta: 'Dirección de la publicación', tipo: 'url', requerido: false, max: URL_MAX, ayuda: AYUDA_URL },
  ],
  cifras: [
    { nombre: 'valor', etiqueta: 'Cifra', tipo: 'texto', requerido: true, max: 40, ayuda: 'Tal como se ve: «60+», «10», «60 %», «siglo IX».' },
    { nombre: 'descripcion', etiqueta: 'Qué mide', tipo: 'texto', requerido: true, max: 200 },
  ],
  equipo: [
    { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 120 },
    { nombre: 'rol', etiqueta: 'Rol', tipo: 'texto', requerido: true, max: 120 },
    { nombre: 'bio', etiqueta: 'Semblanza', tipo: 'area', requerido: false, max: 600 },
    { nombre: 'foto_url', etiqueta: 'Foto', tipo: 'imagen', requerido: false, max: URL_MAX, ayuda: AYUDA_IMAGEN },
  ],
}

/** Una línea por sección: qué es y cómo la usa el sitio nuevo. */
export const DESCRIPCION_SECCION: Record<SeccionContenido, string> = {
  portada: 'Textos e imágenes de la portada, uno por clave: el sitio nuevo busca cada elemento por su clave.',
  cinta: 'Los avisos cortos de la cinta de arriba del sitio, en el orden de esta lista.',
  anuncio:
    'La ventana que aparece al entrar. Sale el anuncio publicado y vigente que esté más arriba en la lista; la vigencia es en hora de México.',
  prensa: 'Los medios y notas que hablan de Arca Tierra.',
  faq: 'Las preguntas frecuentes, con su categoría.',
  instagram: 'Las fotos de la franja de Instagram: hasta 8 publicadas a la vez.',
  cifras: 'Las cifras del sitio. Cada una lleva su fuente: de dónde sale el dato.',
  equipo: 'Las personas del equipo que muestra el sitio nuevo.',
}

/** Cómo se llama UN elemento de la sección (botón «Agregar …», título del formulario). */
export const NOMBRE_ELEMENTO: Record<SeccionContenido, string> = {
  portada: 'elemento de portada',
  cinta: 'aviso de la cinta',
  anuncio: 'anuncio',
  prensa: 'nota de prensa',
  faq: 'pregunta',
  instagram: 'foto',
  cifras: 'cifra',
  equipo: 'persona',
}

/** Claves que el sitio nuevo lee hoy (contrato: ContenidoPublico); se ofrecen como sugerencia, no se imponen. */
export const CLAVES_SUGERIDAS: Partial<Record<SeccionContenido, string[]>> = {
  portada: ['tagline', 'hero_vive', 'hero_come'],
  cifras: [
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
  ],
}

export const ETIQUETA_ESTADO: Record<EstadoContenido, string> = {
  borrador: 'Borrador',
  publicado: 'Publicado',
  archivado: 'Archivado',
}

export const CLASE_ESTADO: Record<EstadoContenido, string> = {
  borrador: 'bg-amarillo-bg text-verde-tipografia',
  publicado: 'bg-verde/10 text-verde',
  archivado: 'bg-neutro-light text-verde-medio',
}

export function usaClave(seccion: SeccionContenido): boolean {
  return SECCIONES_CON_CLAVE.includes(seccion)
}
export function usaVigencia(seccion: SeccionContenido): boolean {
  return seccion === 'anuncio'
}
export function usaFuente(seccion: SeccionContenido): boolean {
  return seccion === 'cifras'
}
export function esSeccion(v: unknown): v is SeccionContenido {
  return typeof v === 'string' && (SECCIONES_CONTENIDO as readonly string[]).includes(v)
}

// ─── Lectura defensiva ──────────────────────────────────────────────────────────────────────────────────────────────
function textoONull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

export function normalizarItem(cuerpo: unknown): ItemContenido | null {
  if (!cuerpo || typeof cuerpo !== 'object') return null
  const c = cuerpo as Record<string, unknown>
  if (typeof c.id !== 'string' || !esSeccion(c.seccion)) return null
  const estado = (ESTADOS_CONTENIDO as readonly string[]).includes(String(c.estado)) ? (c.estado as EstadoContenido) : 'borrador'
  const datos = c.datos && typeof c.datos === 'object' && !Array.isArray(c.datos) ? c.datos : {}
  const version = Number(c.version)
  const orden = Number(c.orden)
  return {
    id: c.id,
    seccion: c.seccion,
    clave: textoONull(c.clave),
    orden: Number.isFinite(orden) ? orden : 0,
    datos: datos as ItemContenido['datos'],
    estado,
    vigente_desde: textoONull(c.vigente_desde),
    vigente_hasta: textoONull(c.vigente_hasta),
    fuente: textoONull(c.fuente),
    version: Number.isFinite(version) && version >= 1 ? version : 1,
    actualizado_en: typeof c.actualizado_en === 'string' ? c.actualizado_en : '',
    actualizado_por_nombre: textoONull(c.actualizado_por_nombre),
  }
}

/** Lista de una sección, en el orden del sitio (orden y luego la fecha de cambio). */
export function normalizarLista(cuerpo: unknown, seccion: SeccionContenido): ItemContenido[] {
  const items = cuerpo && typeof cuerpo === 'object' ? (cuerpo as { items?: unknown }).items : null
  if (!Array.isArray(items)) return []
  return items
    .map(normalizarItem)
    .filter((i): i is ItemContenido => i !== null && i.seccion === seccion)
    .sort((a, b) => a.orden - b.orden)
}

/** Todas las secciones (GET sin `seccion`), en el orden de las pestañas y luego `orden`. */
export function normalizarTodos(cuerpo: unknown): ItemContenido[] {
  const items = cuerpo && typeof cuerpo === 'object' ? (cuerpo as { items?: unknown }).items : null
  if (!Array.isArray(items)) return []
  const pos = (s: SeccionContenido) => SECCIONES_CONTENIDO.indexOf(s)
  return items
    .map(normalizarItem)
    .filter((i): i is ItemContenido => i !== null)
    .sort((a, b) => pos(a.seccion) - pos(b.seccion) || a.orden - b.orden)
}

/** Lee un campo de `datos` como texto (lo que no es texto = vacío). */
export function dato(item: Pick<ItemContenido, 'datos'>, campo: string): string {
  const v = (item.datos as unknown as Record<string, unknown>)[campo]
  return typeof v === 'string' ? v : ''
}

/** Título y renglón secundario de un elemento en la lista. */
export function resumen(item: ItemContenido): { titulo: string; detalle: string } {
  const d = (campo: string) => dato(item, campo).trim()
  switch (item.seccion) {
    case 'portada':
      return { titulo: d('titulo') || d('texto') || 'Sin título', detalle: d('titulo') ? d('texto') : '' }
    case 'cinta':
      return { titulo: d('texto') || 'Sin texto', detalle: '' }
    case 'anuncio':
      return { titulo: d('titulo') || 'Sin título', detalle: d('texto') }
    case 'prensa':
      return { titulo: d('medio') || 'Sin medio', detalle: [d('titulo'), d('fecha') ? fechaCorta(d('fecha')) : ''].filter(Boolean).join(' · ') }
    case 'faq':
      return { titulo: d('pregunta') || 'Sin pregunta', detalle: d('categoria') }
    case 'instagram':
      return { titulo: d('texto_alternativo') || 'Sin descripción', detalle: d('url') }
    case 'cifras':
      return { titulo: [d('valor'), d('descripcion')].filter(Boolean).join(' · ') || 'Sin cifra', detalle: '' }
    case 'equipo':
      return { titulo: d('nombre') || 'Sin nombre', detalle: d('rol') }
  }
}

/** La imagen que representa al elemento en la lista (o null). */
export function imagenDe(item: ItemContenido): string | null {
  const campo = CAMPOS[item.seccion].find((c) => c.tipo === 'imagen')
  if (!campo) return null
  const v = dato(item, campo.nombre).trim()
  return v && urlValida(v) ? v : null
}

function fechaCorta(iso: string): string {
  const t = formatFechaMexico(iso)
  return t === '-' ? iso : t
}

/** «Último cambio: 28 oct 2026, 10:42 · Nombre» (sin nombre registrado: «Sistema», como Días sin entrega). */
export function textoUltimoCambio(item: ItemContenido): string {
  const cuando = item.actualizado_en ? formatFechaHoraMexico(item.actualizado_en) : ''
  const quien = item.actualizado_por_nombre ?? 'Sistema'
  return [cuando && cuando !== '-' ? cuando : null, quien].filter(Boolean).join(' · ')
}

// ─── Validación (espejo de la API; la de verdad vive allá) ─────────────────────────────────────────────────────────
/** http(s)://host… o una ruta del sitio que empieza con «/» (no «//»); sin espacios, «\» ni caracteres de control. */
export function urlValida(valor: string): boolean {
  if (!valor || valor.length > URL_MAX) return false
  // Espacios, «\» y caracteres de control o de formato (Unicode Cc/Cf), como la API.
  for (const ch of valor) {
    const c = ch.codePointAt(0) ?? 0
    if (ch === '\\' || /\s/.test(ch)) return false
    if (c <= 0x1f || (c >= 0x7f && c <= 0x9f)) return false
    if (c === 0xad || (c >= 0x200b && c <= 0x200f) || (c >= 0x202a && c <= 0x202e) || (c >= 0x2060 && c <= 0x2064)) return false
    if (c === 0xfeff || (c >= 0xfff9 && c <= 0xfffb)) return false
  }
  if (valor.startsWith('/')) return !valor.startsWith('//')
  if (!/^https?:\/\//i.test(valor)) return false
  try {
    const u = new URL(valor)
    return (u.protocol === 'http:' || u.protocol === 'https:') && Boolean(u.hostname)
  } catch {
    return false
  }
}

/** El formulario: los campos de `datos` como texto, más clave, fuente y la vigencia (datetime-local de México). */
export type Formulario = Record<string, string>

export const CAMPO_CLAVE = '__clave'
export const CAMPO_FUENTE = '__fuente'
export const CAMPO_DESDE = '__desde'
export const CAMPO_HASTA = '__hasta'

export function formularioVacio(seccion: SeccionContenido): Formulario {
  const f: Formulario = { [CAMPO_CLAVE]: '', [CAMPO_FUENTE]: '', [CAMPO_DESDE]: '', [CAMPO_HASTA]: '' }
  for (const c of CAMPOS[seccion]) f[c.nombre] = ''
  return f
}

export function formularioDe(item: ItemContenido): Formulario {
  const f = formularioVacio(item.seccion)
  for (const c of CAMPOS[item.seccion]) f[c.nombre] = dato(item, c.nombre)
  f[CAMPO_CLAVE] = item.clave ?? ''
  f[CAMPO_FUENTE] = item.fuente ?? ''
  f[CAMPO_DESDE] = isoAMexicoLocal(item.vigente_desde)
  f[CAMPO_HASTA] = isoAMexicoLocal(item.vigente_hasta)
  return f
}

/** `datos` completo (la API lo reemplaza entero): obligatorios recortados; opcionales vacíos = null. */
export function datosDe(seccion: SeccionContenido, f: Formulario): Record<string, string | null> {
  const datos: Record<string, string | null> = {}
  for (const c of CAMPOS[seccion]) {
    const v = (f[c.nombre] ?? '').trim()
    datos[c.nombre] = c.requerido ? v : v || null
  }
  return datos
}

/** Errores por campo (vacío = se puede guardar). */
export function validar(seccion: SeccionContenido, f: Formulario): Record<string, string> {
  const errores: Record<string, string> = {}
  for (const c of CAMPOS[seccion]) {
    const v = (f[c.nombre] ?? '').trim()
    if (!v) {
      if (c.requerido) errores[c.nombre] = c.tipo === 'imagen' ? `Falta ${c.etiqueta.toLowerCase()}: súbela o pega su dirección.` : `Escribe ${c.etiqueta.toLowerCase()}.`
      continue
    }
    if (v.length > c.max) errores[c.nombre] = `Máximo ${c.max} caracteres (lleva ${v.length}).`
    else if ((c.tipo === 'url' || c.tipo === 'imagen') && !urlValida(v))
      errores[c.nombre] = 'Debe empezar con https://, http:// o / (sin espacios).'
    else if (c.tipo === 'fecha' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errores[c.nombre] = 'Fecha con formato AAAA-MM-DD.'
  }
  if (usaClave(seccion)) {
    const clave = (f[CAMPO_CLAVE] ?? '').trim()
    if (!clave) errores[CAMPO_CLAVE] = 'Escribe la clave.'
    else if (!PATRON_CLAVE.test(clave))
      errores[CAMPO_CLAVE] = 'Solo minúsculas sin acentos, números y «_»; empieza con letra (máximo 60).'
  }
  if (usaFuente(seccion)) {
    const fuente = (f[CAMPO_FUENTE] ?? '').trim()
    if (!fuente) errores[CAMPO_FUENTE] = 'Escribe la fuente: de dónde sale el dato.'
    else if (fuente.length > FUENTE_MAX) errores[CAMPO_FUENTE] = `Máximo ${FUENTE_MAX} caracteres (lleva ${fuente.length}).`
  }
  if (usaVigencia(seccion)) {
    const desde = f[CAMPO_DESDE] ? mexicoLocalAISO(f[CAMPO_DESDE]) : null
    const hasta = f[CAMPO_HASTA] ? mexicoLocalAISO(f[CAMPO_HASTA]) : null
    if (f[CAMPO_DESDE] && !desde) errores[CAMPO_DESDE] = 'Fecha y hora incompletas.'
    if (f[CAMPO_HASTA] && !hasta) errores[CAMPO_HASTA] = 'Fecha y hora incompletas.'
    if (desde && hasta && Date.parse(hasta) <= Date.parse(desde)) errores[CAMPO_HASTA] = 'Debe ser después de «Desde».'
  }
  return errores
}

/** Cuerpo del POST (alta). `orden` al final de la lista; estado borrador o publicado. */
export function cuerpoCrear(
  seccion: SeccionContenido,
  f: Formulario,
  orden: number,
  publicar: boolean,
): CrearContenido {
  const cuerpo: CrearContenido = {
    seccion,
    orden,
    datos: datosDe(seccion, f) as unknown as CrearContenido['datos'],
    estado: publicar ? 'publicado' : 'borrador',
  }
  if (usaClave(seccion)) cuerpo.clave = f[CAMPO_CLAVE].trim()
  if (usaFuente(seccion)) cuerpo.fuente = f[CAMPO_FUENTE].trim()
  if (usaVigencia(seccion)) {
    cuerpo.vigente_desde = f[CAMPO_DESDE] ? mexicoLocalAISO(f[CAMPO_DESDE]) : null
    cuerpo.vigente_hasta = f[CAMPO_HASTA] ? mexicoLocalAISO(f[CAMPO_HASTA]) : null
  }
  return cuerpo
}

/** Cuerpo del PATCH: `version` + solo lo que cambió (datos completo si cambió algún campo). null = nada que mandar. */
export function cuerpoEditar(base: ItemContenido, f: Formulario): EditarContenido | null {
  const cuerpo: EditarContenido = { version: base.version }
  const antes = formularioDe(base)
  const cambioDatos = CAMPOS[base.seccion].some((c) => (f[c.nombre] ?? '').trim() !== (antes[c.nombre] ?? '').trim())
  if (cambioDatos) cuerpo.datos = datosDe(base.seccion, f)
  if (usaClave(base.seccion) && f[CAMPO_CLAVE].trim() !== antes[CAMPO_CLAVE].trim()) cuerpo.clave = f[CAMPO_CLAVE].trim()
  if (usaFuente(base.seccion) && f[CAMPO_FUENTE].trim() !== antes[CAMPO_FUENTE].trim()) cuerpo.fuente = f[CAMPO_FUENTE].trim()
  if (usaVigencia(base.seccion)) {
    if (f[CAMPO_DESDE] !== antes[CAMPO_DESDE]) cuerpo.vigente_desde = f[CAMPO_DESDE] ? mexicoLocalAISO(f[CAMPO_DESDE]) : null
    if (f[CAMPO_HASTA] !== antes[CAMPO_HASTA]) cuerpo.vigente_hasta = f[CAMPO_HASTA] ? mexicoLocalAISO(f[CAMPO_HASTA]) : null
  }
  return Object.keys(cuerpo).length > 1 ? cuerpo : null
}

// ─── Vigencia en hora de México ─────────────────────────────────────────────────────────────────────────────────────
const PARTES_MX = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function partesMexico(ms: number): Record<string, number> {
  const p: Record<string, number> = {}
  for (const parte of PARTES_MX.formatToParts(new Date(ms))) if (parte.type !== 'literal') p[parte.type] = Number(parte.value)
  return p
}

/** Minutos que México está detrás/adelante de UTC en ese instante (−360 = UTC−6). */
function desfaseMexico(ms: number): number {
  const p = partesMexico(ms)
  const comoUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return Math.round((comoUtc - Math.floor(ms / 1000) * 1000) / 60000)
}

/** ISO de la API → «AAAA-MM-DDTHH:mm» de México para un <input type="datetime-local">. Vacío si no hay. */
export function isoAMexicoLocal(iso: string | null): string {
  if (!iso) return ''
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return ''
  const p = partesMexico(ms)
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${p.year}-${dos(p.month)}-${dos(p.day)}T${dos(p.hour)}:${dos(p.minute)}`
}

/** «AAAA-MM-DDTHH:mm» que la persona escribió en hora de México → ISO con el desfase de México (p. ej. −06:00). */
export function mexicoLocalAISO(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local)
  if (!m) return null
  const [anio, mes, dia, hora, minuto] = m.slice(1).map(Number)
  const comoUtc = Date.UTC(anio, mes - 1, dia, hora, minuto)
  let desfase = desfaseMexico(comoUtc)
  desfase = desfaseMexico(comoUtc - desfase * 60000) // por si el instante cae en otro desfase
  const signo = desfase <= 0 ? '-' : '+'
  const abs = Math.abs(desfase)
  return `${local}:00${signo}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
}

export type EstadoVigencia = 'vigente' | 'programado' | 'vencido'

export function estadoVigencia(item: Pick<ItemContenido, 'vigente_desde' | 'vigente_hasta'>, ahora = Date.now()): EstadoVigencia {
  const desde = item.vigente_desde ? Date.parse(item.vigente_desde) : null
  const hasta = item.vigente_hasta ? Date.parse(item.vigente_hasta) : null
  if (desde !== null && Number.isFinite(desde) && ahora < desde) return 'programado'
  if (hasta !== null && Number.isFinite(hasta) && ahora >= hasta) return 'vencido'
  return 'vigente'
}

export const ETIQUETA_VIGENCIA: Record<EstadoVigencia, string> = {
  vigente: 'Vigente ahora',
  programado: 'Programado',
  vencido: 'Vencido',
}

/** «Del 1 nov 2026, 09:00 al 3 nov 2026, 18:00 (hora de México)» / «Desde …» / «Hasta …» / «Sin fechas». */
export function textoVigencia(item: Pick<ItemContenido, 'vigente_desde' | 'vigente_hasta'>): string {
  const f = (iso: string) => formatFechaHoraMexico(iso)
  const { vigente_desde: d, vigente_hasta: h } = item
  if (d && h) return `Del ${f(d)} al ${f(h)} (hora de México)`
  if (d) return `Desde el ${f(d)}, sin fecha de fin (hora de México)`
  if (h) return `Hasta el ${f(h)} (hora de México)`
  return 'Sin fechas: sale mientras esté publicado'
}

// ─── Errores de la API ──────────────────────────────────────────────────────────────────────────────────────────────
export type ResultadoError =
  | { tipo: 'version' }
  | { tipo: 'conflicto'; texto: string }
  | { tipo: 'sesion' }
  | { tipo: 'permiso'; texto: string }
  | { tipo: 'otro'; texto: string }

/** Clasifica un error. Un 409 sin `codigo` (forma vieja) cuenta como versión (contrato: releer y comparar). */
export function clasificarError(status: number, cuerpo: unknown, texto: string): ResultadoError {
  if (status === 401) return { tipo: 'sesion' }
  if (status === 403) return { tipo: 'permiso', texto }
  if (status === 409) {
    if (esConflictoContenido(cuerpo) && cuerpo.codigo !== 'version_vieja') return { tipo: 'conflicto', texto: cuerpo.detail }
    return { tipo: 'version' }
  }
  return { tipo: 'otro', texto }
}

export const TEXTO_VERSION =
  'Otra persona guardó cambios en este elemento mientras lo editabas. Ya cargamos su versión (abajo); lo que escribiste sigue en el formulario. Revísalo y vuelve a guardar para reemplazarla.'
export const TEXTO_VERSION_LISTA = 'Otra persona cambió este elemento hace un momento. Ya recargamos la lista: vuelve a intentarlo.'
export const TEXTO_SIN_PERMISO = 'Tu rol no tiene permiso para «Contenido del sitio». Pídeselo a quien administra el panel.'
export const TEXTO_SESION = 'Tu sesión expiró. Vuelve a iniciar sesión.'
