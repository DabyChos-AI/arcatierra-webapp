// R15 v2 · F5 (contacto): la lógica del formulario de /contacto de HOY, sin interfaz, para el sitio nuevo. Contrato v2 §9-F5 D-F5-04,
// D-F5-11 (P-6, P-7); cadena-v2/f5/contacto-F5.md §6.
// - Hoy vive dentro de `src/app/contacto/page.tsx` (`'use client'`; un `page.tsx` no exporta otra cosa), así que se escribe aquí de nuevo
//   (D-F3-06) y `f5-contacto/pruebas/mensaje-contra-hoy.mjs` la compara con la de hoy en las mismas entradas: topes (`:26`), etiquetas de
//   campo (`:27-33`), textos (`:34-35`), correo válido (`:36`), `campoInvalido` (`:39-45`), `detalleLegible` (`:48-62`), el cuerpo
//   (`:101-108`) y la respuesta (`:117-129`).
// - La ruta es la de hoy: `POST ${API_URL}/api/contacto` (pública, 5/min, 201; `routers/contacto.py:66`). El cuerpo es `ContactoPayload`
//   (`src/types/mensajes.ts:8-16`; el modelo tiene `extra="forbid"`): ni una llave más.
// - Lo único distinto de hoy es dónde se avisa (en la página, no en el aviso flotante): eso lo pinta `FormularioContacto.tsx`.
import { API_URL } from '@/lib/api'
import type { ContactoPayload } from '@/types/mensajes'

export interface FormContacto {
  nombre: string
  email: string
  asunto: string
  mensaje: string
}
export type CampoContacto = keyof FormContacto | 'privacidad'

export const FORM_VACIO: FormContacto = { nombre: '', email: '', asunto: '', mensaje: '' }
/** Topes del modelo (`routers/contacto.py:48-51`; correo 255 como hoy). No se pintan. */
export const MAXIMO: Record<keyof FormContacto, number> = { nombre: 120, email: 255, asunto: 150, mensaje: 5000 }
export const ETIQUETA_CAMPO: Record<string, string> = {
  nombre: 'tu nombre',
  email: 'el correo',
  asunto: 'el asunto',
  mensaje: 'el mensaje',
  acepto_privacidad: 'la casilla de privacidad',
}
export const TEXTO_ENVIADO = 'Recibimos tu mensaje. Te respondemos por correo.'
export const TEXTO_NO_ENVIADO = 'No pudimos enviar tu mensaje. Intenta de nuevo en un momento.'
export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** El primer dato que falta o está mal, o null si todo sirve (el backend valida igual). */
export function campoInvalido(f: FormContacto, acepto: boolean): { campo: CampoContacto; motivo: string } | null {
  if (f.nombre.trim().length < 2) return { campo: 'nombre', motivo: 'Escribe tu nombre.' }
  if (!CORREO_VALIDO.test(f.email.trim())) return { campo: 'email', motivo: 'Escribe un correo válido.' }
  if (!f.mensaje.trim()) return { campo: 'mensaje', motivo: 'Escribe tu mensaje.' }
  if (!acepto) return { campo: 'privacidad', motivo: 'Para enviarlo, acepta la Política de Privacidad.' }
  return null
}

/** `detail` de FastAPI en texto: un 4xx lo trae como texto; un 422 de Pydantic, como lista de `{loc, msg}`. */
export function detalleLegible(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const campos = detail
      .map((d) => {
        const loc = d && typeof d === 'object' && 'loc' in d ? (d as { loc: unknown }).loc : null
        const campo = Array.isArray(loc) ? loc[loc.length - 1] : null
        return typeof campo === 'string' && campo in ETIQUETA_CAMPO ? ETIQUETA_CAMPO[campo] : null
      })
      .filter((c): c is string => c !== null)
    const unicos = Array.from(new Set(campos))
    if (unicos.length > 0) return `Revisa ${unicos.join(', ')}.`
  }
  return 'Revisa los datos del formulario.'
}

/** El cuerpo de hoy (`:101-108`). `sitio` lleva lo que traiga la trampa (vacío para una persona). */
export function cuerpoMensaje(f: FormContacto, sitio: string): ContactoPayload {
  const asunto = f.asunto.trim()
  return {
    nombre: f.nombre.trim(),
    email: f.email.trim(),
    asunto: asunto || null,
    mensaje: f.mensaje.trim(),
    acepto_privacidad: true,
    sitio,
  }
}

export type ResultadoMensaje = { ok: true; texto: string } | { ok: false; texto: string }

/** Lee la respuesta como hoy (`:117-129`): éxito = el `message` de la API o `TEXTO_ENVIADO`; 4xx = `detalleLegible`; lo demás = `TEXTO_NO_ENVIADO`. */
export function leerRespuesta(status: number, ok: boolean, datos: unknown): ResultadoMensaje {
  if (ok) {
    const message = datos && typeof datos === 'object' ? (datos as { message?: unknown }).message : null
    return { ok: true, texto: typeof message === 'string' && message.trim() ? message : TEXTO_ENVIADO }
  }
  const detail = datos && typeof datos === 'object' ? (datos as { detail?: unknown }).detail : null
  return { ok: false, texto: status >= 400 && status < 500 ? detalleLegible(detail) : TEXTO_NO_ENVIADO }
}

/** Manda el mensaje a la ruta de hoy. Sin red o con un error del navegador: `TEXTO_NO_ENVIADO`, como hoy (`:128-129`). */
export async function enviarMensaje(body: ContactoPayload): Promise<ResultadoMensaje> {
  try {
    const res = await fetch(`${API_URL}/api/contacto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const datos: unknown = await res.json().catch(() => null)
    return leerRespuesta(res.status, res.ok, datos)
  } catch {
    return { ok: false, texto: TEXTO_NO_ENVIADO }
  }
}
