// R15 v2 · F4 (catering): la lógica de los dos formularios de /catering del sitio nuevo, sin interfaz (contrato v2 §9-F4 D-F4-04, D-F4-09).
//
// Una sola ruta, la de hoy: POST /api/catering/solicitud (pública, 5 por minuto, `extra="forbid"`; `routers/catering.py:57-75`,
// CATALOGO-API.md:548). Directa con `API_URL`, como hoy. Los textos son los de hoy, letra por letra, con su línea; el código de hoy no se toca
// (D-F3-06): sus funciones no se exportan, así que aquí se escriben de nuevo y una prueba de la entrega las compara con las de hoy en las
// mismas entradas (`f4-catering/pruebas/solicitud-contra-hoy.mjs`).
// 1) «Cotiza tu evento» = los campos del formulario de hoy de /catering (`components/catering/QuoteRequestModal.tsx`), con el cuerpo como
//    subconjunto de las llaves que hoy manda `app/catering/contacto/page.tsx:78-90`: el lugar va en `ubicacion` (D-F4-09 P-3).
// 2) La propuesta corporativa = la de hoy (`components/catering/CorporateRequestModal.tsx:42-195`), mismo cuerpo y textos (D-F4-09 P-5).
// El «24 horas» de los textos de hoy no se escribe: va con la marca de David (PROM1, D-F4-09 P-2).
import { API_URL } from '@/lib/api'
import { CORREO_CATERING } from './contactoCatering'

/** El cuerpo de `CateringSolicitudRequest` (`catering.py:57-71`); solo las llaves que mandan los formularios de hoy. */
export type CuerpoSolicitud = {
  nombre: string
  email: string
  telefono: string | null
  tipo_evento: string | null
  fecha_evento: string | null
  numero_personas: number | null
  empresa?: string | null
  ubicacion?: string | null
  mensaje: string | null
}

/** La misma revisión de correo en los tres formularios de hoy (`QuoteRequestModal.tsx:45`, `contacto/page.tsx:73`, `CorporateRequestModal.tsx:58`). */
export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Respaldo de hoy sin cifras cuando la API no trae `message` (`CorporateRequestModal.tsx:56`; D-F4-09 P-10). */
export const TEXTO_RECIBIDA = 'Solicitud recibida. Te contactaremos pronto.'

// ───────────────────────── 1 · «Cotiza tu evento» (QuoteRequestModal.tsx) ─────────────────────────

export type CampoCotizacion = 'nombre' | 'correo' | 'telefono' | 'tipo' | 'personas' | 'fecha' | 'lugar' | 'mensaje'
export type FormCotizacion = Record<CampoCotizacion, string>

export const COTIZACION_VACIA: FormCotizacion = {
  nombre: '',
  correo: '',
  telefono: '',
  tipo: '',
  personas: '',
  fecha: '',
  lugar: '',
  mensaje: '',
}

/** Los tipos del formulario de hoy de /catering (`QuoteRequestModal.tsx:114-122`). */
export const TIPOS_COTIZACION = ['Boda', 'Corporativo', 'Cumpleaños', 'Aniversario', 'Baby shower', 'Bridal shower', 'Otro'] as const

export const TEXTO_FALTA_NOMBRE = 'Por favor ingresa tu nombre completo.' // QuoteRequestModal.tsx:42
export const TEXTO_CORREO_INVALIDO = 'Por favor ingresa un correo electrónico válido.' // QuoteRequestModal.tsx:46
export const TEXTO_NO_SE_PUDO = 'No se pudo enviar la solicitud, intenta de nuevo.' // QuoteRequestModal.tsx:87, :97

/** La revisión de hoy al enviar (`QuoteRequestModal.tsx:39-48`): primero el nombre, después el correo. */
export function errorCotizacion(f: FormCotizacion): { campo: 'nombre' | 'correo'; motivo: string } | null {
  if (!f.nombre.trim()) return { campo: 'nombre', motivo: TEXTO_FALTA_NOMBRE }
  const correo = f.correo.trim()
  if (!correo || !CORREO_VALIDO.test(correo)) return { campo: 'correo', motivo: TEXTO_CORREO_INVALIDO }
  return null
}

/**
 * El cuerpo (`QuoteRequestModal.tsx:50-68`, con el lugar en `ubicacion` como `contacto/page.tsx:86` y el mensaje solo con el texto libre
 * como `contacto/page.tsx:89`). Mismo orden de llaves que `contacto/page.tsx:78-90`.
 */
export function cuerpoCotizacion(f: FormCotizacion): CuerpoSolicitud {
  const invitados = f.personas ? Number(f.personas) : NaN
  return {
    nombre: f.nombre.trim(),
    email: f.correo.trim(),
    telefono: f.telefono || null,
    tipo_evento: f.tipo || null,
    fecha_evento: f.fecha || null,
    numero_personas: Number.isFinite(invitados) && invitados > 0 ? Math.floor(invitados) : null,
    ubicacion: f.lugar || null,
    mensaje: f.mensaje || null,
  }
}

/** El error que se pinta (`QuoteRequestModal.tsx:78-98`): el `detail` si es texto; si no, el de hoy. */
export function textoErrorCotizacion(r: RespuestaFallida): string {
  return typeof r.detail === 'string' && r.detail.trim() ? r.detail : TEXTO_NO_SE_PUDO
}

// ───────────────────────── 2 · Propuesta corporativa (CorporateRequestModal.tsx) ─────────────────────────

export type CampoCorporativo = 'nombre' | 'empresa' | 'correo' | 'telefono' | 'tipo' | 'asistentes' | 'fecha' | 'mensaje'
export type FormCorporativo = Record<CampoCorporativo, string>

export const CORPORATIVO_VACIO: FormCorporativo = {
  nombre: '',
  empresa: '',
  correo: '',
  telefono: '',
  tipo: '',
  asistentes: '',
  fecha: '',
  mensaje: '',
}

/** Los tipos de hoy (`CorporateRequestModal.tsx:343-347`): el valor va a la API y la etiqueta se pinta. */
export const TIPOS_CORPORATIVO: ReadonlyArray<{ valor: string; etiqueta: string }> = [
  { valor: 'Corporativo', etiqueta: 'Evento corporativo' },
  { valor: 'Celebración', etiqueta: 'Celebración privada' },
  { valor: 'Lanzamiento', etiqueta: 'Lanzamiento de producto' },
  { valor: 'Conferencia', etiqueta: 'Conferencia' },
  { valor: 'Otro', etiqueta: 'Otro' },
]

/** Los rangos de hoy (`CorporateRequestModal.tsx:42-48`; en la lista corta por D-F4-09 P-7). */
export const ASISTENTES: ReadonlyArray<{ valor: string; etiqueta: string }> = [
  { valor: '10-30', etiqueta: '10-30 personas' },
  { valor: '31-50', etiqueta: '31-50 personas' },
  { valor: '51-100', etiqueta: '51-100 personas' },
  { valor: '101-200', etiqueta: '101-200 personas' },
  { valor: '201+', etiqueta: 'Más de 200 personas' },
]

/** Topes de hoy (`CorporateRequestModal.tsx:52-53`; no se pintan). */
export const MAXIMO_CORPORATIVO = { nombre: 120, empresa: 160, correo: 254, telefono: 30, mensaje: 1800 } as const
export const MENSAJE_MAXIMO_API = 2000

/** `CorporateRequestModal.tsx:57`, con el correo de catering de `contactoCatering.ts`. */
export const TEXTO_NO_ENVIADA = `No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos a ${CORREO_CATERING}.`

/** `CorporateRequestModal.tsx:60-68`. */
const ETIQUETA_CAMPO_API: Record<string, string> = {
  nombre: 'tu nombre',
  email: 'el correo',
  telefono: 'el teléfono',
  empresa: 'la empresa',
  tipo_evento: 'el tipo de evento',
  fecha_evento: 'la fecha',
  mensaje: 'los detalles',
}

/** El primer dato que falta o está mal (`CorporateRequestModal.tsx:71-79`, mismos textos y orden). */
export function campoInvalidoCorporativo(f: FormCorporativo): { campo: CampoCorporativo; motivo: string } | null {
  if (!f.nombre.trim()) return { campo: 'nombre', motivo: 'Escribe tu nombre.' }
  if (!f.empresa.trim()) return { campo: 'empresa', motivo: 'Escribe el nombre de la empresa.' }
  if (!CORREO_VALIDO.test(f.correo.trim())) return { campo: 'correo', motivo: 'Escribe un correo válido.' }
  if (!f.telefono.trim()) return { campo: 'telefono', motivo: 'Escribe tu teléfono.' }
  if (!f.tipo) return { campo: 'tipo', motivo: 'Elige el tipo de evento.' }
  if (!f.asistentes) return { campo: 'asistentes', motivo: 'Elige el número estimado de asistentes.' }
  return null
}

/** `mensaje` = de dónde viene + los asistentes + el texto libre (`CorporateRequestModal.tsx:82-88`). */
export function mensajeCorporativo(f: FormCorporativo): string {
  const asistentes = ASISTENTES.find((a) => a.valor === f.asistentes)?.etiqueta ?? f.asistentes
  const lineas = ['Propuesta corporativa (formulario de /catering).', `Asistentes estimados: ${asistentes}.`]
  const libre = f.mensaje.trim()
  if (libre) lineas.push('', libre)
  return lineas.join('\n').slice(0, MENSAJE_MAXIMO_API)
}

/** El cuerpo de hoy (`CorporateRequestModal.tsx:159-168`), mismas llaves y mismo orden. */
export function cuerpoCorporativo(f: FormCorporativo): CuerpoSolicitud {
  return {
    nombre: f.nombre.trim(),
    email: f.correo.trim(),
    telefono: f.telefono.trim() || null,
    tipo_evento: f.tipo || null,
    fecha_evento: f.fecha || null,
    numero_personas: null,
    empresa: f.empresa.trim() || null,
    mensaje: mensajeCorporativo(f),
  }
}

/** `detail` de FastAPI en texto (`CorporateRequestModal.tsx:91-105`). */
export function detalleLegible(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const campos = detail
      .map((d) => {
        const loc = d && typeof d === 'object' && 'loc' in d ? (d as { loc: unknown }).loc : null
        const campo = Array.isArray(loc) ? loc[loc.length - 1] : null
        return typeof campo === 'string' && campo in ETIQUETA_CAMPO_API ? ETIQUETA_CAMPO_API[campo] : null
      })
      .filter((c): c is string => c !== null)
    const unicos = Array.from(new Set(campos))
    if (unicos.length > 0) return `Revisa ${unicos.join(', ')}.`
  }
  return 'Revisa los datos del formulario.'
}

/** El error que se pinta (`CorporateRequestModal.tsx:186-191`): un 4xx con su `detail` legible; 5xx o sin red, el texto de hoy. */
export function textoErrorCorporativo(r: RespuestaFallida): string {
  return r.status !== null && r.status >= 400 && r.status < 500 ? detalleLegible(r.detail) : TEXTO_NO_ENVIADA
}

// ───────────────────────── El envío (los dos) ─────────────────────────

export type RespuestaFallida = { ok: false; status: number | null; detail: unknown }
export type RespuestaSolicitud = { ok: true; mensaje: string | null } | RespuestaFallida

/** POST /api/catering/solicitud con el cuerpo tal cual (como hoy: `QuoteRequestModal.tsx:73-77`, `CorporateRequestModal.tsx:173-177`). */
export async function enviarSolicitud(cuerpo: CuerpoSolicitud): Promise<RespuestaSolicitud> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api/catering/solicitud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
  } catch {
    return { ok: false, status: null, detail: null }
  }
  const datos: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const detail = datos && typeof datos === 'object' && 'detail' in datos ? (datos as { detail?: unknown }).detail : null
    return { ok: false, status: res.status, detail }
  }
  const message = datos && typeof datos === 'object' ? (datos as { message?: unknown }).message : null
  return { ok: true, mensaje: typeof message === 'string' && message.trim() ? message : null }
}
