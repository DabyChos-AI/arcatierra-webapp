'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CreditCard, MapPin, RefreshCw, Truck } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type { MiPedidoDetalle } from '@/types/cuenta'
import {
  claseEstado,
  dinero,
  etiquetaEstado,
  fechaEntregaLarga,
  fechaPedido,
  normalizarDetalle,
  textoEntrega,
} from '../normalizar'

/**
 * R11b · ACC1 (sesión 51): detalle de un pedido del cliente. GET DIRECTO `${API_URL}/api/usuario/mis-pedidos/{id}` con el
 * Bearer (L5). 404 = no existe o NO es tuyo (misma respuesta del backend; aquí el mismo texto). Next 15 entrega el param
 * codificado: se decodifica y se vuelve a codificar para la URL de la API.
 */

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; pedido: MiPedidoDetalle }
  | { fase: 'no_encontrado' }
  | { fase: 'error'; texto: string; sesion: boolean }

const TEXTO_ERROR = 'No pudimos cargar este pedido. Intenta de nuevo en un momento.'
const TEXTO_SESION = 'Tu sesión expiró. Vuelve a iniciar sesión.'

function decodificar(valor: string): string {
  try {
    return decodeURIComponent(valor)
  } catch {
    return valor
  }
}

function Volver() {
  return (
    <Link
      href="/usuario/pedidos"
      data-testid="pedido-detalle-volver"
      className="mb-4 inline-flex min-h-[44px] items-center gap-1 font-medium text-terracota hover:underline"
    >
      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      Mis pedidos
    </Link>
  )
}

function Fila({ etiqueta, valor, fuerte, testId }: { etiqueta: string; valor: string; fuerte?: boolean; testId?: string }) {
  return (
    <div className={`flex justify-between gap-4 ${fuerte ? 'border-t border-neutro-borde pt-2 text-lg font-semibold text-verde' : ''}`}>
      <dt>{etiqueta}</dt>
      <dd data-testid={testId} className="mb-0 text-right">
        {valor}
      </dd>
    </div>
  )
}

function DetallePedido({ pedido }: { pedido: MiPedidoDetalle }) {
  const entrega = textoEntrega(pedido.tipo_entrega)
  const fechaEntrega = fechaEntregaLarga(pedido.fecha_entrega)
  return (
    <article
      data-testid="pedido-detalle"
      data-numero={pedido.numero_pedido}
      data-estado={pedido.estado}
      className="space-y-4"
    >
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {pedido.estado && (
            <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${claseEstado(pedido.estado)}`}>
              {etiquetaEstado(pedido.estado)}
            </span>
          )}
          {pedido.fecha && <span className="text-sm text-verde-suave">Hecho el {fechaPedido(pedido.fecha)}</span>}
        </div>
        {pedido.pago_texto && (
          <p className="mb-0 mt-2 flex items-start gap-2 text-base text-verde-tipografia">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span>{pedido.pago_texto}</span>
          </p>
        )}
      </div>

      <section aria-labelledby="pedido-productos" className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <h2 id="pedido-productos" className="mb-3 font-heading text-xl text-verde">
          Productos
        </h2>
        {pedido.renglones.length > 0 ? (
          <ul className="divide-y divide-neutro-borde">
            {pedido.renglones.map((r, i) => (
              <li key={`${r.nombre}-${i}`} data-testid="pedido-renglon" className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="mb-0 break-words font-medium text-verde-tipografia">{r.nombre}</p>
                  <p className="mb-0 text-sm text-verde-suave">
                    {r.cantidad} × {dinero(r.precio_unitario)}
                  </p>
                </div>
                <span className="shrink-0 font-medium text-verde-tipografia">{dinero(r.subtotal)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-0 text-base text-verde-suave">Este pedido no trae el detalle de productos.</p>
        )}
        <dl className="mt-3 space-y-1 border-t border-neutro-borde pt-3 text-base text-verde-tipografia">
          {pedido.sub_total !== null && <Fila etiqueta="Subtotal" valor={dinero(pedido.sub_total)} />}
          {pedido.costo_envio !== null && (
            <Fila etiqueta="Envío" valor={pedido.costo_envio === 0 ? 'Sin costo' : dinero(pedido.costo_envio)} />
          )}
          {pedido.descuento !== null && pedido.descuento > 0 && (
            <Fila etiqueta="Descuento" valor={`−${dinero(pedido.descuento)}`} />
          )}
          <Fila etiqueta="Total" valor={dinero(pedido.total)} fuerte testId="pedido-total" />
        </dl>
      </section>

      {(entrega || fechaEntrega || pedido.direccion_entrega || pedido.notas_entrega) && (
        <section aria-labelledby="pedido-entrega" className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <h2 id="pedido-entrega" className="mb-3 font-heading text-xl text-verde">
            Entrega
          </h2>
          <ul className="space-y-2 text-base text-verde-tipografia">
            {(entrega || fechaEntrega) && (
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
                <span className="min-w-0">{[entrega, fechaEntrega].filter(Boolean).join(' · ')}</span>
              </li>
            )}
            {pedido.direccion_entrega && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
                <span className="min-w-0 break-words">{pedido.direccion_entrega}</span>
              </li>
            )}
            {pedido.notas_entrega && (
              <li className="text-sm text-verde-suave">
                <span className="font-medium">Notas:</span> {pedido.notas_entrega}
              </li>
            )}
          </ul>
        </section>
      )}
    </article>
  )
}

export default function MiPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idCrudo } = use(params)
  const id = decodificar(idCrudo)
  const { data: session, status } = useSession()
  const router = useRouter()
  const token = session?.accessToken
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const pedidoRef = useRef(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/usuario/pedidos/${encodeURIComponent(id)}`)}`)
    }
  }, [status, router, id])

  const cargar = useCallback(async () => {
    const pedido = ++pedidoRef.current
    setEstado({ fase: 'cargando' })
    if (!token) {
      setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/usuario/mis-pedidos/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (pedido !== pedidoRef.current) return
      if (res.status === 401) return setEstado({ fase: 'error', texto: TEXTO_SESION, sesion: true })
      // 404 = no existe o no es tuyo; 400/422 = id con otra forma: para el cliente es lo mismo.
      if (res.status === 404 || res.status === 400 || res.status === 422) return setEstado({ fase: 'no_encontrado' })
      if (!res.ok) return setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
      const detalle = normalizarDetalle(await res.json())
      if (pedido !== pedidoRef.current) return
      setEstado(detalle ? { fase: 'listo', pedido: detalle } : { fase: 'error', texto: TEXTO_ERROR, sesion: false })
    } catch {
      if (pedido === pedidoRef.current) setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
    }
  }, [token, id])

  useEffect(() => {
    if (status === 'authenticated') void cargar()
  }, [status, cargar])

  const titulo = estado.fase === 'listo' ? `Pedido ${estado.pedido.numero_pedido}` : 'Detalle del pedido'

  return (
    <div className="min-h-screen bg-neutro-crema px-4 pb-16 pt-32 sm:pt-36">
      <div className="mx-auto w-full max-w-2xl">
        <Volver />
        <h1 className="mb-6 break-all font-heading text-3xl text-verde">{titulo}</h1>

        {(status !== 'authenticated' || estado.fase === 'cargando') && (
          <div data-testid="pedido-detalle-cargando" role="status" className="flex items-center gap-3 text-verde-tipografia">
            <div className="h-6 w-6 shrink-0 animate-spin rounded-full border-b-2 border-verde" aria-hidden="true" />
            Cargando tu pedido...
          </div>
        )}

        {status === 'authenticated' && estado.fase === 'no_encontrado' && (
          <div data-testid="pedido-detalle-no-encontrado" className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-4 text-base text-verde-tipografia">No encontramos este pedido en tu cuenta.</p>
            <Link
              href="/usuario/pedidos"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-terracota px-5 py-2 font-semibold text-white hover:bg-terracota-oscuro hover:text-white"
            >
              Ver mis pedidos
            </Link>
          </div>
        )}

        {status === 'authenticated' && estado.fase === 'error' && (
          <div data-testid="pedido-detalle-error" role="alert" className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-4 text-base text-verde-tipografia">{estado.texto}</p>
            {estado.sesion ? (
              <Link
                href={`/auth/signin?callbackUrl=${encodeURIComponent(`/usuario/pedidos/${encodeURIComponent(id)}`)}`}
                className="inline-flex min-h-[44px] items-center rounded-xl bg-terracota px-5 py-2 font-semibold text-white hover:bg-terracota-oscuro hover:text-white"
              >
                Iniciar sesión
              </Link>
            ) : (
              <button
                type="button"
                data-testid="pedido-detalle-reintentar"
                onClick={() => void cargar()}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-terracota px-5 py-2 font-semibold text-white hover:bg-terracota-oscuro"
              >
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
                Intentar de nuevo
              </button>
            )}
          </div>
        )}

        {status === 'authenticated' && estado.fase === 'listo' && <DetallePedido pedido={estado.pedido} />}
      </div>
    </div>
  )
}
