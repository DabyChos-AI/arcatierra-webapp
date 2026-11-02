'use client'

// R15 v2 · F6 (cuenta, sesión 64): el Resumen de Mi cuenta, `/usuario/dashboard` (f6/cuenta-F6.md §3; D-F6-11 P-6, P-7). En el orden de la
// maqueta (suscripciones activas · próxima canasta · últimos pedidos) y después lo de hoy que la maqueta no trae (las cifras, el impacto, los
// pedidos sin completar y «Datos actualizados»). Textos, datos y llamadas de hoy (DR-17); cada bloque con su estado de carga, vacío y error.
// - `GET /api/dashboard/resumen` y `/impacto` (proxies de hoy, `usuario/dashboard/page.tsx:153-157`); «Actualizar datos» los vuelve a pedir.
// - `GET ${API_URL}/api/usuario/mis-suscripciones` y `/mis-pedidos?page=1&limit=3` (Bearer, `no-store`): las llamadas de hoy de Mis
//   suscripciones y Mis pedidos (`usuario/suscripciones/page.tsx:156-159`, `usuario/pedidos/page.tsx:100-103`), aquí en otra pantalla (C46).
// - DR-18 (D-F6-08 P-8): la pieza de compras `compras/ProximaEntrega.tsx` con `GET ${API_URL}/api/subscriptions/extras-disponibles` (solo con
//   una activa) y su marca C51 cuando el plazo está abierto. Base de testids `sn-mi-cuenta-entrega`.
// - No pasan: «Mi Dashboard Personal» y «Miembro desde {n} días» (el saludo va en el marco y «Miembro desde» en Datos), «{total} total,
//   {pausadas} pausadas» (D-12), «Completar pago» y «¿Te gustaría completarlos?» (D-13: llevaba a `/checkout?pedido=…`, que el checkout no
//   lee), «Ver todos los pedidos pendientes» (no hacía nada), «Mis Direcciones» (tiene su pestaña) y «Acciones Rápidas» (sus destinos están
//   en el menú del marco y en la cabecera). Hoy, si el resumen no responde bien, se pintan ceros; aquí se dice que no se pudo leer.
// - El horario de entrega no se pinta aquí: la suscripción puede ser de recoger y la pantalla no lo sabe (sin cifras de la lista corta).

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import ProximaEntrega, { type EstadoEntrega } from '@/components/sitio-nuevo/compras/ProximaEntrega'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import { entregaDe, etiquetaEstadoSuscripcion, leerEntregas, tonoEstadoSuscripcion } from '@/components/sitio-nuevo/compras/compras'
import { API_URL } from '@/lib/api'
import { TEXTO_COBRO_FALLIDO, type MiPedidoResumen, type MiSuscripcion } from '@/types/cuenta'
import { fechaLarga, normalizarSuscripciones, textoFrecuencia } from '@/app/usuario/suscripciones/normalizar'
import { dinero, fechaPedido, normalizarLista, textoProductos } from '@/app/usuario/pedidos/normalizar'
import PestanaCuenta from './PestanaCuenta'
import { ENLACE_MI_CUENTA } from '@/components/sitio-nuevo/armazon/enlaces'
import { enlaceDeHoy } from './pestanas'
import { activasPorProxima, type ImpactoCuenta, type ResumenCuenta } from './resumen'
import {
  TEXTO_ERROR_CARGANDO,
  TEXTO_ERROR_PEDIDOS,
  TEXTO_ERROR_SUSCRIPCIONES,
  TEXTO_REINTENTAR,
  TEXTO_SESION_EXPIRADA,
} from './textos'

const R = 'sn-mi-cuenta-resumen'

type Carga<T> = { fase: 'cargando' } | { fase: 'listo'; datos: T } | { fase: 'error'; texto: string; sesion: boolean }
type CargaEntregas = { fase: 'cargando' } | { fase: 'listo'; datos: CanastaExtras[] } | { fase: 'error'; detalle: string }

const CLASE_LIGA = unirClases('font-sn-mono text-sn-boton-sm font-medium uppercase text-sn-terra underline-offset-4 hover:text-sn-ink hover:underline', FOCO)
const CLASE_META = 'm-0 font-sn-mono text-sn-etiqueta font-normal uppercase text-sn-ink/70'

/** Un bloque de la maqueta (`.cuenta-card`): tarjeta blanca con su h3. */
function Bloque({ titulo, testId, children }: { titulo?: React.ReactNode; testId: string; children: React.ReactNode }) {
  return (
    <Tarjeta as="div" relleno="normal" testId={testId}>
      {titulo && (
        <Titulo nivel={3} tamano="h4" className="mb-[18px]">
          {titulo}
        </Titulo>
      )}
      {children}
    </Tarjeta>
  )
}

function Esqueleto({ testId, renglones = 2 }: { testId: string; renglones?: number }) {
  return (
    <div data-testid={testId} aria-hidden="true" className="flex flex-col gap-3">
      {Array.from({ length: renglones }, (_, i) => (
        <span key={i} className="block h-6 rounded-sn-boton bg-sn-ink/[0.06]" />
      ))}
    </div>
  )
}

function Fallo({ base, texto, reintentar }: { base: string; texto: string; reintentar?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <AvisoEnLinea tono="error" testId={`${base}-error`}>
        {texto}
      </AvisoEnLinea>
      {reintentar && (
        <Boton variante="contorno" tamano="chico" onClick={reintentar} testId={`${base}-reintentar`}>
          {TEXTO_REINTENTAR}
        </Boton>
      )}
    </div>
  )
}

export default function PaginaResumen() {
  const { data: session, status } = useSession()
  const token = session?.accessToken
  const [resumen, setResumen] = useState<Carga<ResumenCuenta>>({ fase: 'cargando' })
  const [impacto, setImpacto] = useState<Carga<ImpactoCuenta>>({ fase: 'cargando' })
  const [suscripciones, setSuscripciones] = useState<Carga<MiSuscripcion[]>>({ fase: 'cargando' })
  const [pedidos, setPedidos] = useState<Carga<MiPedidoResumen[]>>({ fase: 'cargando' })
  const [entregas, setEntregas] = useState<CargaEntregas>({ fase: 'cargando' })
  const turnos = useRef({ panel: 0, suscripciones: 0, pedidos: 0, entrega: 0 })
  const arrancado = useRef(false)

  // Los dos proxies de hoy (`:153-168`). Hoy, si no responden bien, el tablero pinta ceros; aquí se dice que no se pudo.
  const pedirPanel = useCallback(async () => {
    const mio = ++turnos.current.panel
    setResumen({ fase: 'cargando' })
    setImpacto({ fase: 'cargando' })
    const leer = async <T,>(ruta: string): Promise<Carga<T>> => {
      try {
        const r = await fetch(ruta)
        if (!r.ok) return { fase: 'error', texto: TEXTO_ERROR_CARGANDO, sesion: r.status === 401 }
        return { fase: 'listo', datos: (await r.json()) as T }
      } catch {
        return { fase: 'error', texto: TEXTO_ERROR_CARGANDO, sesion: false }
      }
    }
    const [a, b] = await Promise.all([leer<ResumenCuenta>('/api/dashboard/resumen'), leer<ImpactoCuenta>('/api/dashboard/impacto')])
    if (mio !== turnos.current.panel) return
    setResumen(a)
    setImpacto(b)
  }, [])

  // DR-18: las próximas canastas de las activas, de `extras-disponibles` (la llamada de compras, `compras-F6.md` §8; `leerEntregas` de compras).
  const pedirEntrega = useCallback(async (bearer: string) => {
    const mio = ++turnos.current.entrega
    setEntregas({ fase: 'cargando' })
    try {
      const r = await fetch(`${API_URL}/api/subscriptions/extras-disponibles`, {
        headers: { Authorization: `Bearer ${bearer}` },
        cache: 'no-store',
      })
      const datos: unknown = await r.json().catch(() => null)
      if (mio !== turnos.current.entrega) return
      const lista = r.ok ? leerEntregas(datos) : null
      if (lista) return setEntregas({ fase: 'listo', datos: lista })
      // El `detail` de la API si es texto (el 500 de `subscriptions.py:322`); si no, la pieza pone su respaldo.
      const detalle = (datos as { detail?: unknown } | null)?.detail
      setEntregas({ fase: 'error', detalle: typeof detalle === 'string' ? detalle : '' })
    } catch {
      if (mio === turnos.current.entrega) setEntregas({ fase: 'error', detalle: '' })
    }
  }, [])

  const pedirSuscripciones = useCallback(
    async (bearer: string | undefined) => {
      const mio = ++turnos.current.suscripciones
      setSuscripciones({ fase: 'cargando' })
      if (!bearer) return setSuscripciones({ fase: 'error', texto: TEXTO_SESION_EXPIRADA, sesion: true })
      try {
        const r = await fetch(`${API_URL}/api/usuario/mis-suscripciones`, { headers: { Authorization: `Bearer ${bearer}` }, cache: 'no-store' })
        if (mio !== turnos.current.suscripciones) return
        if (r.status === 401) return setSuscripciones({ fase: 'error', texto: TEXTO_SESION_EXPIRADA, sesion: true })
        if (!r.ok) return setSuscripciones({ fase: 'error', texto: TEXTO_ERROR_SUSCRIPCIONES, sesion: false })
        const datos = normalizarSuscripciones(await r.json())
        if (mio !== turnos.current.suscripciones) return
        if (!datos) return setSuscripciones({ fase: 'error', texto: TEXTO_ERROR_SUSCRIPCIONES, sesion: false })
        setSuscripciones({ fase: 'listo', datos: datos.items })
        // Compras P-13: `extras-disponibles` solo si hay al menos una activa.
        if (datos.items.some((s) => s.estado === 'activa')) void pedirEntrega(bearer)
      } catch {
        if (mio === turnos.current.suscripciones) setSuscripciones({ fase: 'error', texto: TEXTO_ERROR_SUSCRIPCIONES, sesion: false })
      }
    },
    [pedirEntrega],
  )

  const pedirPedidos = useCallback(async (bearer: string | undefined) => {
    const mio = ++turnos.current.pedidos
    setPedidos({ fase: 'cargando' })
    if (!bearer) return setPedidos({ fase: 'error', texto: TEXTO_SESION_EXPIRADA, sesion: true })
    try {
      const r = await fetch(`${API_URL}/api/usuario/mis-pedidos?page=1&limit=3`, { headers: { Authorization: `Bearer ${bearer}` }, cache: 'no-store' })
      if (mio !== turnos.current.pedidos) return
      if (r.status === 401) return setPedidos({ fase: 'error', texto: TEXTO_SESION_EXPIRADA, sesion: true })
      if (!r.ok) return setPedidos({ fase: 'error', texto: TEXTO_ERROR_PEDIDOS, sesion: false })
      const datos = normalizarLista(await r.json())
      if (mio !== turnos.current.pedidos) return
      setPedidos(datos ? { fase: 'listo', datos: datos.items } : { fase: 'error', texto: TEXTO_ERROR_PEDIDOS, sesion: false })
    } catch {
      if (mio === turnos.current.pedidos) setPedidos({ fase: 'error', texto: TEXTO_ERROR_PEDIDOS, sesion: false })
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || arrancado.current) return
    arrancado.current = true
    void pedirPanel()
    void pedirSuscripciones(token)
    void pedirPedidos(token)
  }, [status, token, pedirPanel, pedirSuscripciones, pedirPedidos])

  const activas = suscripciones.fase === 'listo' ? suscripciones.datos.filter((s) => s.estado === 'activa') : []
  const proxima = activasPorProxima(activas)[0] ?? null
  // La pieza de compras: cargando / error / la canasta de ESA suscripción (si `extras-disponibles` no la trae, no se pinta).
  let estadoPieza: EstadoEntrega | null = null
  if (proxima) {
    if (entregas.fase === 'cargando') estadoPieza = { fase: 'cargando' }
    else if (entregas.fase === 'error') estadoPieza = { fase: 'error', detalle: entregas.detalle }
    else {
      const canasta = entregaDe(proxima, entregas.datos)
      if (canasta) estadoPieza = { fase: 'listo', entrega: canasta }
    }
  }

  // D-F6-17: las cifras se pintan con las expresiones de HOY letra por letra (`usuario/dashboard/page.tsx:395-498`, `:502-527`, `:689-692`),
  // con los mismos nombres (`dashboardData`, `impactoData`, `pedido`) para que se lean contra esas líneas; «{total} total, {pausadas}
  // pausadas» (`:442`) no pasa (D-12).
  const dashboardData = resumen.fase === 'listo' ? resumen.datos : null
  const impactoData = impacto.fase === 'listo' ? impacto.datos : null
  const pendientes = dashboardData?.pedidos_abandonados
  const liga = (href: string) => enlaceDeHoy(href)

  return (
    <PestanaCuenta idTitulo={`${R}-titulo`} titulo={ENLACE_MI_CUENTA.texto} testId={R}>
      {/* 1 · Mis suscripciones (las activas) */}
      <Bloque titulo={liga('/usuario/suscripciones').texto} testId={`${R}-suscripciones`}>
        {suscripciones.fase === 'cargando' ? (
          <Esqueleto testId={`${R}-suscripciones-cargando`} />
        ) : suscripciones.fase === 'error' ? (
          <Fallo
            base={`${R}-suscripciones`}
            texto={suscripciones.texto}
            reintentar={suscripciones.sesion ? undefined : () => void pedirSuscripciones(token)}
          />
        ) : activas.length === 0 ? (
          <Texto tamano="chico" peso="normal" testId={`${R}-suscripciones-vacio`}>
            No tienes suscripciones
          </Texto>
        ) : (
          <ul className="m-0 list-none p-0">
            {activas.map((s, i) => {
              const frecuencia = textoFrecuencia(s.frecuencia)
              const fecha = fechaLarga(s.proxima_entrega)
              const etiqueta = etiquetaEstadoSuscripcion(s.estado)
              return (
                <li
                  key={s.id}
                  data-testid={`${R}-suscripciones-renglon`}
                  data-suscripcion-id={s.id}
                  className={unirClases(
                    'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[18px] py-4',
                    i === 0 ? 'pt-1' : 'border-0 border-t border-solid border-sn-border',
                  )}
                >
                  <div className="min-w-0">
                    <p className="m-0 font-sn-titulos text-sn-h6 font-normal text-sn-ink [overflow-wrap:anywhere]">{s.nombre}</p>
                    {(frecuencia || fecha) && (
                      <p className={unirClases(CLASE_META, 'mt-1')}>
                        {[frecuencia, fecha ? `Próxima canasta: ${fecha}` : null].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {s.cobro_fallido_desde && (
                      <AvisoEnLinea tono="atencion" className="mt-2">
                        {TEXTO_COBRO_FALLIDO}
                      </AvisoEnLinea>
                    )}
                  </div>
                  {etiqueta && (
                    <Insignia tono={tonoEstadoSuscripcion(s.estado)} forma="pildora">
                      {etiqueta}
                    </Insignia>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        <p className="m-0 mt-4">
          <Link href="/usuario/suscripciones" data-testid={`${R}-suscripciones-ver-todas`} className={CLASE_LIGA}>
            {liga('/usuario/suscripciones').texto}
          </Link>
        </p>
      </Bloque>

      {/* 2 · Próxima canasta (DR-18): la activa con la próxima canasta más cercana */}
      {proxima && (
        <Bloque titulo="Próxima canasta" testId={`${R}-proxima`}>
          <div className="flex flex-col gap-3">
            {proxima.proxima_entrega && (
              <p
                data-testid={`${R}-proxima-fecha`}
                data-fecha={proxima.proxima_entrega}
                className="m-0 font-sn-titulos text-sn-h5 font-normal text-sn-ink first-letter:uppercase"
              >
                {fechaLarga(proxima.proxima_entrega)}
              </p>
            )}
            <p className={CLASE_META}>{proxima.nombre}</p>
            {estadoPieza && (
              <ProximaEntrega
                suscripcionId={proxima.id}
                estado={estadoPieza}
                onReintentar={() => token && void pedirEntrega(token)}
                testId="sn-mi-cuenta-entrega"
              />
            )}
          </div>
        </Bloque>
      )}

      {/* 3 · Mis pedidos (los 3 más nuevos) */}
      <Bloque titulo={liga('/usuario/pedidos').texto} testId={`${R}-pedidos`}>
        {pedidos.fase === 'cargando' ? (
          <Esqueleto testId={`${R}-pedidos-cargando`} renglones={3} />
        ) : pedidos.fase === 'error' ? (
          <Fallo base={`${R}-pedidos`} texto={pedidos.texto} reintentar={pedidos.sesion ? undefined : () => void pedirPedidos(token)} />
        ) : pedidos.datos.length === 0 ? (
          <Texto tamano="chico" peso="normal" testId={`${R}-pedidos-vacio`}>
            Todavía no tienes pedidos
          </Texto>
        ) : (
          <ul className="m-0 list-none p-0">
            {pedidos.datos.map((p, i) => (
              <li
                key={p.id}
                data-testid={`${R}-pedidos-renglon`}
                data-pedido-id={p.id}
                className={unirClases(
                  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[14px] gap-y-1 py-[14px] min-[861px]:grid-cols-[auto_minmax(0,1fr)_auto_auto]',
                  i > 0 && 'border-0 border-t border-solid border-sn-border',
                )}
              >
                <Link
                  href={`/usuario/pedidos/${encodeURIComponent(p.id)}`}
                  className={unirClases('font-sn-mono text-sn-etiqueta font-medium text-sn-terra hover:text-sn-ink [overflow-wrap:anywhere]', FOCO)}
                >
                  Pedido {p.numero_pedido}
                </Link>
                <span className="font-sn-titulos text-sn-h6 font-normal text-sn-ink">{textoProductos(p.num_productos)}</span>
                <span className="font-sn-mono text-sn-etiqueta font-normal tracking-normal text-sn-ink/70">{fechaPedido(p.fecha)}</span>
                <span className="font-sn-titulos text-sn-h6 font-normal text-sn-ink">{dinero(p.total)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="m-0 mt-4">
          <Link href="/usuario/pedidos" data-testid={`${R}-pedidos-ver-todos`} className={CLASE_LIGA}>
            {liga('/usuario/pedidos').texto}
          </Link>
        </p>
      </Bloque>

      {/* 4 · Cifras (sin título propio: la maqueta no las trae) */}
      <Bloque testId={`${R}-cifras`}>
        {resumen.fase === 'cargando' ? (
          <Esqueleto testId={`${R}-cifras-cargando`} renglones={3} />
        ) : resumen.fase === 'error' ? (
          <Fallo base={`${R}-cifras`} texto={resumen.texto} reintentar={() => void pedirPanel()} />
        ) : (
          <dl className="m-0 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div data-testid={`${R}-cifras-pedidos`}>
              <dt className="font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-terra">Total Pedidos</dt>
              <dd className="m-0 mt-1 font-sn-titulos text-sn-h4 font-normal text-sn-ink">
                {dashboardData?.estadisticas_personales?.total_pedidos || 0}
              </dd>
              <dd className="m-0 mt-1 font-sn-texto text-sn-cuerpo-xs text-sn-ink/70">
                {dashboardData?.estadisticas_personales?.productos_unicos || 0} productos únicos
              </dd>
            </div>
            <div data-testid={`${R}-cifras-invertido`}>
              <dt className="font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-terra">Invertido</dt>
              <dd className="m-0 mt-1 font-sn-titulos text-sn-h4 font-normal text-sn-ink">
                ${(dashboardData?.estadisticas_personales?.dinero_invertido || 0).toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </dd>
              <dd className="m-0 mt-1 font-sn-texto text-sn-cuerpo-xs text-sn-ink/70">En productos sustentables</dd>
            </div>
            <div data-testid={`${R}-cifras-suscripciones`}>
              <dt className="font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-terra">Suscripciones</dt>
              <dd className="m-0 mt-1 font-sn-titulos text-sn-h4 font-normal text-sn-ink">{dashboardData?.suscripciones?.activas || 0}</dd>
            </div>
          </dl>
        )}
      </Bloque>

      {/* 5 · Tu Impacto Ambiental */}
      <Bloque titulo="Tu Impacto Ambiental" testId={`${R}-impacto`}>
        {impacto.fase === 'cargando' ? (
          <Esqueleto testId={`${R}-impacto-cargando`} renglones={3} />
        ) : impacto.fase === 'error' ? (
          <Fallo base={`${R}-impacto`} texto={impacto.texto} />
        ) : (
          <>
            <dl className="m-0 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div data-testid={`${R}-impacto-co2`} className="flex flex-col-reverse gap-1">
                <dt className="font-sn-texto text-sn-cuerpo-sm text-sn-ink">CO₂ evitado</dt>
                <dd className="m-0 font-sn-titulos text-sn-h4 font-normal text-sn-ink">{(impactoData?.co2_ahorrado_kg || 0).toFixed(1)} kg</dd>
              </div>
              <div data-testid={`${R}-impacto-agua`} className="flex flex-col-reverse gap-1">
                <dt className="font-sn-texto text-sn-cuerpo-sm text-sn-ink">Agua conservada</dt>
                <dd className="m-0 font-sn-titulos text-sn-h4 font-normal text-sn-ink">
                  {(impactoData?.agua_conservada_litros || 0).toFixed(0)} L
                </dd>
              </div>
              <div data-testid={`${R}-impacto-plastico`} className="flex flex-col-reverse gap-1">
                <dt className="font-sn-texto text-sn-cuerpo-sm text-sn-ink">Plástico evitado</dt>
                <dd className="m-0 font-sn-titulos text-sn-h4 font-normal text-sn-ink">{(impactoData?.plastico_evitado_kg || 0).toFixed(2)} kg</dd>
              </div>
            </dl>
            {/* Hoy `impactoData?.categorias_compradas && (…)` (`:492`) pinta un «0» suelto con 0 categorías: no se copia (D-F3-07 c). */}
            {impactoData?.categorias_compradas ? (
              <Texto tamano="chico" peso="normal" testId={`${R}-impacto-categorias`} className="mt-5 border-0 border-t border-solid border-sn-border pt-4">
                Has explorado <span className="font-medium">{impactoData.categorias_compradas}</span> categorías de productos sustentables
              </Texto>
            ) : null}
          </>
        )}
      </Bloque>

      {/* 6 · Pedidos sin completar (solo si hay) */}
      {pendientes && pendientes.total > 0 && (
        <Bloque titulo={`Pedidos sin completar (${pendientes.total})`} testId={`${R}-pendientes`}>
          <Texto tamano="chico" peso="normal">
            Tienes pedidos que no fueron pagados.
          </Texto>
          <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
            {pendientes.recientes.map((pedido) => (
              <li
                key={pedido.id}
                data-testid={`${R}-pendientes-renglon`}
                data-pedido-id={pedido.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-solid border-sn-border p-3"
              >
                <span className="min-w-0">
                  <span className="block font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink [overflow-wrap:anywhere]">Pedido #{pedido.numero_pedido}</span>
                  <span className="block font-sn-texto text-sn-cuerpo-xs text-sn-ink/70">
                    {pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Sin fecha'}
                  </span>
                </span>
                <span className="font-sn-titulos text-sn-h6 font-normal text-sn-ink">${pedido.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-4">
            <Link href="/usuario/pedidos" data-testid={`${R}-pendientes-ver`} className={CLASE_LIGA}>
              {liga('/usuario/pedidos').texto}
            </Link>
          </p>
        </Bloque>
      )}

      {/* 7 · Pie: «Datos actualizados el …» + «Actualizar datos» */}
      <div className="flex flex-col items-center gap-2 text-center">
        {dashboardData && (
          <Texto tamano="chico" peso="normal" testId={`${R}-actualizado`}>
            Datos actualizados el {dashboardData?.timestamp_consulta ?
              new Date(dashboardData.timestamp_consulta).toLocaleString('es-MX') :
              'hace un momento'
            }
          </Texto>
        )}
        <Boton
          variante="texto"
          tamano="chico"
          onClick={() => void pedirPanel()}
          deshabilitado={resumen.fase === 'cargando' || impacto.fase === 'cargando'}
          testId={`${R}-actualizar`}
        >
          Actualizar datos
        </Boton>
      </div>
    </PestanaCuenta>
  )
}
