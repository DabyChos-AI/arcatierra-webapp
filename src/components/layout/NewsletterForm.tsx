'use client'

// Newsletter de los pies de página (WF11, R11b, DR71). Antes el formulario fingía: no tenía `onSubmit` y el correo se perdía.
// POST ${API_URL}/api/newsletter (público, 5/min por IP) con la casilla de consentimiento (`TEXTO_CONSENTIMIENTO_NEWSLETTER`,
// el backend guarda el MISMO texto) y el `origen` del pie. La respuesta es la misma si el correo ya estaba (no revela quién
// está suscrito). `sitio` es un campo trampa oculto: una persona no lo ve; si un bot lo llena, el backend responde igual y
// no guarda nada (L1). Sin correos a nadie.

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'
import {
  TEXTO_CONSENTIMIENTO_NEWSLETTER,
  type NewsletterPayload,
  type OrigenNewsletter,
} from '@/types/mensajes'

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEXTO_NO_ENVIADO = 'No pudimos registrar tu correo. Intenta de nuevo en un momento.'
const TEXTO_LISTO = 'Listo: te avisaremos de lo nuevo en Arca Tierra.'

type Resultado = { tipo: 'exito' | 'error'; texto: string }

/** `detail` de FastAPI en texto: un 4xx lo trae como texto; un 422 de Pydantic, como lista. */
function detalleLegible(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) return 'Revisa tu correo y la casilla de aceptación.'
  return TEXTO_NO_ENVIADO
}

interface Props {
  origen: OrigenNewsletter
}

export default function NewsletterForm({ origen }: Props) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [acepto, setAcepto] = useState(false)
  const [sitio, setSitio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const enviandoRef = useRef(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const aceptoRef = useRef<HTMLInputElement>(null)

  const oscuro = origen === 'prensa'
  // R15 v2 · F1 (C31): el popup del sitio nuevo va sobre fondo claro (`sn-warm`), con los tokens y pares AA de CONTRATO-BASE-F1 §2.2.
  // 'pie' y 'prensa' pintan exactamente lo de antes.
  const claro = origen === 'popup'

  // El botón se puede pulsar siempre: si falta algo, dice qué y enfoca el campo (s46). Candado: un solo POST.
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviandoRef.current) return
    const correo = email.trim()
    if (!CORREO_VALIDO.test(correo)) {
      setResultado({ tipo: 'error', texto: 'Escribe un correo válido.' })
      emailRef.current?.focus()
      return
    }
    if (!acepto) {
      setResultado({ tipo: 'error', texto: 'Marca la casilla para aceptar recibir nuestros correos.' })
      aceptoRef.current?.focus()
      return
    }
    // `sitio` lleva lo que traiga la trampa (vacío para una persona).
    const body: NewsletterPayload = { email: correo, acepto: true, origen, sitio }
    enviandoRef.current = true
    setEnviando(true)
    setResultado(null)
    try {
      const res = await fetch(`${API_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const datos: unknown = await res.json().catch(() => null)
      if (res.ok) {
        const message = datos && typeof datos === 'object' ? (datos as { message?: unknown }).message : null
        setResultado({ tipo: 'exito', texto: typeof message === 'string' && message.trim() ? message : TEXTO_LISTO })
        setEmail('')
        setAcepto(false)
        return
      }
      const detail = datos && typeof datos === 'object' ? (datos as { detail?: unknown }).detail : null
      setResultado({
        tipo: 'error',
        texto: res.status >= 400 && res.status < 500 ? detalleLegible(detail) : TEXTO_NO_ENVIADO,
      })
    } catch {
      setResultado({ tipo: 'error', texto: TEXTO_NO_ENVIADO })
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      data-testid="newsletter-formulario"
      data-origen={origen}
      className="space-y-3"
    >
      <div className={oscuro ? 'flex flex-wrap gap-4 sm:flex-nowrap' : claro ? 'flex flex-col gap-2' : 'flex flex-col gap-2 sm:flex-row'}>
        <label htmlFor={`${id}-email`} className="sr-only">
          Tu correo
        </label>
        <input
          ref={emailRef}
          id={`${id}-email`}
          data-testid="newsletter-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          placeholder="Tu correo"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (resultado?.tipo === 'error') setResultado(null)
          }}
          className={
            oscuro
              ? 'w-full rounded-lg bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-terracota sm:flex-grow'
              : claro
                ? 'min-w-0 flex-1 rounded-sn-campo border border-sn-muted bg-white px-3.5 py-3 font-sn-texto text-sn-cuerpo-sm text-sn-ink placeholder:text-sn-ink/70 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sn-terra'
                : 'min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50'
          }
        />
        <button
          type="submit"
          data-testid="newsletter-enviar"
          disabled={enviando}
          className={
            oscuro
              ? 'w-full rounded-lg bg-terracota px-6 py-3 font-medium text-white transition-colors hover:bg-opacity-90 disabled:opacity-60 sm:w-auto'
              : claro
                ? 'min-h-11 rounded-sn-pildora bg-sn-terra px-6 py-3 font-sn-mono text-sn-boton font-medium uppercase text-white transition-colors hover:bg-sn-ink disabled:opacity-60 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sn-terra'
                : 'rounded-md bg-white px-4 py-2 font-semibold text-terracota transition-colors hover:bg-white/90 disabled:opacity-60'
          }
        >
          {enviando ? 'Enviando…' : 'Suscribirse'}
        </button>
      </div>

      <div className="flex items-start gap-2">
        <input
          ref={aceptoRef}
          id={`${id}-acepto`}
          data-testid="newsletter-acepto"
          type="checkbox"
          checked={acepto}
          onChange={(e) => {
            setAcepto(e.target.checked)
            if (resultado?.tipo === 'error') setResultado(null)
          }}
          className={
            claro
              ? 'mt-0.5 h-4 w-4 shrink-0 accent-sn-terra focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sn-terra'
              : 'mt-0.5 h-4 w-4 shrink-0 accent-terracota'
          }
        />
        <label htmlFor={`${id}-acepto`} className={`text-xs ${oscuro ? 'text-gray-300' : claro ? 'text-sn-ink' : 'text-white/90'}`}>
          {TEXTO_CONSENTIMIENTO_NEWSLETTER}{' '}
          <Link href="/privacidad" className={claro ? 'text-sn-ink underline hover:text-sn-terra' : 'underline'}>
            Aviso de privacidad
          </Link>
        </label>
      </div>

      {/* Trampa: invisible para personas y lectores de pantalla; un bot que la llena no deja nada guardado. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-sitio`}>Sitio web</label>
        <input
          id={`${id}-sitio`}
          data-testid="newsletter-sitio"
          type="text"
          name="sitio"
          tabIndex={-1}
          autoComplete="off"
          value={sitio}
          onChange={(e) => setSitio(e.target.value)}
        />
      </div>

      {resultado && (
        <p
          data-testid="newsletter-resultado"
          data-tipo={resultado.tipo}
          role={resultado.tipo === 'error' ? 'alert' : 'status'}
          className={`text-sm ${
            resultado.tipo === 'error'
              ? oscuro
                ? 'text-red-300'
                : claro
                  ? 'font-semibold text-sn-terra'
                  : 'font-semibold text-white'
              : oscuro
                ? 'text-green-300'
                : claro
                  ? 'text-sn-green'
                  : 'text-white'
          }`}
        >
          {resultado.texto}
        </p>
      )}
    </form>
  )
}
