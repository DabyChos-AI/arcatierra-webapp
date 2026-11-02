'use client'

// R15 v2 · F6 (compras, sesión 64): el detalle de un pedido en Mi cuenta del sitio nuevo (`/usuario/pedidos/<id>`; contrato v2 §8-F6, D-F6-04,
// D-F6-08). La MISMA conducta que `src/app/usuario/pedidos/[id]/page.tsx` de hoy: GET DIRECTO `${API_URL}/api/usuario/mis-pedidos/{id}` con el
// Bearer (`:180-183`); 404, 400 y 422 = «no está en tu cuenta» (`:186-187`); 401 = sesión. Textos de hoy letra por letra con su línea. Va dentro
// del marco de cuenta (D-F6-08 P-1): una sección con su `h2` y las migas a «Mis pedidos» (P-11).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api'
import type { MiPedidoDetalle } from '@/types/cuenta'
import {
  dinero,
  etiquetaEstado,
  fechaEntregaLarga,
  fechaPedido,
  normalizarDetalle,
  textoEntrega,
} from '@/app/usuario/pedidos/normalizar'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Migas from '@/components/sitio-nuevo/ui/Migas'
import { hrefIniciarSesion, tonoEstadoPedido } from './compras'

const B = 'sn-detalle-pedido'
const ID_TITULO = `${B}-titulo`
const LISTA = '/usuario/pedidos'

// `[id]/page.tsx:32-33`
const TEXTO_ERROR = 'No pudimos cargar este pedido. Intenta de nuevo en un momento.'
const TEXTO_SESION = 'Tu sesión expiró. Vuelve a iniciar sesión.'

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; pedido: MiPedidoDetalle }
  | { fase: 'no_encontrado' }
  | { fase: 'error'; texto: string; sesion: boolean }

/** Un renglón de las cuentas (`:56-65`). */
function Cuenta({ etiqueta, valor, testId, fuerte = false, gratis }: { etiqueta: string; valor: string; testId: string; fuerte?: boolean; gratis?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${fuerte ? 'border-t border-solid border-sn-border pt-2' : ''}`}>
      <dt className={`m-0 font-sn-texto text-sn-ink ${fuerte ? 'text-sn-cuerpo font-medium' : 'text-sn-cuerpo-sm'}`}>{etiqueta}</dt>
      <dd
        data-testid={testId}
        data-gratis={gratis === undefined ? undefined : gratis ? 'true' : 'false'}
        className={`m-0 text-right font-sn-texto text-sn-ink ${fuerte ? 'text-sn-cuerpo font-medium' : 'text-sn-cuerpo-sm'}`}
      >
        {valor}
      </dd>
    </div>
  )
}

function Detalle({ pedido }: { pedido: MiPedidoDetalle }) {
  const entrega = textoEntrega(pedido.tipo_entrega)
  const fechaEntrega = fechaEntregaLarga(pedido.fecha_entrega)
  return (
    <>
      {/* `:78-91` */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {pedido.estado && (
            <Insignia tono={tonoEstadoPedido(pedido.estado)} forma="pildora" testId={`${B}-estado`}>
              {etiquetaEstado(pedido.estado)}
            </Insignia>
          )}
          {pedido.fecha && (
            <Etiqueta tono="ink" as="span" testId={`${B}-fecha`}>
              Hecho el {fechaPedido(pedido.fecha)}
            </Etiqueta>
          )}
        </div>
        {pedido.pago_texto && (
          <Texto tamano="chico" peso="normal" testId={`${B}-pago`}>
            {pedido.pago_texto}
          </Texto>
        )}
      </div>

      {/* `:94-125` */}
      <section aria-labelledby={`${B}-productos-titulo`} data-testid={`${B}-productos`} className="flex flex-col gap-3">
        <Titulo nivel={3} tamano="h5" id={`${B}-productos-titulo`}>
          Productos
        </Titulo>
        {pedido.renglones.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {pedido.renglones.map((r, i) => (
              <li
                key={`${r.nombre}-${i}`}
                data-testid={`${B}-renglon`}
                data-indice={i}
                className={`flex items-start justify-between gap-3 py-2 ${i === 0 ? '' : 'border-t border-solid border-sn-border'}`}
              >
                <div className="min-w-0">
                  <Texto tamano="chico" peso="medio" testId={`${B}-renglon-nombre`} className="break-words">
                    {r.nombre}
                  </Texto>
                  <Texto tamano="mini" peso="normal" testId={`${B}-renglon-cantidad`}>
                    {r.cantidad} × {dinero(r.precio_unitario)}
                  </Texto>
                </div>
                <Texto as="span" tamano="chico" peso="medio" testId={`${B}-renglon-subtotal`} className="shrink-0">
                  {dinero(r.subtotal)}
                </Texto>
              </li>
            ))}
          </ul>
        ) : (
          <Texto tamano="chico" peso="normal" testId={`${B}-sin-renglones`}>
            Este pedido no trae el detalle de productos.
          </Texto>
        )}
        <dl className="m-0 flex flex-col gap-1 border-t border-solid border-sn-border pt-3">
          {pedido.sub_total !== null && <Cuenta etiqueta="Subtotal" valor={dinero(pedido.sub_total)} testId={`${B}-subtotal`} />}
          {pedido.costo_envio !== null && (
            <Cuenta
              etiqueta="Envío"
              valor={pedido.costo_envio === 0 ? 'Sin costo' : dinero(pedido.costo_envio)}
              testId={`${B}-envio`}
              gratis={pedido.costo_envio === 0}
            />
          )}
          {pedido.descuento !== null && pedido.descuento > 0 && (
            <Cuenta etiqueta="Descuento" valor={`−${dinero(pedido.descuento)}`} testId={`${B}-descuento`} />
          )}
          <Cuenta etiqueta="Total" valor={dinero(pedido.total)} testId={`${B}-total`} fuerte />
        </dl>
      </section>

      {/* `:127-152` */}
      {(entrega || fechaEntrega || pedido.direccion_entrega || pedido.notas_entrega) && (
        <section aria-labelledby={`${B}-entrega-titulo`} data-testid={`${B}-entrega`} className="flex flex-col gap-2">
          <Titulo nivel={3} tamano="h5" id={`${B}-entrega-titulo`}>
            Entrega
          </Titulo>
          {(entrega || fechaEntrega) && (
            <Texto tamano="chico" peso="normal" testId={`${B}-entrega-tipo`}>
              {[entrega, fechaEntrega].filter(Boolean).join(' · ')}
            </Texto>
          )}
          {pedido.direccion_entrega && (
            <Texto tamano="chico" peso="normal" testId={`${B}-entrega-direccion`} className="break-words">
              {pedido.direccion_entrega}
            </Texto>
          )}
          {pedido.notas_entrega && (
            <Texto tamano="chico" peso="normal" testId={`${B}-entrega-notas`}>
              <span className="font-medium">Notas:</span> {pedido.notas_entrega}
            </Texto>
          )}
        </section>
      )}
    </>
  )
}

export default function DetallePedido({ id }: { id: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const token = session?.accessToken
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const pedidoRef = useRef(0)
  const destino = `${LISTA}/${encodeURIComponent(id)}`

  // `:166-170`
  useEffect(() => {
    if (status === 'unauthenticated') router.push(hrefIniciarSesion(destino))
  }, [status, router, destino])

  // `:172-195`
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

  const cargando = status !== 'authenticated' || estado.fase === 'cargando'
  // `:201`
  const titulo = estado.fase === 'listo' ? `Pedido ${estado.pedido.numero_pedido}` : 'Detalle del pedido'

  return (
    <section
      aria-labelledby={ID_TITULO}
      data-testid={B}
      data-id={id}
      data-numero={estado.fase === 'listo' ? estado.pedido.numero_pedido : undefined}
      data-estado={estado.fase === 'listo' ? estado.pedido.estado : undefined}
      className="w-full"
    >
      <Tarjeta as="div" relleno="normal">
        <div className="flex flex-col gap-5">
          {/* La liga «Mis pedidos» de hoy (`:43-54`) como migas (D-F6-08 P-11; «Ruta de navegación», C24, D-F3-22 P-12). */}
          <Migas
            etiqueta="Ruta de navegación"
            items={[{ texto: 'Mis pedidos', href: LISTA }, { texto: titulo }]}
            testId={`${B}-migas`}
          />
          <Titulo nivel={2} tamano="h4" id={ID_TITULO} testId={ID_TITULO} className="break-all">
            {titulo}
          </Titulo>

          {cargando && (
            <p data-testid={`${B}-cargando`} role="status" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
              Cargando tu pedido...
            </p>
          )}

          {/* `:216-226` */}
          {!cargando && estado.fase === 'no_encontrado' && (
            <div data-testid={`${B}-no-encontrado`} className="flex flex-col items-start gap-4">
              <Texto tamano="chico" peso="normal">
                No encontramos este pedido en tu cuenta.
              </Texto>
              <Boton href={LISTA} testId={`${B}-no-encontrado-volver`}>
                Ver mis pedidos
              </Boton>
            </div>
          )}

          {/* `:228-250` */}
          {!cargando && estado.fase === 'error' && (
            <div data-testid={`${B}-error`} role="alert" className="flex flex-col items-start gap-4">
              <Texto tamano="chico" peso="normal">
                {estado.texto}
              </Texto>
              {estado.sesion ? (
                <Boton href={hrefIniciarSesion(destino)} testId={`${B}-entrar`}>
                  Iniciar sesión
                </Boton>
              ) : (
                <Boton onClick={() => void cargar()} testId={`${B}-reintentar`}>
                  Intentar de nuevo
                </Boton>
              )}
            </div>
          )}

          {!cargando && estado.fase === 'listo' && <Detalle pedido={estado.pedido} />}
        </div>
      </Tarjeta>
    </section>
  )
}
