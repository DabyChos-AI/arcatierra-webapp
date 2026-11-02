// R15 v2 · F6 (acceso): la lógica de hoy de /auth/signin, /auth/recuperar y /auth/restablecer que vive DENTRO de sus páginas (un page.tsx no
// exporta nada más), reescrita aquí sin interfaz ni I/O. Contrato v2 §8-F6, D-F6-04, D-F6-09; cadena-v2/f6/acceso-F6.md §6.3.
// La prueba `f6-acceso/pruebas/reglas-contra-hoy.mjs` saca las piezas de los archivos de hoy con el AST de TypeScript (sin tocarlos) y compara.
// Los textos de recuperar y restablecer NO se copian: se importan de `src/app/auth/recuperar/textos.ts` (módulo puro de hoy; D-F6-09 P-5).

import { PASSWORD_MIN, type CodigoEnlaceInvalido } from '@/types/cuenta'
import {
  PASSWORD_MAX,
  TEXTO_CORREO_INVALIDO,
  TEXTO_DEMASIADOS,
  TEXTO_ERROR_SERVIDOR,
  TEXTO_PASSWORD_CORTA,
  TEXTO_RECUPERAR_ENVIADO,
  TEXTO_RESTABLECIDO,
  enlaceInvalidoDe,
  mensajeDe,
} from '@/app/auth/recuperar/textos'

export { PASSWORD_MIN, PASSWORD_MAX }

/** A dónde va la persona después de entrar si no trae un `callbackUrl` válido (`auth/signin/page.tsx:11`, ACC1-a). */
export const DESTINO_POR_OMISION = '/usuario/dashboard'

/**
 * `destinoTrasLogin` de hoy (`auth/signin/page.tsx:43-55`) sin leer `window`: el `callbackUrl` de la búsqueda SOLO si es del mismo origen
 * (pathname + search); si no viene, no se puede leer o es de otro origen, `DESTINO_POR_OMISION` (un `callbackUrl` externo sería un
 * redirect abierto).
 */
export function destinoTrasLogin(busqueda: string, origen: string): string {
  const cb = new URLSearchParams(busqueda).get('callbackUrl')
  if (!cb) return DESTINO_POR_OMISION
  try {
    const url = new URL(cb, origen)
    return url.origin === origen ? url.pathname + url.search : DESTINO_POR_OMISION
  } catch {
    return DESTINO_POR_OMISION
  }
}

/** Lo que escribe la persona en los dos modos de /auth/signin: UN solo estado, como hoy (`signin:18-23`). */
export interface DatosAcceso {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export const DATOS_VACIOS: DatosAcceso = { name: '', email: '', password: '', confirmPassword: '' }

/** Cuerpo de `POST /api/auth/create-account` (el proxy de hoy), igual que `signin:116-120`: sin recortar, el proxy y la API deciden. */
export function cuerpoAlta(datos: DatosAcceso): { email: string; password: string; nombre: string } {
  return { email: datos.email, password: datos.password, nombre: datos.name }
}

/** Textos de hoy del modo «Crear Cuenta» (`signin:105`, `:125`, `:129`, `:132`). */
export const TEXTO_NO_COINCIDEN_ALTA = 'Las contraseñas no coinciden'
export const TEXTO_ALTA_FALLIDA = 'No se pudo crear la cuenta. Intenta de nuevo.'
export const TEXTO_ALTA_LISTA = '¡Cuenta creada! Ahora puedes iniciar sesión'
export const TEXTO_ALTA_SIN_CONEXION = 'Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.'

/** Textos de hoy del modo «Iniciar Sesión» (`signin:79`, `:82`). */
export const TEXTO_ENTRAR_FALLIDO = 'Correo o contraseña incorrectos.'
export const TEXTO_ENTRAR_SIN_CONEXION = 'No se pudo conectar. Inténtalo de nuevo.'

/**
 * Antes del POST del alta, en el orden de hoy: primero que coincidan (`signin:104-107`); después la longitud, con el MISMO texto que da el
 * proxy (`create-account/route.ts:31-35` = `TEXTO_PASSWORD_CORTA` de hoy). Hoy el formulario dejaba escribir 6 y el proxy rechazaba con 8: no se
 * copia (D-F6-09 P-4). null = se puede mandar.
 */
export function motivoAlta(datos: DatosAcceso): { campo: 'confirmPassword' | 'password'; texto: string } | null {
  if (datos.password !== datos.confirmPassword) return { campo: 'confirmPassword', texto: TEXTO_NO_COINCIDEN_ALTA }
  if (datos.password.length < PASSWORD_MIN) return { campo: 'password', texto: TEXTO_PASSWORD_CORTA }
  return null
}

/**
 * El error del alta que hoy va a `aviso.error(datos.error || TEXTO_ALTA_FALLIDA)` (`signin:125`). `aviso` convierte con `String(…).trim()` y no
 * pinta un texto vacío (`components/ui/Avisos.tsx:81-82`); aquí se pinta en la página (D-F6-09 P-3). Un `error` que no es texto (un 422 de la
 * API que el proxy reenvía como lista) hoy saldría «[object Object]»: va el texto de respaldo de hoy (no se copia el defecto; información).
 */
export function textoErrorAlta(datos: unknown): string {
  const e = (datos as { error?: unknown } | null)?.error
  if (typeof e === 'string' && e.trim()) return e.trim()
  return TEXTO_ALTA_FALLIDA
}

/** Lo que pinta /auth/recuperar después del POST (`recuperar/page.tsx:50-59`). */
export type ResultadoRecuperar = { tipo: 'enviado'; texto: string } | { tipo: 'error'; texto: string; correo: boolean }

export function resultadoRecuperar(ok: boolean, status: number, datos: unknown): ResultadoRecuperar {
  if (ok) return { tipo: 'enviado', texto: mensajeDe(datos, TEXTO_RECUPERAR_ENVIADO) }
  if (status === 422) return { tipo: 'error', texto: TEXTO_CORREO_INVALIDO, correo: true }
  if (status === 429) return { tipo: 'error', texto: TEXTO_DEMASIADOS, correo: false }
  return { tipo: 'error', texto: TEXTO_ERROR_SERVIDOR, correo: false }
}

/** El error de /auth/restablecer (`restablecer/page.tsx:28`). */
export type ErrorRestablecer = { codigo: CodigoEnlaceInvalido | 'local' | 'servidor'; texto: string }

/** Lo que pinta /auth/restablecer después del POST (`restablecer/page.tsx:81-94`). */
export type ResultadoRestablecer = { tipo: 'listo'; texto: string } | { tipo: 'error'; error: ErrorRestablecer }

export function resultadoRestablecer(ok: boolean, status: number, datos: unknown): ResultadoRestablecer {
  if (ok) return { tipo: 'listo', texto: mensajeDe(datos, TEXTO_RESTABLECIDO) }
  if (status === 400) return { tipo: 'error', error: enlaceInvalidoDe(datos) }
  // 8..128: la validación local ya lo cubre; si el backend lo rechaza igual, se dice en español (`restablecer/page.tsx:88`).
  if (status === 422) return { tipo: 'error', error: { codigo: 'local', texto: TEXTO_PASSWORD_CORTA } }
  if (status === 429) return { tipo: 'error', error: { codigo: 'servidor', texto: TEXTO_DEMASIADOS } }
  return { tipo: 'error', error: { codigo: 'servidor', texto: TEXTO_ERROR_SERVIDOR } }
}

/** Un error de enlace (no local ni del servidor) trae la liga «Pedir un enlace nuevo» (`restablecer/page.tsx:103`, `:194-202`). */
export function esErrorDeEnlace(error: ErrorRestablecer | null): boolean {
  return error !== null && error.codigo !== 'local' && error.codigo !== 'servidor'
}
