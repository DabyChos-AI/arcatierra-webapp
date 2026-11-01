// R15 v2 · F4 (eventos): la lógica del formulario de solicitud de experiencia privada, sin interfaz. Es la de hoy de
// src/app/experiencias/[slug]/page.tsx (:33-84 las constantes y `detalleLegible`; :161-197 la validación y el cuerpo; :227-263 el canal),
// que vive dentro de esa página y no se puede importar (un `page.tsx` no exporta otra cosa): se escribe de nuevo aquí y una prueba la
// compara con la de hoy en las mismas entradas (contrato v2 D-F4-04, D-F4-07 P-16). La usan /eventos y la ficha de privada (D-F4-07 P-15).
// Los textos son los de hoy, letra por letra; las horas de los horarios y «1»/«500» están en la lista corta (D-F4-07 P-11).
import { formatFechaMexico, hoyMexico } from '@/lib/dates'
import { linkWhatsApp } from '@/lib/whatsapp'
import { CORREO_EXPERIENCIAS } from '@/lib/contacto'

export type HorarioPrivado = 'manana' | 'tarde' | 'noche'
export type MedioContacto = 'whatsapp' | 'email'

/** Los mismos textos que el servidor escribe en el mensaje del lead (`[slug]/page.tsx:37-41` = `experiencias.py:47-51`). */
export const HORARIOS_PRIVADOS: { valor: HorarioPrivado; etiqueta: string }[] = [
  { valor: 'manana', etiqueta: 'Mañana (8:00–12:00)' },
  { valor: 'tarde', etiqueta: 'Tarde (12:00–17:00)' },
  { valor: 'noche', etiqueta: 'Noche (17:00–21:00)' },
]

/** `x@y.z`: la misma revisión que hace el servidor para contactar por correo (`[slug]/page.tsx:44`). */
export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Límites de `SolicitudPrivadaRequest` (`experiencias.py:32-44`; `[slug]/page.tsx:47-52`): lo que no cabe, el servidor lo rechaza. */
export const PERSONAS_MIN = 1
export const PERSONAS_MAX = 500
export const MAX_NOMBRE = 255
export const MAX_EMAIL = 255
export const MAX_TELEFONO = 50
export const MAX_COMENTARIOS = 1500

const CAMPOS_SOLICITUD: Record<string, string> = {
  nombre: 'nombre',
  email: 'correo',
  telefono: 'teléfono',
  medio_contacto: 'medio de contacto',
  fecha_deseada: 'fecha deseada',
  horario: 'horario',
  personas: 'número de personas',
  comentarios: 'comentarios',
}

/** Texto de control de /eventos, donde la experiencia se elige en el formulario (D-F4-07 P-9, C24). */
export const TEXTO_ELIGE_EXPERIENCIA = 'Elige una experiencia'

/**
 * `detail` de FastAPI en texto para el cliente (`[slug]/page.tsx:65-84`): un 400 lo trae como texto; un 422 de Pydantic, como lista de
 * `{loc, msg}` (en inglés), así que se dice qué campos revisar.
 */
export function detalleLegible(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const campos = detail
      .map((d) => {
        if (!d || typeof d !== 'object' || !('loc' in d)) return null
        const loc = (d as { loc: unknown }).loc
        const campo = Array.isArray(loc) ? loc[loc.length - 1] : null
        return typeof campo === 'string' ? CAMPOS_SOLICITUD[campo] ?? null : null
      })
      .filter((c): c is string => c !== null)
    const unicos = Array.from(new Set(campos))
    if (unicos.length > 0) return `Revisa estos datos: ${unicos.join(', ')}.`
  }
  return 'Revisa los datos del formulario.'
}

/** Lo que se escribió en el formulario, tal cual (sin limpiar). */
export type DatosSolicitud = {
  nombre: string
  email: string
  telefono: string
  fecha: string
  horario: HorarioPrivado | ''
  personas: string
  comentarios: string
}

export const DATOS_VACIOS: DatosSolicitud = { nombre: '', email: '', telefono: '', fecha: '', horario: '', personas: '', comentarios: '' }

/** `personas` como la lee hoy (`[slug]/page.tsx:164-165`): vacío = null; si no, `Number` del texto sin espacios. */
export function personasComoNumero(personas: string): number | null {
  const texto = personas.trim()
  return texto === '' ? null : Number(texto)
}

/** La validación de hoy antes de mandar (`[slug]/page.tsx:161-184`), mismo orden y mismos textos: null = se puede mandar. */
export function validarSolicitud(medio: MedioContacto, datos: DatosSolicitud, hoy: string = hoyMexico()): string | null {
  const nombre = datos.nombre.trim()
  const email = datos.email.trim()
  const telefono = datos.telefono.trim()
  const personas = personasComoNumero(datos.personas)
  if (!nombre) return 'Escribe tu nombre'
  if (medio === 'whatsapp' && !telefono) return 'Escribe tu teléfono para que te contactemos por WhatsApp'
  if (medio === 'email' && !CORREO_VALIDO.test(email)) return 'Escribe un correo válido'
  if (datos.fecha && datos.fecha < hoy) return 'La fecha deseada ya pasó'
  if (personas !== null && (!Number.isInteger(personas) || personas < PERSONAS_MIN || personas > PERSONAS_MAX)) {
    return `El número de personas va de ${PERSONAS_MIN} a ${PERSONAS_MAX}`
  }
  return null
}

/** El cuerpo de `POST /api/experiencias/{id}/solicitud-privada` (`[slug]/page.tsx:188-197`), llave por llave; sin `mensaje`. */
export function cuerpoSolicitud(medio: MedioContacto, datos: DatosSolicitud) {
  return {
    nombre: datos.nombre.trim(),
    email: datos.email.trim() || null,
    telefono: datos.telefono.trim() || null,
    medio_contacto: medio,
    fecha_deseada: datos.fecha || null,
    horario: datos.horario || null,
    personas: personasComoNumero(datos.personas),
    comentarios: datos.comentarios.trim() || null,
  }
}

/** Lo que el cliente pidió, también en el texto de WhatsApp o del correo (`[slug]/page.tsx:228-235`). */
function detalles(datos: DatosSolicitud): string[] {
  const horarioTexto = HORARIOS_PRIVADOS.find((h) => h.valor === datos.horario)?.etiqueta
  const personas = personasComoNumero(datos.personas)
  return [
    datos.fecha
      ? `Fecha deseada: ${formatFechaMexico(datos.fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
      : null,
    horarioTexto ? `Horario: ${horarioTexto}` : null,
    personas !== null ? `Personas: ${personas}` : null,
  ].filter((linea): linea is string => linea !== null)
}

/** El enlace de WhatsApp de hoy (`[slug]/page.tsx:237-243`; TEL3: el número sale de `lib/whatsapp.ts`). */
export function enlaceWhatsApp(nombreExperiencia: string, datos: DatosSolicitud): string {
  const msg = [
    `Hola, me interesa la experiencia privada "${nombreExperiencia}". Mi nombre es ${datos.nombre.trim()}.`,
    ...detalles(datos),
  ].join('\n')
  return linkWhatsApp(msg)
}

/** El `mailto:` de hoy (`[slug]/page.tsx:244-262`; MAILC1: el correo de Experiencias de `lib/contacto.ts`). */
export function enlaceCorreo(nombreExperiencia: string, datos: DatosSolicitud): string {
  const subject = encodeURIComponent(`Solicitud experiencia privada: ${nombreExperiencia}`)
  const comentarios = datos.comentarios.trim()
  const body = encodeURIComponent(
    [
      'Hola,',
      '',
      `Me interesa la experiencia privada "${nombreExperiencia}".`,
      '',
      `Nombre: ${datos.nombre.trim()}`,
      `Email: ${datos.email.trim()}`,
      `Teléfono: ${datos.telefono.trim()}`,
      ...detalles(datos),
      ...(comentarios ? [`Comentarios: ${comentarios}`] : []),
      '',
      'Quedo atento/a a su respuesta.',
    ].join('\n'),
  )
  return `mailto:${CORREO_EXPERIENCIAS}?subject=${subject}&body=${body}`
}

/** Hoy (`[slug]/page.tsx:205-214`): 400/422 = el servidor rechazó los datos (se dice por qué y NO se abre el canal); lo demás, se abre. */
export function esRechazo(status: number): boolean {
  return status === 400 || status === 422
}
