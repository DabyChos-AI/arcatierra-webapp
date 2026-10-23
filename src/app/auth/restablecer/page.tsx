'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { PASSWORD_MIN, type CodigoEnlaceInvalido, type RestablecerPayload } from '@/types/cuenta'
import {
  PASSWORD_MAX,
  TEXTO_DEMASIADOS,
  TEXTO_ERROR_SERVIDOR,
  TEXTO_PASSWORD_CORTA,
  TEXTO_RESTABLECIDO,
  TEXTO_SIN_CONEXION,
  TEXTO_SIN_TOKEN,
  enlaceInvalidoDe,
  mensajeDe,
  motivoPassword,
} from '../recuperar/textos'

/**
 * R11b · ACC1 (sesión 51): la liga del correo (`/auth/restablecer?token=…`). El token es una credencial: se lee de la URL,
 * viaja SOLO en el cuerpo de `POST ${API_URL}/api/auth/restablecer` (nunca en la URL de la API) y no se imprime en ningún
 * lado (ni consola, ni atributos, ni avisos). La metadata (`layout.tsx`) pone `referrer: no-referrer`.
 */

type ErrorRestablecer = { codigo: CodigoEnlaceInvalido | 'local' | 'servidor'; texto: string }

/**
 * El único que llama `useSearchParams()` (dentro de `<Suspense>`, como Mi día): le pasa el token al padre UNA vez y lo
 * borra de la barra de direcciones (§9 C19): queda solo en la memoria del componente, no en el historial ni en capturas.
 * Si la persona recarga, ya no hay token: «restablecer-sin-token» con la liga a pedir otro enlace.
 */
function LectorToken({ onToken }: { onToken: (token: string) => void }) {
  const token = useSearchParams().get('token') ?? ''
  const leidoRef = useRef(false)
  useEffect(() => {
    if (leidoRef.current) return
    leidoRef.current = true
    onToken(token.trim())
    if (token) window.history.replaceState(window.history.state, '', window.location.pathname)
  }, [token, onToken])
  return null
}

const clasesInput =
  'w-full rounded-lg border border-neutro-borde px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:ring-verde'

export default function RestablecerPage() {
  // undefined = todavía no se lee la URL; '' = la liga no trae token.
  const [token, setToken] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ErrorRestablecer | null>(null)
  const [listo, setListo] = useState<string | null>(null)
  const enviandoRef = useRef(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviandoRef.current || !token) return
    const motivo = motivoPassword(password, confirmacion)
    if (motivo) {
      setError({ codigo: 'local', texto: motivo })
      return
    }
    enviandoRef.current = true
    setEnviando(true)
    setError(null)
    try {
      const cuerpo: RestablecerPayload = { token, password }
      const res = await fetch(`${API_URL}/api/auth/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
      })
      const datos: unknown = await res.json().catch(() => null)
      if (res.ok) {
        setListo(mensajeDe(datos, TEXTO_RESTABLECIDO))
        setPassword('')
        setConfirmacion('')
      } else if (res.status === 400) {
        setError(enlaceInvalidoDe(datos))
      } else if (res.status === 422) {
        // 8..128: la validación local ya lo cubre; si el backend lo rechaza igual, se dice en español.
        setError({ codigo: 'local', texto: TEXTO_PASSWORD_CORTA })
      } else if (res.status === 429) {
        setError({ codigo: 'servidor', texto: TEXTO_DEMASIADOS })
      } else {
        setError({ codigo: 'servidor', texto: TEXTO_ERROR_SERVIDOR })
      }
    } catch {
      setError({ codigo: 'servidor', texto: TEXTO_SIN_CONEXION })
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  const errorDeEnlace = error !== null && error.codigo !== 'local' && error.codigo !== 'servidor'

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutro-crema to-neutro-beige px-4 pb-16 pt-32 sm:pt-36">
      <Suspense fallback={null}>
        <LectorToken onToken={setToken} />
      </Suspense>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-verde">
            <KeyRound className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="mb-0 font-heading text-2xl text-verde sm:text-3xl">Crear contraseña nueva</h1>
        </div>

        {token === '' && (
          <div data-testid="restablecer-sin-token" role="alert" className="rounded-xl bg-rojo-bg p-4 text-rojo">
            <p className="mb-3 text-base">{TEXTO_SIN_TOKEN}</p>
            <Link href="/auth/recuperar" className="font-medium text-terracota hover:underline">
              Pedir un enlace nuevo
            </Link>
          </div>
        )}

        {token && listo && (
          <div data-testid="restablecer-listo" role="status" className="rounded-xl bg-verde/10 p-4 text-verde-tipografia">
            <p className="mb-4 flex items-start gap-2 text-base">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-verde" aria-hidden="true" />
              <span>{listo}</span>
            </p>
            <Link
              href="/auth/signin"
              data-testid="restablecer-entrar"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-verde px-4 py-2.5 font-medium text-white hover:bg-verde-dark hover:text-white"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {token && !listo && (
          <form onSubmit={enviar} noValidate className="space-y-4">
            <div>
              <label htmlFor="restablecer-password" className="mb-1 block text-sm font-medium text-verde-tipografia">
                Contraseña nueva
              </label>
              <input
                id="restablecer-password"
                data-testid="restablecer-password"
                type="password"
                autoComplete="new-password"
                maxLength={PASSWORD_MAX}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error?.codigo === 'local') setError(null)
                }}
                aria-describedby="restablecer-ayuda"
                className={clasesInput}
              />
              <p id="restablecer-ayuda" className="mb-0 mt-1 text-xs text-verde-suave">
                Mínimo {PASSWORD_MIN} caracteres.
              </p>
            </div>
            <div>
              <label htmlFor="restablecer-confirmar" className="mb-1 block text-sm font-medium text-verde-tipografia">
                Escríbela otra vez
              </label>
              <input
                id="restablecer-confirmar"
                data-testid="restablecer-confirmar"
                type="password"
                autoComplete="new-password"
                maxLength={PASSWORD_MAX}
                value={confirmacion}
                onChange={(e) => {
                  setConfirmacion(e.target.value)
                  if (error?.codigo === 'local') setError(null)
                }}
                className={clasesInput}
              />
            </div>

            {error && (
              <div
                data-testid="restablecer-error"
                data-codigo={error.codigo}
                role="alert"
                className="rounded-lg bg-rojo-bg px-3 py-2 text-sm text-rojo"
              >
                <p className="mb-0">{error.texto}</p>
                {errorDeEnlace && (
                  <Link
                    href="/auth/recuperar"
                    data-testid="restablecer-pedir-otro"
                    className="mt-2 inline-block font-medium text-terracota hover:underline"
                  >
                    Pedir un enlace nuevo
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              data-testid="restablecer-enviar"
              disabled={enviando}
              className="min-h-[44px] w-full rounded-lg bg-verde py-2.5 font-medium text-white transition-colors hover:bg-verde-dark disabled:opacity-60"
            >
              {enviando ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}

        {!listo && (
          <p className="mb-0 mt-6 text-center text-sm text-verde-tipografia">
            <Link href="/auth/signin" className="font-medium text-terracota hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
