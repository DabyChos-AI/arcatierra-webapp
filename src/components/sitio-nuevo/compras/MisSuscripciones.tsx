'use client'

// R15 v2 · F6 (compras, sesión 64): la pestaña «Suscripciones» de Mi cuenta del sitio nuevo (`/usuario/suscripciones`; contrato v2 §8-F6, D-F6-04,
// D-F6-06, D-F6-08). La MISMA conducta que `src/app/usuario/suscripciones/page.tsx` de hoy: GET DIRECTO `${API_URL}/api/usuario/mis-suscripciones`
// con el Bearer (`:156-159`); los botones salen de `acciones` (solo «Cancelar», SUB6/DR-11; sin saltar ni cambiar tamaño, DR-9); SUB7 con
// `TEXTO_COBRO_FALLIDO`; cancelar con `confirmar({peligro})` y el candado ANTES del await (`:177-223`). Además:
// - DR-18 (D-F6-06): por cada suscripción activa, su próxima canasta de `GET /api/subscriptions/extras-disponibles` (la llamada de hoy del
//   checkout, `checkout/page.tsx:79`; C46) con `ProximaEntrega`; solo se pide si hay alguna activa (D-F6-08 P-13).
// - D-F6-08 P-2: el precio con el envío que cobra MercadoPago; P-3: estado fuera de la lista cerrada = sin pastilla; P-4: sin `tipo_canasta`;
//   P-7: el vacío lleva a «Canasta lista» de la tienda nueva.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api'
import { TEXTO_COBRO_FALLIDO, type MiSuscripcion } from '@/types/cuenta'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import { aviso, confirmar } from '@/components/ui/Avisos'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import {
  TEXTO_CONFIRMAR_CANCELAR,
  dinero,
  fechaCorta,
  fechaLarga,
  normalizarSuscripciones,
  textoFrecuencia,
} from '@/app/usuario/suscripciones/normalizar'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import ProximaEntrega, { type EstadoEntrega } from './ProximaEntrega'
import {
  HREF_SUSCRIBIRSE,
  entregaDe,
  envioDeSuscripcion,
  etiquetaEstadoSuscripcion,
  hrefIniciarSesion,
  leerEntregas,
  tonoEstadoSuscripcion,
} from './compras'

const B = 'sn-mis-suscripciones'
const ID_TITULO = `${B}-titulo`
const DESTINO = '/usuario/suscripciones'

// `usuario/suscripciones/page.tsx:35-37, :218`
const TEXTO_ERROR = 'No pudimos cargar tus suscripciones. Intenta de nuevo en un momento.'
const TEXTO_SESION = 'Tu sesión expiró. Vuelve a iniciar sesión.'
const TEXTO_CANCELADA = 'Suscripción cancelada'
const TEXTO_SIN_RED = 'No pudimos conectar con el servidor. Intenta de nuevo.'

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; items: MiSuscripcion[] }
  | { fase: 'error'; texto: string; sesion: boolean }

// Un párrafo con un dato en `data-*` (`ui/Texto` no los pasa, D-F2-15): las mismas clases que `Texto tamano="chico" peso="normal"`.
const P_CHICO = 'm-0 font-sn-texto text-sn-cuerpo-sm font-normal text-sn-ink'

type Entregas = { fase: 'cargando' } | { fase: 'listo'; entregas: CanastaExtras[] } | { fase: 'error'; detalle: string }

/** El precio por entrega con el envío que se cobra (D-F6-08 P-2): «{precio} + {envío} de envío por entrega» o «{precio} por entrega · Envío
 *  gratis». «por entrega» es el texto de hoy (`:71`); «+ … de envío» y «Envío gratis», los de la portada y la tienda nueva (D-F2-09 P-4;
 *  `portada/arriba/PrecioCanastaLista.tsx:69-70`, `tienda/CanastaLista.tsx:224-225`, `tienda/AltaSuscripcion.tsx:375`). */
function textoPrecio(precio: number, envio: number): string {
  return envio > 0 ? `${dinero(precio)} + ${dinero(envio)} de envío por entrega` : `${dinero(precio)} por entrega · Envío gratis`
}

function RenglonSuscripcion({
  s,
  primero,
  entrega,
  cancelando,
  error,
  onCancelar,
  onReintentarEntrega,
}: {
  s: MiSuscripcion
  primero: boolean
  entrega: EstadoEntrega | null
  cancelando: boolean
  error: string | null
  onCancelar: (s: MiSuscripcion) => void
  onReintentarEntrega: () => void
}) {
  const etiqueta = etiquetaEstadoSuscripcion(s.estado)
  const frecuencia = textoFrecuencia(s.frecuencia)
  const proxima = fechaLarga(s.proxima_entrega)
  const canasta = entrega && entrega.fase === 'listo' ? entrega.entrega : null
  const envio = s.precio !== null ? envioDeSuscripcion(s.precio, canasta) : null
  return (
    <li
      data-testid={`${B}-suscripcion`}
      data-id={s.id}
      data-estado={s.estado}
      className={`flex flex-col gap-3 py-4 ${primero ? '' : 'border-t border-solid border-sn-border'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* `:59` */}
        <Titulo nivel={3} tamano="h6" testId={`${B}-suscripcion-nombre`} className="min-w-0 break-words">
          {s.nombre}
        </Titulo>
        {etiqueta && (
          <Insignia tono={tonoEstadoSuscripcion(s.estado)} forma="pildora" testId={`${B}-suscripcion-estado`}>
            {etiqueta}
          </Insignia>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {s.precio !== null && envio !== null && (
          <p data-testid={`${B}-suscripcion-precio`} data-precio={s.precio} data-envio={envio} className={P_CHICO}>
            {textoPrecio(s.precio, envio)}
          </p>
        )}
        {/* `:75-80` */}
        {(frecuencia || s.dia_entrega) && (
          <Etiqueta tono="ink" testId={`${B}-suscripcion-frecuencia`}>
            {[frecuencia, s.dia_entrega ? `entrega los ${s.dia_entrega.toLowerCase()}` : null].filter(Boolean).join(', ')}
          </Etiqueta>
        )}
        {/* `:81-88` */}
        {proxima && (
          <p data-testid={`${B}-suscripcion-proxima`} data-fecha={s.proxima_entrega ?? undefined} className={P_CHICO}>
            Próxima canasta: <span className="font-medium">{proxima}</span>
          </p>
        )}
        {/* `:89-98` */}
        {(s.fecha_inicio || s.fecha_fin) && (
          <Texto tamano="mini" peso="normal" testId={`${B}-suscripcion-vigencia`}>
            {[s.fecha_inicio ? `Desde el ${fechaCorta(s.fecha_inicio)}` : null, s.fecha_fin ? `terminó el ${fechaCorta(s.fecha_fin)}` : null]
              .filter(Boolean)
              .join(', ')}
          </Texto>
        )}
      </div>
      {/* SUB7 (`:100-108`) */}
      {s.cobro_fallido_desde && (
        <AvisoEnLinea tono="atencion" testId={`${B}-suscripcion-cobro-fallido`}>
          {TEXTO_COBRO_FALLIDO}
        </AvisoEnLinea>
      )}
      {/* DR-18 */}
      {entrega && <ProximaEntrega suscripcionId={s.id} estado={entrega} onReintentar={onReintentarEntrega} testId={`${B}-entrega`} />}
      {/* `:110-113` */}
      {error && (
        <AvisoEnLinea tono="error" testId={`${B}-suscripcion-error`}>
          {error}
        </AvisoEnLinea>
      )}
      {/* `:115-125` */}
      {s.acciones.includes('cancelar') && (
        <div>
          <Boton
            variante="contorno"
            tamano="chico"
            onClick={() => onCancelar(s)}
            cargando={cancelando}
            textoCargando="Cancelando…"
            testId={`${B}-suscripcion-cancelar`}
          >
            Cancelar suscripción
          </Boton>
        </div>
      )}
    </li>
  )
}

export default function MisSuscripciones() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const token = session?.accessToken
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const [entregas, setEntregas] = useState<Entregas>({ fase: 'cargando' })
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const pedidoRef = useRef(0)
  const pedidoEntregasRef = useRef(0)
  const enCursoRef = useRef<Set<string>>(new Set())

  // `:140-144`
  useEffect(() => {
    if (status === 'unauthenticated') router.push(hrefIniciarSesion(DESTINO))
  }, [status, router])

  /** DR-18: la próxima canasta de cada suscripción activa. `silencioso`: sin volver a «Cargando...» (tras cancelar). */
  const cargarEntregas = useCallback(
    async (silencioso = false) => {
      const pedido = ++pedidoEntregasRef.current
      if (!silencioso) setEntregas({ fase: 'cargando' })
      if (!token) return
      try {
        const res = await fetch(`${API_URL}/api/subscriptions/extras-disponibles`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        const cuerpo: unknown = await res.json().catch(() => null)
        if (pedido !== pedidoEntregasRef.current) return
        if (!res.ok) {
          const detalle = (cuerpo as { detail?: unknown } | null)?.detail
          return setEntregas({ fase: 'error', detalle: typeof detalle === 'string' ? detalle : '' })
        }
        const lista = leerEntregas(cuerpo)
        setEntregas(lista ? { fase: 'listo', entregas: lista } : { fase: 'error', detalle: '' })
      } catch {
        if (pedido === pedidoEntregasRef.current) setEntregas({ fase: 'error', detalle: '' })
      }
    },
    [token],
  )

  /** `:147-171`. `silencioso`: relee sin el «Cargando» (tras cancelar, la lista no parpadea). */
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
        if (!datos) return setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
        setEstado({ fase: 'listo', items: datos.items })
        // D-F6-08 P-13: `extras-disponibles` solo si hay alguna activa.
        if (datos.items.some((s) => s.estado === 'activa')) void cargarEntregas(silencioso)
      } catch {
        if (pedido === pedidoRef.current) setEstado({ fase: 'error', texto: TEXTO_ERROR, sesion: false })
      }
    },
    [token, cargarEntregas],
  )

  useEffect(() => {
    if (status === 'authenticated') void cargar()
  }, [status, cargar])

  // `:177-223`
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
      setErrores((e) => ({ ...e, [s.id]: TEXTO_SIN_RED }))
    } finally {
      enCursoRef.current.delete(s.id)
      setCancelando((actual) => (actual === s.id ? null : actual))
    }
  }

  /** El estado de DR-18 de una suscripción, o null si no lleva bloque (no activa, o activa sin canasta programada). */
  const estadoEntrega = (s: MiSuscripcion): EstadoEntrega | null => {
    if (s.estado !== 'activa') return null
    if (entregas.fase === 'cargando') return { fase: 'cargando' }
    if (entregas.fase === 'error') return { fase: 'error', detalle: entregas.detalle }
    const canasta = entregaDe(s, entregas.entregas)
    return canasta ? { fase: 'listo', entrega: canasta } : null
  }

  const cargando = status !== 'authenticated' || estado.fase === 'cargando'

  return (
    <section aria-labelledby={ID_TITULO} data-testid={B} className="w-full">
      <Tarjeta as="div" relleno="normal">
        <div className="flex flex-col gap-5">
          {/* El `h1` de hoy (`:229`, `:242`); en el sitio nuevo el `h1` es del marco de cuenta. */}
          <Titulo nivel={2} tamano="h4" id={ID_TITULO} testId={ID_TITULO}>
            Mis suscripciones
          </Titulo>

          {cargando && (
            <p data-testid={`${B}-cargando`} role="status" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
              Cargando tus suscripciones...
            </p>
          )}

          {/* `:244-266` */}
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
            <ul data-testid={`${B}-lista`} className="m-0 list-none p-0">
              {estado.items.map((s, i) => (
                <RenglonSuscripcion
                  key={s.id}
                  s={s}
                  primero={i === 0}
                  entrega={estadoEntrega(s)}
                  cancelando={cancelando === s.id}
                  error={errores[s.id] ?? null}
                  onCancelar={(x) => void cancelar(x)}
                  onReintentarEntrega={() => void cargarEntregas()}
                />
              ))}
            </ul>
          )}

          {/* `:282-296`; D-F6-08 P-7: el alta del sitio nuevo vive en «Canasta lista». */}
          {!cargando && estado.fase === 'listo' && estado.items.length === 0 && (
            <div data-testid={`${B}-vacio`} className="flex flex-col items-start gap-3">
              <Titulo nivel={3} tamano="h5">
                No tienes suscripciones
              </Titulo>
              <Texto tamano="chico" peso="normal">
                Con una suscripción recibes tu canasta de temporada sin tener que pedirla cada vez.
              </Texto>
              <Boton href={HREF_SUSCRIBIRSE} testId={`${B}-vacio-ver`}>
                Ver suscripciones
              </Boton>
            </div>
          )}
        </div>
      </Tarjeta>
    </section>
  )
}
