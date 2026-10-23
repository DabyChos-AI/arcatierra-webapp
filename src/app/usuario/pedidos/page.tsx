'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, ChevronRight, Package, RefreshCw, ShoppingBag } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type { MiPedidoResumen } from '@/types/cuenta'
import {
  PEDIDOS_POR_PAGINA,
  claseEstado,
  dinero,
  etiquetaEstado,
  fechaEntregaLarga,
  fechaPedido,
  normalizarLista,
  textoEntrega,
  textoProductos,
} from './normalizar'

/**
 * R11b · ACC1 (sesión 51): «Mis pedidos» de la tienda. GET DIRECTO `${API_URL}/api/usuario/mis-pedidos?page&limit` con el
 * Bearer de la sesión (L5: como `usuario/reservas`, sin proxies). Forma exacta `MisPedidosRespuesta` (src/types/cuenta.ts).
 * El backend ya ordena (más nuevos primero) y deja fuera los «esperando pago» de más de 7 días.
 */

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; items: MiPedidoResumen[]; total: number; pagina: number }
  | { fase: 'error'; texto: string; sesion: boolean }

const TEXTO_ERROR = 'No pudimos cargar tus pedidos. Intenta de nuevo en un momento.'
const TEXTO_SESION = 'Tu sesión expiró. Vuelve a iniciar sesión.'

function TarjetaPedido({ pedido }: { pedido: MiPedidoResumen }) {
  const entrega = textoEntrega(pedido.tipo_entrega)
  const fechaEntrega = fechaEntregaLarga(pedido.fecha_entrega)
  return (
    <li
      data-testid={`mis-pedido-${pedido.numero_pedido}`}
      data-id={pedido.id}
      data-estado={pedido.estado}
      className="rounded-2xl border border-neutro-borde bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="mb-0 break-all font-heading text-lg leading-tight text-verde">Pedido {pedido.numero_pedido}</h2>
        {pedido.estado && (
          <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${claseEstado(pedido.estado)}`}>
            {etiquetaEstado(pedido.estado)}
          </span>
        )}
      </div>
      <ul className="mb-3 space-y-1 text-base text-verde-tipografia">
        {pedido.fecha && <li className="text-sm text-verde-suave">Hecho el {fechaPedido(pedido.fecha)}</li>}
        <li className="flex items-start gap-2">
          <Package className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
          <span>
            {textoProductos(pedido.num_productos)} · <span className="font-semibold">{dinero(pedido.total)}</span>
          </span>
        </li>
        {(entrega || fechaEntrega) && (
          <li className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span className="min-w-0">{[entrega, fechaEntrega].filter(Boolean).join(' · ')}</span>
          </li>
        )}
      </ul>
      <Link
        href={`/usuario/pedidos/${encodeURIComponent(pedido.id)}`}
        data-testid="mis-pedido-ver"
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-terracota px-4 py-2 font-semibold text-white hover:bg-terracota-oscuro hover:text-white"
      >
        Ver detalle
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </li>
  )
}

export default function MisPedidosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const token = session?.accessToken
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const [cargandoMas, setCargandoMas] = useState(false)
  const [errorMas, setErrorMas] = useState<string | null>(null)
  const pedidoRef = useRef(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=%2Fusuario%2Fpedidos')
    }
  }, [status, router])

  /** Una página de la lista; null = error (ya pintado). */
  const pedir = useCallback(
    async (pagina: number) => {
      if (!token) return { sesion: true as const }
      const res = await fetch(`${API_URL}/api/usuario/mis-pedidos?page=${pagina}&limit=${PEDIDOS_POR_PAGINA}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.status === 401) return { sesion: true as const }
      if (!res.ok) return null
      return normalizarLista(await res.json())
    },
    [token]
  )

  const cargar = useCallback(async () => {
    const pedido = ++pedidoRef.current
    setEstado({ fase: 'cargando' })
    setErrorMas(null)
    try {
      const r = await pedir(1)
      if (pedido !== pedidoRef.current) return
      if (r && 'sesion' in r) setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
      else if (r) setEstado({ fase: 'listo', items: r.items, total: r.total, pagina: 1 })
      else setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
    } catch {
      if (pedido === pedidoRef.current) setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
    }
  }, [pedir])

  useEffect(() => {
    if (status === 'authenticated') void cargar()
  }, [status, cargar])

  const cargarMas = async () => {
    if (estado.fase !== 'listo' || cargandoMas) return
    const pedido = pedidoRef.current
    setCargandoMas(true)
    setErrorMas(null)
    try {
      const r = await pedir(estado.pagina + 1)
      if (pedido !== pedidoRef.current) return
      if (r && 'sesion' in r) {
        setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
      } else if (r) {
        // Sin repetidos si entró un pedido nuevo entre páginas.
        const vistos = new Set(estado.items.map((p) => p.id))
        setEstado({
          fase: 'listo',
          items: [...estado.items, ...r.items.filter((p) => !vistos.has(p.id))],
          total: r.total,
          pagina: estado.pagina + 1,
        })
      } else {
        setErrorMas(TEXTO_ERROR)
      }
    } catch {
      if (pedido === pedidoRef.current) setErrorMas(TEXTO_ERROR)
    } finally {
      setCargandoMas(false)
    }
  }

  if (status !== 'authenticated' || estado.fase === 'cargando') {
    return (
      <div className="min-h-screen bg-neutro-crema px-4 pb-16 pt-32 sm:pt-36">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="mb-6 font-heading text-3xl text-verde">Mis pedidos</h1>
          <div data-testid="mis-pedidos-cargando" role="status" className="flex items-center gap-3 text-verde-tipografia">
            <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-b-2 border-verde" aria-hidden="true" />
            Cargando tus pedidos...
          </div>
        </div>
      </div>
    )
  }

  const hayMas = estado.fase === 'listo' && estado.items.length < estado.total

  return (
    <div className="min-h-screen bg-neutro-crema px-4 pb-16 pt-32 sm:pt-36">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 font-heading text-3xl text-verde">Mis pedidos</h1>

        {estado.fase === 'error' && (
          <div data-testid="mis-pedidos-error" role="alert" className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-4 text-base text-verde-tipografia">{estado.texto}</p>
            {estado.sesion ? (
              <Link
                href="/auth/signin?callbackUrl=%2Fusuario%2Fpedidos"
                className="inline-flex min-h-[44px] items-center rounded-xl bg-terracota px-5 py-2 font-semibold text-white hover:bg-terracota-oscuro hover:text-white"
              >
                Iniciar sesión
              </Link>
            ) : (
              <button
                type="button"
                data-testid="mis-pedidos-reintentar"
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
          <>
            <ul data-testid="mis-pedidos-lista" className="space-y-4">
              {estado.items.map((p) => (
                <TarjetaPedido key={p.id} pedido={p} />
              ))}
            </ul>
            {hayMas && (
              <div className="mt-6 text-center">
                {errorMas && (
                  <p role="alert" className="mb-3 text-sm text-rojo">
                    {errorMas}
                  </p>
                )}
                <button
                  type="button"
                  data-testid="mis-pedidos-mas"
                  onClick={() => void cargarMas()}
                  disabled={cargandoMas}
                  className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-verde px-5 py-2 font-semibold text-verde hover:bg-verde/5 disabled:opacity-60"
                >
                  {cargandoMas ? 'Cargando…' : 'Ver más pedidos'}
                </button>
              </div>
            )}
          </>
        )}

        {estado.fase === 'listo' && estado.items.length === 0 && (
          <div data-testid="mis-pedidos-vacio" className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-verde-suave" aria-hidden="true" />
            <h2 className="mb-2 font-heading text-xl text-verde">Todavía no tienes pedidos</h2>
            <p className="mb-6 text-base text-verde-tipografia">
              Los pedidos que hagas en la tienda con esta cuenta aparecen aquí.
            </p>
            <Link
              href="/tienda"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-verde px-5 py-2 font-semibold text-white hover:bg-verde-dark hover:text-white"
            >
              Ir a la tienda
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
