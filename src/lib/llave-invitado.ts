/**
 * GST2 (S68, decisión de David 21-nov: «recordar al invitado en su navegador»). SOLO SERVIDOR: lo usan los proxies de invitado
 * (`api/cart/sync-and-validate`, `api/crear-preferencia-pago`).
 *
 * Cada navegador que compra sin sesión lleva una llave al azar en la cookie `arca_invitado`: HttpOnly (el JavaScript no la ve),
 * `Path=/api` (solo viaja a los proxies) y 30 días. El proxy se la manda a `POST /api/auth/guest-token` en la cabecera
 * `X-Llave-Invitado`, y la API la mete en el token (`llave`). Así el carrito y el apartado son del navegador que los creó: otro
 * navegador con el mismo correo recibe el 409 `compra_en_otro_navegador` y no los toca. La llave nunca va al JSON, a un log ni al
 * cuerpo. La API acepta de 16 a 200 caracteres; aquí salen 43 (32 bytes en base64url).
 */
import { randomBytes } from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'

export const COOKIE_LLAVE_INVITADO = 'arca_invitado'
export const CABECERA_LLAVE_INVITADO = 'X-Llave-Invitado'
const TREINTA_DIAS = 30 * 24 * 60 * 60
const LLAVE_VALIDA = /^[A-Za-z0-9_-]{16,200}$/

/** La llave de este navegador: la de su cookie si es válida; si no, una nueva (hay que guardarla con `guardarLlaveInvitado`). */
export function llaveDelNavegador(req: NextRequest): string {
  const actual = req.cookies.get(COOKIE_LLAVE_INVITADO)?.value
  return actual && LLAVE_VALIDA.test(actual) ? actual : randomBytes(32).toString('base64url')
}

/** Pone (o renueva por 30 días) la cookie en la respuesta. `Secure` cuando el sitio va por https (producción y el link). */
export function guardarLlaveInvitado<T extends NextResponse>(res: T, llave: string): T {
  res.cookies.set(COOKIE_LLAVE_INVITADO, llave, {
    httpOnly: true,
    secure: (process.env.NEXTAUTH_URL ?? '').startsWith('https://'),
    sameSite: 'lax',
    path: '/api',
    maxAge: TREINTA_DIAS,
  })
  return res
}
