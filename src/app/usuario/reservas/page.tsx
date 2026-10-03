'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, ChevronRight, Clock, Mail, RefreshCw } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type { MiReservaItem, MisReservasResponse } from '@/types/portal'
import { CORREO_EXPERIENCIAS, fechaLarga, horaCorta } from '@/app/reserva/[token]/components/textos'

/**
 * R9-d (David, 3-oct): «Mis reservas» con la lista REAL de reservas y compras web del cliente, cada una con el link a su
 * portal (`/reserva/<token>`). GET `${API_URL}/api/usuario/mis-reservas` con el Bearer de la sesión (como Mi día y
 * `useFavoritos`); forma exacta `MisReservasResponse` de src/types/portal.ts (del líder). Sin contacto ni montos.
 * HDR2 (R7) sigue: nada de cuenta demo ni reservas inventadas; sin reservas, el aviso de que llegan por correo.
 */

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; items: MiReservaItem[] }
  | { fase: 'error'; texto: string; sesion: boolean }

const TEXTO_ERROR = 'No pudimos cargar tus reservas. Intenta de nuevo en un momento.'
const TEXTO_SESION = 'Tu sesión expiró. Vuelve a iniciar sesión.'

function normalizarItems(cuerpo: unknown): MiReservaItem[] | null {
  if (typeof cuerpo !== 'object' || cuerpo === null) return null
  const items = (cuerpo as Partial<MisReservasResponse>).items
  if (!Array.isArray(items)) return null
  const limpios = items
    .filter((i): i is MiReservaItem => !!i && typeof i === 'object' && typeof (i as MiReservaItem).folio === 'string')
    .map((i) => ({
      tipo: i.tipo === 'compra' ? ('compra' as const) : ('reserva' as const),
      folio: i.folio,
      titulo: typeof i.titulo === 'string' && i.titulo.trim() ? i.titulo : 'Experiencia',
      fecha: typeof i.fecha === 'string' ? i.fecha : null,
      hora_inicio: typeof i.hora_inicio === 'string' ? i.hora_inicio : null,
      estado_texto: typeof i.estado_texto === 'string' ? i.estado_texto : '',
      portal_url: typeof i.portal_url === 'string' && i.portal_url.trim() ? i.portal_url : null,
      pasada: i.pasada === true,
    }))
  // El backend ya ordena (futuras por fecha, luego pasadas); aquí solo se asegura que las pasadas queden al final.
  return [...limpios.filter((i) => !i.pasada), ...limpios.filter((i) => i.pasada)]
}

function TarjetaMiReserva({ item }: { item: MiReservaItem }) {
  const hora = horaCorta(item.hora_inicio)
  return (
    <li
      data-testid={`mis-reserva-${item.folio}`}
      data-tipo={item.tipo}
      data-pasada={item.pasada ? '1' : '0'}
      className={`rounded-2xl border border-neutro-borde bg-white p-4 shadow-sm sm:p-5 ${item.pasada ? 'opacity-70' : ''}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-neutro-light px-3 py-0.5 font-medium text-verde-tipografia">
          {item.tipo === 'compra' ? 'Compra en línea' : 'Reserva'}
        </span>
        {item.estado_texto && (
          <span data-testid="mis-reserva-estado" className="rounded-full bg-verde/10 px-3 py-0.5 font-semibold text-verde">
            {item.estado_texto}
          </span>
        )}
        {item.pasada && <span className="text-verde-suave">Ya pasó</span>}
      </div>
      <h2 data-testid="mis-reserva-titulo" className="mb-1 break-words font-heading text-xl leading-tight text-verde">
        {item.titulo}
      </h2>
      <p className="mb-2 text-sm text-verde-suave">
        Folio <span className="break-all font-semibold text-verde-tipografia">{item.folio}</span>
      </p>
      <ul className="mb-3 space-y-1 text-base text-verde-tipografia">
        {item.fecha && (
          <li data-testid="mis-reserva-fecha" data-fecha={item.fecha} className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span className="min-w-0">{fechaLarga(item.fecha)}</span>
          </li>
        )}
        {hora && (
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span>{hora}</span>
          </li>
        )}
      </ul>
      {item.portal_url ? (
        <a
          data-testid="mis-reserva-ver"
          href={item.portal_url}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-terracota px-4 py-2 font-semibold text-white hover:bg-terracota-oscuro hover:text-white"
        >
          Ver mi reserva
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : (
        <p data-testid="mis-reserva-sin-link" className="mb-0 text-sm text-verde-suave">
          El link de esta reserva no está disponible por ahora; lo tienes en tu correo.
        </p>
      )}
    </li>
  )
}

export default function ReservasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const token = session?.accessToken
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const pedidoRef = useRef(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const cargar = useCallback(async () => {
    const pedido = ++pedidoRef.current
    setEstado({ fase: 'cargando' })
    if (!token) {
      setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/usuario/mis-reservas`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (pedido !== pedidoRef.current) return
      if (res.status === 401) {
        setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
        return
      }
      if (!res.ok) {
        setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
        return
      }
      const items = normalizarItems(await res.json())
      if (pedido !== pedidoRef.current) return
      setEstado(items ? { fase: 'listo', items } : { fase: 'error', texto: TEXTO_ERROR, sesion: false })
    } catch {
      if (pedido === pedidoRef.current) setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
    }
  }, [token])

  useEffect(() => {
    if (status === 'authenticated') void cargar()
  }, [status, cargar])

  if (status !== 'authenticated' || estado.fase === 'cargando') {
    return (
      <div className="min-h-screen bg-neutro-crema px-4 pb-16 pt-32 sm:pt-36">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="mb-6 font-heading text-3xl text-verde">Mis reservas</h1>
          <div data-testid="mis-reservas-cargando" role="status" className="flex items-center gap-3 text-verde-tipografia">
            <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-b-2 border-verde" aria-hidden="true" />
            Cargando tus reservas...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutro-crema px-4 pb-16 pt-32 sm:pt-36">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 font-heading text-3xl text-verde">Mis reservas</h1>

        {estado.fase === 'error' && (
          <div data-testid="mis-reservas-error" role="alert" className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-4 text-base text-verde-tipografia">{estado.texto}</p>
            {estado.sesion ? (
              <Link
                href="/auth/signin?callbackUrl=%2Fusuario%2Freservas"
                className="inline-flex min-h-[44px] items-center rounded-xl bg-terracota px-5 py-2 font-semibold text-white hover:bg-terracota-oscuro hover:text-white"
              >
                Iniciar sesión
              </Link>
            ) : (
              <button
                type="button"
                data-testid="mis-reservas-reintentar"
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
          <ul data-testid="mis-reservas-lista" className="space-y-4">
            {estado.items.map((item) => (
              <TarjetaMiReserva key={`${item.tipo}-${item.folio}`} item={item} />
            ))}
          </ul>
        )}

        {estado.fase === 'listo' && estado.items.length === 0 && (
          <div data-testid="mis-reservas-vacio" className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
            <Mail className="mx-auto mb-4 h-12 w-12 text-verde-suave" aria-hidden="true" />
            <h2 className="mb-2 font-heading text-xl text-verde">Tus reservas de experiencias te llegan por correo</h2>
            <p className="mb-3 text-base text-verde-tipografia">
              Cuando reservas una experiencia te mandamos la confirmación y todos los detalles a tu correo, con el link
              para verla. Las que hagas con esta cuenta aparecen aquí.
            </p>
            <p className="mb-6 text-base text-verde-tipografia">
              ¿Dudas o cambios? Escríbele al equipo de Experiencias:{' '}
              <a
                href={`mailto:${CORREO_EXPERIENCIAS}`}
                data-testid="reservas-contacto"
                className="break-all text-verde underline"
              >
                {CORREO_EXPERIENCIAS}
              </a>
            </p>
            <Link
              href="/experiencias"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-verde px-5 py-2 font-semibold text-white hover:bg-verde-dark hover:text-white"
            >
              Explorar experiencias
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
