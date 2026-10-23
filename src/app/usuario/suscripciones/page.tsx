'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CalendarDays, Leaf, RefreshCw, Repeat, Truck } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { TEXTO_COBRO_FALLIDO, type MiSuscripcion } from '@/types/cuenta'
import { aviso, confirmar } from '@/components/ui/Avisos'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import {
  TEXTO_CONFIRMAR_CANCELAR,
  claseEstado,
  dinero,
  etiquetaEstado,
  fechaCorta,
  fechaLarga,
  normalizarSuscripciones,
  textoFrecuencia,
} from './normalizar'

/**
 * R11b · ACC1 (sesión 51): «Mis suscripciones». GET DIRECTO `${API_URL}/api/usuario/mis-suscripciones` con el Bearer (L5).
 * Los botones salen de `acciones` (los decide el servidor). SUB6 (David, opción B): sin pausa, solo «Cancelar»; SUB7: aviso
 * `TEXTO_COBRO_FALLIDO` mientras `cobro_fallido_desde` no sea null.
 * `POST ${API_URL}/api/subscriptions/{id}/cancelar` tras `confirmar({peligro})`, con candado ANTES del await.
 */

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; items: MiSuscripcion[] }
  | { fase: 'error'; texto: string; sesion: boolean }

const TEXTO_ERROR = 'No pudimos cargar tus suscripciones. Intenta de nuevo en un momento.'
const TEXTO_SESION = 'Tu sesión expiró. Vuelve a iniciar sesión.'
const TEXTO_CANCELADA = 'Suscripción cancelada'

function TarjetaSuscripcion({
  s,
  cancelando,
  error,
  onCancelar,
}: {
  s: MiSuscripcion
  cancelando: boolean
  error: string | null
  onCancelar: (s: MiSuscripcion) => void
}) {
  const frecuencia = textoFrecuencia(s.frecuencia)
  const proxima = fechaLarga(s.proxima_entrega)
  return (
    <li
      data-testid={`mis-suscripcion-${s.id}`}
      data-estado={s.estado}
      className="rounded-2xl border border-neutro-borde bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="mb-0 break-words font-heading text-lg leading-tight text-verde">{s.nombre}</h2>
        {s.estado && (
          <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${claseEstado(s.estado)}`}>
            {etiquetaEstado(s.estado)}
          </span>
        )}
      </div>
      <ul className="mb-3 space-y-1 text-base text-verde-tipografia">
        {(s.tipo_canasta || s.precio !== null) && (
          <li className="flex items-start gap-2">
            <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span>
              {[s.tipo_canasta, s.precio !== null ? `${dinero(s.precio)} por entrega` : null].filter(Boolean).join(' · ')}
            </span>
          </li>
        )}
        {(frecuencia || s.dia_entrega) && (
          <li className="flex items-start gap-2">
            <Repeat className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span>{[frecuencia, s.dia_entrega ? `entrega los ${s.dia_entrega.toLowerCase()}` : null].filter(Boolean).join(', ')}</span>
          </li>
        )}
        {proxima && (
          <li className="flex items-start gap-2">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span>
              Próxima canasta: <span className="font-semibold">{proxima}</span>
            </span>
          </li>
        )}
        {(s.fecha_inicio || s.fecha_fin) && (
          <li className="flex items-start gap-2 text-sm text-verde-suave">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {[s.fecha_inicio ? `Desde el ${fechaCorta(s.fecha_inicio)}` : null, s.fecha_fin ? `terminó el ${fechaCorta(s.fecha_fin)}` : null]
                .filter(Boolean)
                .join(', ')}
            </span>
          </li>
        )}
      </ul>
      {s.cobro_fallido_desde && (
        <p
          data-testid="suscripcion-cobro-fallido"
          role="status"
          className="mb-3 flex items-start gap-2 rounded-lg bg-amarillo-bg px-3 py-2 text-sm text-verde-tipografia"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-terracota" aria-hidden="true" />
          <span>{TEXTO_COBRO_FALLIDO}</span>
        </p>
      )}
      {error && (
        <p data-testid="suscripcion-error" role="alert" className="mb-3 rounded-lg bg-rojo-bg px-3 py-2 text-sm text-rojo">
          {error}
        </p>
      )}
      {s.acciones.includes('cancelar') && (
        <button
          type="button"
          data-testid="suscripcion-cancelar"
          onClick={() => onCancelar(s)}
          disabled={cancelando}
          className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-terracota px-4 py-2 font-semibold text-terracota hover:bg-terracota/5 disabled:opacity-60"
        >
          {cancelando ? 'Cancelando…' : 'Cancelar suscripción'}
        </button>
      )}
    </li>
  )
}

export default function MisSuscripcionesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const token = session?.accessToken
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const pedidoRef = useRef(0)
  const enCursoRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=%2Fusuario%2Fsuscripciones')
    }
  }, [status, router])

  /** `silencioso`: relee sin el «Cargando» (tras cancelar, la lista no parpadea). */
  const cargar = useCallback(
    async (silencioso = false) => {
      const pedido = ++pedidoRef.current
      if (!silencioso) setEstado({ fase: 'cargando' })
      if (!token) {
        setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
        return
      }
      try {
        const res = await fetch(`${API_URL}/api/usuario/mis-suscripciones`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (pedido !== pedidoRef.current) return
        if (res.status === 401) return setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
        if (!res.ok) return setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
        const datos = normalizarSuscripciones(await res.json())
        if (pedido !== pedidoRef.current) return
        setEstado(datos ? { fase: 'listo', items: datos.items } : { fase: 'error', texto: TEXTO_ERROR, sesion: false })
      } catch {
        if (pedido === pedidoRef.current) setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
      }
    },
    [token]
  )

  useEffect(() => {
    if (status === 'authenticated') void cargar()
  }, [status, cargar])

  const cancelar = async (s: MiSuscripcion) => {
    // Candado ANTES del await confirmar (doble clic = un solo POST); se suelta si la persona se arrepiente.
    if (enCursoRef.current.has(s.id)) return
    enCursoRef.current.add(s.id)
    try {
      const ok = await confirmar({
        titulo: 'Cancelar suscripción',
        mensaje: TEXTO_CONFIRMAR_CANCELAR(s.nombre),
        textoAceptar: 'Sí, cancelar suscripción',
        textoCancelar: 'Volver',
        peligro: true,
      })
      if (!ok) return
      if (!token) {
        setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
        return
      }
      setCancelando(s.id)
      setErrores((e) => {
        const resto = { ...e }
        delete resto[s.id]
        return resto
      })
      const res = await fetch(`${API_URL}/api/subscriptions/${encodeURIComponent(s.id)}/cancelar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const cuerpo: unknown = await res.json().catch(() => null)
      if (res.status === 401) {
        setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
        return
      }
      if (!res.ok) {
        setErrores((e) => ({ ...e, [s.id]: extraerMensajeError(cuerpo, res.status) }))
        return
      }
      const mensaje = (cuerpo as { message?: unknown } | null)?.message
      aviso.exito(typeof mensaje === 'string' && mensaje.trim() ? mensaje : TEXTO_CANCELADA)
      await cargar(true)
    } catch {
      setErrores((e) => ({ ...e, [s.id]: 'No pudimos conectar con el servidor. Intenta de nuevo.' }))
    } finally {
      enCursoRef.current.delete(s.id)
      setCancelando((actual) => (actual === s.id ? null : actual))
    }
  }

  if (status !== 'authenticated' || estado.fase === 'cargando') {
    return (
      <div className="min-h-screen bg-neutro-crema px-4 pb-16 pt-32 sm:pt-36">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="mb-6 font-heading text-3xl text-verde">Mis suscripciones</h1>
          <div data-testid="mis-suscripciones-cargando" role="status" className="flex items-center gap-3 text-verde-tipografia">
            <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-b-2 border-verde" aria-hidden="true" />
            Cargando tus suscripciones...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutro-crema px-4 pb-16 pt-32 sm:pt-36">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 font-heading text-3xl text-verde">Mis suscripciones</h1>

        {estado.fase === 'error' && (
          <div data-testid="mis-suscripciones-error" role="alert" className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-4 text-base text-verde-tipografia">{estado.texto}</p>
            {estado.sesion ? (
              <Link
                href="/auth/signin?callbackUrl=%2Fusuario%2Fsuscripciones"
                className="inline-flex min-h-[44px] items-center rounded-xl bg-terracota px-5 py-2 font-semibold text-white hover:bg-terracota-oscuro hover:text-white"
              >
                Iniciar sesión
              </Link>
            ) : (
              <button
                type="button"
                data-testid="mis-suscripciones-reintentar"
                onClick={() => void cargar()}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-terracota px-5 py-2 font-semibold text-white hover:bg-terracota-oscuro"
              >
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
                Intentar de nuevo
              </button>
            )}
          </div>
        )}

        {estado.fase === 'listo' && estado.items.length > 0 && (
          <ul data-testid="mis-suscripciones-lista" className="space-y-4">
            {estado.items.map((s) => (
              <TarjetaSuscripcion
                key={s.id}
                s={s}
                cancelando={cancelando === s.id}
                error={errores[s.id] ?? null}
                onCancelar={(x) => void cancelar(x)}
              />
            ))}
          </ul>
        )}

        {estado.fase === 'listo' && estado.items.length === 0 && (
          <div data-testid="mis-suscripciones-vacio" className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
            <Leaf className="mx-auto mb-4 h-12 w-12 text-verde-suave" aria-hidden="true" />
            <h2 className="mb-2 font-heading text-xl text-verde">No tienes suscripciones</h2>
            <p className="mb-6 text-base text-verde-tipografia">
              Con una suscripción recibes tu canasta de temporada sin tener que pedirla cada vez.
            </p>
            <Link
              href="/suscripciones"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-verde px-5 py-2 font-semibold text-white hover:bg-verde-dark hover:text-white"
            >
              Ver suscripciones
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
