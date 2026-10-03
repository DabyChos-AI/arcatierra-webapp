'use client'

import { useRef, useState } from 'react'
import { CircleCheck, Send } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { hoyMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import {
  MENSAJE_SOLICITUD_MAX,
  TIPOS_SOLICITUD_PORTAL,
  type SolicitudPortalBody,
  type SolicitudPortalRespuesta,
  type TipoSolicitudPortal,
} from '@/types/portal'

// DR23: «Pedir cambio o cancelación» le llega al equipo por correo (POST /api/portal/{token}/solicitud).
// No cambia la reserva: el equipo contesta. El correo y el nombre del cliente los pone el backend desde la base, nunca
// desde aquí. Candado contra doble clic ANTES de la petición (s48: un solo POST). Los errores salen con el `detail` del
// backend en role="alert" (400 ya no admite cambios · 429 tope de 3 en 24 h o 5/min · 503 el correo falló).

const SIN_RED = 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.'
const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/

function esRespuestaOk(cuerpo: unknown): cuerpo is SolicitudPortalRespuesta {
  return typeof cuerpo === 'object' && cuerpo !== null && (cuerpo as { recibida?: unknown }).recibida === true
}

export default function SolicitudForm({ token, folio }: { token: string; folio: string }) {
  const [tipo, setTipo] = useState<TipoSolicitudPortal | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [fecha, setFecha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recibida, setRecibida] = useState<string | null>(null)
  const enviandoRef = useRef(false)
  const mensajeRef = useRef<HTMLTextAreaElement>(null)
  const fechaRef = useRef<HTMLInputElement>(null)
  const tipoRef = useRef<HTMLInputElement>(null)
  // «Hoy» de México (nunca el del navegador): mínimo del calendario y validación de la fecha preferida.
  const [hoy] = useState(() => hoyMexico())

  if (recibida !== null) {
    return (
      <div
        data-testid="portal-solicitud-ok"
        role="status"
        className="flex items-start gap-3 rounded-2xl border border-verde/30 bg-verde/5 p-4 text-base text-verde"
      >
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="mb-0 whitespace-pre-line">{recibida}</p>
      </div>
    )
  }

  const motivoLocal = (): { texto: string; foco: HTMLElement | null } | null => {
    if (!tipo) return { texto: 'Elige si necesitas un cambio o una cancelación.', foco: tipoRef.current }
    if (!mensaje.trim()) return { texto: 'Escribe qué necesitas en el mensaje.', foco: mensajeRef.current }
    if (tipo === 'cambio' && fecha) {
      if (!FECHA_ISO.test(fecha)) return { texto: 'Revisa la fecha que prefieres.', foco: fechaRef.current }
      if (fecha < hoy) return { texto: 'La fecha que prefieres debe ser de hoy en adelante.', foco: fechaRef.current }
    }
    return null
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    // Candado ANTES de cualquier await: el 2.º clic de un doble clic sale aquí.
    if (enviandoRef.current) return
    const motivo = motivoLocal()
    if (motivo) {
      setError(motivo.texto)
      motivo.foco?.focus()
      return
    }
    if (!tipo) return
    enviandoRef.current = true
    setEnviando(true)
    setError(null)

    const body: SolicitudPortalBody = { tipo, mensaje: mensaje.trim().slice(0, MENSAJE_SOLICITUD_MAX) }
    // extra="forbid" en el backend y la fecha solo vale con «cambio»: si no hay fecha, la llave no va.
    if (tipo === 'cambio' && fecha) body.fecha_preferida = fecha

    try {
      const res = await fetch(`${API_URL}/api/portal/${encodeURIComponent(token)}/solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
      let cuerpo: unknown = null
      try {
        cuerpo = await res.json()
      } catch {
        cuerpo = null
      }
      if (res.ok && esRespuestaOk(cuerpo)) {
        setRecibida(cuerpo.mensaje || 'Recibimos tu solicitud.')
        return
      }
      if (res.ok) {
        setRecibida('Recibimos tu solicitud.')
        return
      }
      setError(cuerpo === null ? `No pudimos enviar tu solicitud (error ${res.status}). Intenta de nuevo.` : extraerMensajeError(cuerpo, res.status))
    } catch {
      setError(SIN_RED)
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  const restantes = MENSAJE_SOLICITUD_MAX - mensaje.length

  return (
    <form
      data-testid="portal-solicitud-form"
      onSubmit={enviar}
      noValidate
      className="space-y-4"
      aria-describedby={error ? 'portal-solicitud-error' : undefined}
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-base font-semibold text-verde">¿Qué necesitas?</legend>
        {TIPOS_SOLICITUD_PORTAL.map((t, i) => (
          <label
            key={t.valor}
            htmlFor={`portal-solicitud-tipo-${t.valor}`}
            className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-base transition-colors ${
              tipo === t.valor ? 'border-terracota bg-terracota/5' : 'border-neutro-borde bg-white'
            }`}
          >
            <input
              ref={i === 0 ? tipoRef : undefined}
              id={`portal-solicitud-tipo-${t.valor}`}
              data-testid={`portal-solicitud-tipo-${t.valor}`}
              type="radio"
              name="portal-solicitud-tipo"
              value={t.valor}
              checked={tipo === t.valor}
              onChange={() => {
                setTipo(t.valor)
                setError(null)
              }}
              className="h-5 w-5 shrink-0 accent-terracota"
            />
            <span>{t.texto}</span>
          </label>
        ))}
      </fieldset>

      {tipo === 'cambio' && (
        <div>
          <label htmlFor="portal-solicitud-fecha" className="mb-1 block text-base font-semibold text-verde">
            Fecha que prefieres <span className="font-normal text-verde-suave">(opcional)</span>
          </label>
          <input
            ref={fechaRef}
            id="portal-solicitud-fecha"
            data-testid="portal-solicitud-fecha"
            type="date"
            min={hoy}
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value)
              setError(null)
            }}
            className="block min-h-[44px] w-full max-w-full rounded-xl border border-neutro-borde bg-white px-3 py-2 text-base text-verde-tipografia"
          />
          <p className="mb-0 mt-1 text-sm text-verde-suave">El equipo revisa si hay lugar y te contesta.</p>
        </div>
      )}

      <div>
        <label htmlFor="portal-solicitud-mensaje" className="mb-1 block text-base font-semibold text-verde">
          Mensaje
        </label>
        <textarea
          ref={mensajeRef}
          id="portal-solicitud-mensaje"
          data-testid="portal-solicitud-mensaje"
          value={mensaje}
          maxLength={MENSAJE_SOLICITUD_MAX}
          rows={4}
          onChange={(e) => {
            setMensaje(e.target.value.slice(0, MENSAJE_SOLICITUD_MAX))
            setError(null)
          }}
          aria-describedby="portal-solicitud-contador"
          placeholder={`Cuéntanos qué necesitas para tu reserva ${folio}.`}
          className="block w-full max-w-full resize-y rounded-xl border border-neutro-borde bg-white px-3 py-2 text-base text-verde-tipografia"
        />
        <p
          id="portal-solicitud-contador"
          data-testid="portal-solicitud-contador"
          aria-live="polite"
          className={`mb-0 mt-1 text-right text-sm tabular-nums ${restantes <= 50 ? 'text-terracota' : 'text-verde-suave'}`}
        >
          {mensaje.length}/{MENSAJE_SOLICITUD_MAX}
        </p>
      </div>

      {error && (
        <p
          id="portal-solicitud-error"
          data-testid="portal-solicitud-error"
          role="alert"
          className="mb-0 whitespace-pre-line rounded-xl bg-rojo-bg px-3 py-2 text-base text-rojo"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        data-testid="portal-solicitud-enviar"
        disabled={enviando}
        aria-busy={enviando}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-verde px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-verde-dark disabled:opacity-60"
      >
        <Send className="h-5 w-5" aria-hidden="true" />
        {enviando ? 'Enviando…' : 'Enviar solicitud'}
      </button>
      <p className="mb-0 text-sm text-verde-suave">
        Tu solicitud le llega al equipo de Experiencias por correo; no cambia tu reserva hasta que te contesten.
      </p>
    </form>
  )
}
