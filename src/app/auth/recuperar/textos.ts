// R11b · ACC1 (sesión 51): textos y lecturas puras de /auth/recuperar y /auth/restablecer (sin React, sin I/O).
// La forma de los datos es `src/types/cuenta.ts` (del líder). Los textos que vienen del backend se muestran tal cual;
// aquí solo los de respaldo y los de la validación local.

import { PASSWORD_MIN, type CodigoEnlaceInvalido } from '@/types/cuenta'

export const PASSWORD_MAX = 128

/** Igual que el `message` del backend: si llega sin texto (no debería), se dice lo mismo. */
export const TEXTO_RECUPERAR_ENVIADO =
  'Si hay una cuenta con ese correo, te mandamos un enlace para crear una contraseña nueva. Revisa tu correo (y la carpeta de spam).'
export const TEXTO_RESTABLECIDO = 'Listo: ya puedes entrar con tu contraseña nueva.'

export const TEXTO_CORREO_INVALIDO = 'Escribe un correo válido.'
export const TEXTO_DEMASIADOS = 'Hiciste muchos intentos seguidos. Espera un minuto e inténtalo de nuevo.'
export const TEXTO_SIN_CONEXION = 'No pudimos conectar con el servidor. Revisa tu internet e inténtalo de nuevo.'
export const TEXTO_ERROR_SERVIDOR = 'No pudimos completar la solicitud. Inténtalo de nuevo en un momento.'

export const TEXTO_PASSWORD_CORTA = `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`
export const TEXTO_PASSWORD_LARGA = `La contraseña puede tener hasta ${PASSWORD_MAX} caracteres.`
export const TEXTO_NO_COINCIDEN = 'Las contraseñas no coinciden.'
export const TEXTO_SIN_TOKEN = 'Este enlace está incompleto. Pide uno nuevo y ábrelo desde el correo.'
export const TEXTO_ENLACE_INVALIDO = 'El enlace no es válido.'

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function correoValido(correo: string): boolean {
  return CORREO_VALIDO.test(correo.trim())
}

/** null = la contraseña sirve; si no, el motivo (la misma regla del backend: 8..128). */
export function motivoPassword(password: string, confirmacion: string): string | null {
  if (password.length < PASSWORD_MIN) return TEXTO_PASSWORD_CORTA
  if (password.length > PASSWORD_MAX) return TEXTO_PASSWORD_LARGA
  if (password !== confirmacion) return TEXTO_NO_COINCIDEN
  return null
}

/** El `message` de una respuesta 200 o el texto de respaldo. */
export function mensajeDe(cuerpo: unknown, respaldo: string): string {
  const m = (cuerpo as { message?: unknown } | null)?.message
  return typeof m === 'string' && m.trim() ? m : respaldo
}

const CODIGOS: readonly CodigoEnlaceInvalido[] = ['enlace_invalido', 'enlace_vencido', 'enlace_usado']

/** El 400 de restablecer: `{detail, codigo}`. Un `codigo` que no conocemos cuenta como enlace inválido. */
export function enlaceInvalidoDe(cuerpo: unknown): { codigo: CodigoEnlaceInvalido; texto: string } {
  const c = cuerpo as { detail?: unknown; codigo?: unknown } | null
  const codigo = CODIGOS.find((x) => x === c?.codigo) ?? 'enlace_invalido'
  const texto = typeof c?.detail === 'string' && c.detail.trim() ? c.detail : TEXTO_ENLACE_INVALIDO
  return { codigo, texto }
}
