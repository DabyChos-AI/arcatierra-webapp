'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { KeyRound, MailCheck } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type { RecuperarPayload } from '@/types/cuenta'
import { RECUPERAR_MINUTOS } from '@/types/cuenta'
import {
  TEXTO_CORREO_INVALIDO,
  TEXTO_DEMASIADOS,
  TEXTO_ERROR_SERVIDOR,
  TEXTO_RECUPERAR_ENVIADO,
  TEXTO_SIN_CONEXION,
  correoValido,
  mensajeDe,
} from './textos'

/**
 * R11b · ACC1 (sesión 51): «¿Olvidaste tu contraseña?». POST público `${API_URL}/api/auth/recuperar` {email}, directo (el
 * límite por IP necesita la IP real del cliente). El backend responde SIEMPRE lo mismo, exista o no la cuenta: se muestra
 * su `message` tal cual y el formulario se va (no revela quién tiene cuenta).
 */
export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const enviandoRef = useRef(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviandoRef.current) return
    const correo = email.trim()
    if (!correoValido(correo)) {
      setError(TEXTO_CORREO_INVALIDO)
      return
    }
    enviandoRef.current = true
    setEnviando(true)
    setError(null)
    try {
      const cuerpo: RecuperarPayload = { email: correo }
      const res = await fetch(`${API_URL}/api/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        cache: 'no-store',
      })
      const datos: unknown = await res.json().catch(() => null)
      if (res.ok) {
        setMensaje(mensajeDe(datos, TEXTO_RECUPERAR_ENVIADO))
      } else if (res.status === 422) {
        setError(TEXTO_CORREO_INVALIDO)
      } else if (res.status === 429) {
        setError(TEXTO_DEMASIADOS)
      } else {
        setError(TEXTO_ERROR_SERVIDOR)
      }
    } catch {
      setError(TEXTO_SIN_CONEXION)
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutro-crema to-neutro-beige px-4 pb-16 pt-32 sm:pt-36">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-verde">
            <KeyRound className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="mb-2 font-heading text-2xl text-verde sm:text-3xl">Recuperar contraseña</h1>
          {!mensaje && (
            <p className="mb-0 text-base text-verde-tipografia">
              Escribe el correo de tu cuenta y te mandamos un enlace para crear una contraseña nueva. El enlace dura{' '}
              {RECUPERAR_MINUTOS} minutos.
            </p>
          )}
        </div>

        {mensaje ? (
          <div data-testid="recuperar-mensaje" role="status" className="rounded-xl bg-verde/10 p-4 text-verde-tipografia">
            <p className="mb-0 flex items-start gap-2 text-base">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-verde" aria-hidden="true" />
              <span>{mensaje}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate className="space-y-4">
            <div>
              <label htmlFor="recuperar-email" className="mb-1 block text-sm font-medium text-verde-tipografia">
                Correo
              </label>
              <input
                id="recuperar-email"
                data-testid="recuperar-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={255}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                aria-invalid={error === TEXTO_CORREO_INVALIDO}
                aria-describedby={error ? 'recuperar-error' : undefined}
                className="w-full rounded-lg border border-neutro-borde px-3 py-2.5 text-base focus:border-transparent focus:ring-2 focus:ring-verde"
                placeholder="tu@correo.com"
              />
            </div>

            {error && (
              <p
                id="recuperar-error"
                data-testid="recuperar-error"
                role="alert"
                className="mb-0 rounded-lg bg-rojo-bg px-3 py-2 text-sm text-rojo"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              data-testid="recuperar-enviar"
              disabled={enviando}
              className="min-h-[44px] w-full rounded-lg bg-verde py-2.5 font-medium text-white transition-colors hover:bg-verde-dark disabled:opacity-60"
            >
              {enviando ? 'Enviando…' : 'Mandarme el enlace'}
            </button>
          </form>
        )}

        <p className="mb-0 mt-6 text-center text-sm text-verde-tipografia">
          <Link href="/auth/signin" className="font-medium text-terracota hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
