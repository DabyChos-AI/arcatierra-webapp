'use client'

// R15 v2 · F6 (compras, sesión 64): la pestaña «Pedidos» de Mi cuenta del sitio nuevo (`/usuario/pedidos`; contrato v2 §8-F6, D-F6-04, D-F6-08).
// La MISMA conducta que `src/app/usuario/pedidos/page.tsx` de hoy, con el diseño de la maqueta (la tarjeta de la pestaña; el marco, el `h1` y el
// `<main>` son de cuenta, D-F6-08 P-1): GET DIRECTO `${API_URL}/api/usuario/mis-pedidos?page&limit` con el Bearer de la sesión (sin proxy,
// como hoy, `:100-103`), «Ver más pedidos» sin repetidos (`:130-157`). Textos de hoy, letra por letra, con su línea; la lectura y los textos que
// ya se exportan se importan de `usuario/pedidos/normalizar.ts`.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api'
import type { MiPedidoResumen } from '@/types/cuenta'
import {
  PEDIDOS_POR_PAGINA,
  dinero,
  etiquetaEstado,
  fechaEntregaLarga,
  fechaPedido,
  normalizarLista,
  textoEntrega,
  textoProductos,
} from '@/app/usuario/pedidos/normalizar'
import { HREF_TIENDA } from '@/components/sitio-nuevo/armazon/enlaces'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import { hrefIniciarSesion, juntarPaginas, tonoEstadoPedido } from './compras'

const B = 'sn-pedidos'
const ID_TITULO = `${B}-titulo`
const DESTINO = '/usuario/pedidos'

// `usuario/pedidos/page.tsx:33-34`
const TEXTO_ERROR = 'No pudimos cargar tus pedidos. Intenta de nuevo en un momento.'
const TEXTO_SESION = 'Tu sesión expiró. Vuelve a iniciar sesión.'

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; items: MiPedidoResumen[]; total: number; pagina: number }
  | { fase: 'error'; texto: string; sesion: boolean }

function RenglonPedido({ pedido, primero }: { pedido: MiPedidoResumen; primero: boolean }) {
  const entrega = textoEntrega(pedido.tipo_entrega)
  const fechaEntrega = fechaEntregaLarga(pedido.fecha_entrega)
  return (
    <li
      data-testid={`${B}-pedido`}
      data-id={pedido.id}
      data-numero={pedido.numero_pedido}
      data-estado={pedido.estado}
      className={`flex flex-col gap-3 py-4 min-[861px]:flex-row min-[861px]:items-start min-[861px]:justify-between ${primero ? '' : 'border-t border-solid border-sn-border'}`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* `:47` */}
          <Titulo nivel={3} tamano="h6" testId={`${B}-pedido-numero`} className="break-all">
            Pedido {pedido.numero_pedido}
          </Titulo>
          {pedido.estado && (
            <Insignia tono={tonoEstadoPedido(pedido.estado)} forma="pildora" testId={`${B}-pedido-estado`}>
              {etiquetaEstado(pedido.estado)}
            </Insignia>
          )}
        </div>
        {/* `:55` */}
        {pedido.fecha && (
          <Etiqueta tono="ink" testId={`${B}-pedido-fecha`}>
            Hecho el {fechaPedido(pedido.fecha)}
          </Etiqueta>
        )}
        {/* `:59` */}
        <Texto tamano="chico" peso="normal" testId={`${B}-pedido-productos`}>
          {textoProductos(pedido.num_productos)} ·{' '}
          <span data-testid={`${B}-pedido-total`} className="font-medium">
            {dinero(pedido.total)}
          </span>
        </Texto>
        {/* `:62-67` */}
        {(entrega || fechaEntrega) && (
          <Texto tamano="chico" peso="normal" testId={`${B}-pedido-entrega`} className="min-w-0">
            {[entrega, fechaEntrega].filter(Boolean).join(' · ')}
          </Texto>
        )}
      </div>
      {/* `:69-76` */}
      <Boton href={`${DESTINO}/${encodeURIComponent(pedido.id)}`} variante="texto" flecha testId={`${B}-pedido-ver`} className="shrink-0">
        Ver detalle
      </Boton>
    </li>
  )
}

export default function MisPedidos() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const token = session?.accessToken
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const [cargandoMas, setCargandoMas] = useState(false)
  const [errorMas, setErrorMas] = useState<string | null>(null)
  const pedidoRef = useRef(0)

  // `:90-94`
  useEffect(() => {
    if (status === 'unauthenticated') router.push(hrefIniciarSesion(DESTINO))
  }, [status, router])

  /** Una página de la lista (`:97-109`); null = error. */
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
    [token],
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
        setEstado({ fase: 'listo', items: juntarPaginas(estado.items, r.items), total: r.total, pagina: estado.pagina + 1 })
      } else {
        setErrorMas(TEXTO_ERROR)
      }
    } catch {
      if (pedido === pedidoRef.current) setErrorMas(TEXTO_ERROR)
    } finally {
      setCargandoMas(false)
    }
  }

  const cargando = status !== 'authenticated' || estado.fase === 'cargando'
  const hayMas = estado.fase === 'listo' && estado.items.length < estado.total

  return (
    <section aria-labelledby={ID_TITULO} data-testid={B} className="w-full">
      <Tarjeta as="div" relleno="normal">
        <div className="flex flex-col gap-5">
          {/* El `h1` de hoy (`:163`, `:178`); en el sitio nuevo el `h1` es del marco de cuenta. */}
          <Titulo nivel={2} tamano="h4" id={ID_TITULO} testId={ID_TITULO}>
            Mis pedidos
          </Titulo>

          {cargando && (
            <p data-testid={`${B}-cargando`} role="status" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
              Cargando tus pedidos...
            </p>
          )}

          {!cargando && estado.fase === 'error' && (
            <div data-testid={`${B}-error`} role="alert" className="flex flex-col items-start gap-4">
              <Texto tamano="chico" peso="normal">
                {estado.texto}
              </Texto>
              {estado.sesion ? (
                <Boton href={hrefIniciarSesion(DESTINO)} testId={`${B}-entrar`}>
                  Iniciar sesión
                </Boton>
              ) : (
                <Boton onClick={() => void cargar()} testId={`${B}-reintentar`}>
                  Intentar de nuevo
                </Boton>
              )}
            </div>
          )}

          {!cargando && estado.fase === 'listo' && estado.items.length > 0 && (
            <>
              <ul data-testid={`${B}-lista`} className="m-0 list-none p-0">
                {estado.items.map((p, i) => (
                  <RenglonPedido key={p.id} pedido={p} primero={i === 0} />
                ))}
              </ul>
              {hayMas && (
                <div className="flex flex-col items-start gap-3">
                  {errorMas && (
                    <AvisoEnLinea tono="error" testId={`${B}-mas-error`}>
                      {errorMas}
                    </AvisoEnLinea>
                  )}
                  {/* `:218-226` */}
                  <Boton variante="contorno" onClick={() => void cargarMas()} cargando={cargandoMas} textoCargando="Cargando…" testId={`${B}-mas`}>
                    Ver más pedidos
                  </Boton>
                </div>
              )}
            </>
          )}

          {/* `:232-246` */}
          {!cargando && estado.fase === 'listo' && estado.items.length === 0 && (
            <div data-testid={`${B}-vacio`} className="flex flex-col items-start gap-3">
              <Titulo nivel={3} tamano="h5">
                Todavía no tienes pedidos
              </Titulo>
              <Texto tamano="chico" peso="normal">
                Los pedidos que hagas en la tienda con esta cuenta aparecen aquí.
              </Texto>
              <Boton href={HREF_TIENDA} testId={`${B}-vacio-tienda`}>
                Ir a la tienda
              </Boton>
            </div>
          )}
        </div>
      </Tarjeta>
    </section>
  )
}
