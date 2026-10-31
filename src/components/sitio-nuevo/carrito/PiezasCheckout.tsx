'use client'

// R15 · F3 v2 (carrito, sesión 61): piezas del checkout nuevo que solo pintan (el estado vive en `PaginaCheckout.tsx`). Cada texto es el de
// hoy, con su archivo y línea; el envío sale de lib/envio.ts y la bodega de lib/bodega.ts (nunca un número escrito, D-F3-12).

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ShoppingCart } from 'lucide-react'
import Falta from '@/components/sitio-nuevo/Falta'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import GrupoOpciones from '@/components/sitio-nuevo/ui/GrupoOpciones'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import { BODEGA } from '@/lib/bodega'
import { COSTO_ENVIO, UMBRAL_ENVIO_GRATIS, subtotalProductos as subtotalDeProductos, type TipoEntrega } from '@/lib/envio'
import { formatFechaMexico } from '@/lib/dates'
import type { ItemCarrito } from '@/lib/carrito'
import { esItemExperiencia, relojApartado, textoPersonas } from '@/types/compra-experiencias'
import { co2Ahorrado, dinero, imagenDe, subtotalRenglon } from './reglas'

// ─── Una tarjeta del formulario (`.form-card` de la maqueta: blanca, borde, radio 18) ─────────────────────────────────────
export function Bloque({
  titulo,
  idTitulo,
  testId,
  children,
}: {
  titulo?: string
  idTitulo?: string
  testId?: string
  children: React.ReactNode
}) {
  return (
    <section
      data-testid={testId}
      aria-labelledby={titulo ? idTitulo : undefined}
      className="flex flex-col gap-4 rounded-sn-panel border border-solid border-sn-border bg-white p-5 min-[861px]:p-7"
    >
      {titulo && (
        <Titulo nivel={2} tamano="h5" id={idTitulo}>
          {titulo}
        </Titulo>
      )}
      {children}
    </section>
  )
}

// ─── Extras con la canasta de la suscripción (`ui/ConMiCanasta.tsx:33-89`; SU2) ─────────────────────────────────────────
const FECHA_LARGA: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: undefined }
const SIN_CANASTA = 'sin-canasta'

export function BloqueCanasta({
  canastas,
  seleccion,
  onCambio,
}: {
  canastas: CanastaExtras[]
  seleccion: CanastaExtras | null
  onCambio: (canasta: CanastaExtras | null) => void
}) {
  const abiertas = canastas.filter((c) => c.abierta)
  const cerradas = canastas.filter((c) => !c.abierta)
  if (abiertas.length === 0 && cerradas.length === 0) return null
  return (
    <Bloque titulo="Tienes una suscripción" idTitulo="sn-checkout-canasta-titulo">
      {/* D-F3-30 (2) y D-F3-32: `ui/GrupoOpciones` tal cual, fieldset `sn-checkout-canasta` con `sn-opcion-<entrega_id>`. Hoy la canasta se
          suelta (`ConMiCanasta.tsx:51`, empieza en null): un radio no, así que va una opción más, «Comprar con envío normal»
          (`sn-opcion-sin-canasta`, de `ConMiCanasta.tsx:84`), marcada al empezar; elegirla vuelve a mostrar el tipo de entrega. */}
      {abiertas.length > 0 && (
        <GrupoOpciones
          leyenda="Tienes una suscripción"
          leyendaOculta
          nombre="sn-checkout-canasta"
          testId="sn-checkout-canasta"
          valor={seleccion ? seleccion.entrega_id : SIN_CANASTA}
          onCambio={(v) => onCambio(abiertas.find((c) => c.entrega_id === v) ?? null)}
          opciones={[
            ...abiertas.map((c) => ({
              valor: c.entrega_id,
              etiqueta: `Entregar con mi canasta del ${formatFechaMexico(c.fecha_entrega, FECHA_LARGA)}`,
              detalle: `Envío gratis · se paga hoy · puedes agregar hasta el ${formatFechaMexico(c.ultimo_dia_para_pagar, FECHA_LARGA)}`,
            })),
            { valor: SIN_CANASTA, etiqueta: 'Comprar con envío normal' },
          ]}
        />
      )}
      {abiertas.length === 0 &&
        cerradas.map((c) => (
          <p key={c.entrega_id} data-testid="sn-checkout-canasta-cerrada" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
            Ya cerró el plazo para agregar a tu canasta del {formatFechaMexico(c.fecha_entrega, FECHA_LARGA)}: se paga a más tardar 2 días
            hábiles antes. Puedes comprar con envío normal.
          </p>
        ))}
      {/* D-F3-07 a (pregunta C51): el −$100 de DR-18 no existe todavía: el pedido de extras va con envío gratis, como hoy. */}
      {abiertas.length > 0 && (
        <p className="m-0 font-sn-texto text-sn-cuerpo-sm">
          <Falta que="descuento del envío de la canasta al llegar a $1,000 con extras" quien="David" />
        </p>
      )}
    </Bloque>
  )
}

// ─── Tipo de entrega (`ui/DeliveryTypeSelector.tsx:17-157`) ─────────────────────────────────────────────────────────────
export function BloqueEntrega({
  valor,
  onCambio,
  subtotal,
}: {
  valor: TipoEntrega
  onCambio: (tipo: TipoEntrega) => void
  /** Solo productos (`DeliveryTypeSelector.tsx:11`). */
  subtotal: number
}) {
  // Como hoy (`DeliveryTypeSelector.tsx:27-29`), con el umbral y el costo de lib/envio.ts.
  const envioGratis = subtotal >= UMBRAL_ENVIO_GRATIS
  const falta = UMBRAL_ENVIO_GRATIS - subtotal
  const domicilio = valor === 'envio_domicilio'
  const recoger = valor === 'recoger_almacen'
  // D-F3-30 (2): `ui/GrupoOpciones` tal cual (fieldset `sn-checkout-entrega`, `sn-opcion-domicilio` / `sn-opcion-recoger`, `data-elegida`).
  // La opción elegida va terra con texto blanco: dentro de la etiqueta y el detalle el color se hereda (nada de verde ni de tinta propios).
  return (
    <Bloque titulo="¿Cómo deseas recibir tu pedido?" idTitulo="sn-checkout-entrega-titulo">
      <GrupoOpciones
        leyenda="¿Cómo deseas recibir tu pedido?"
        leyendaOculta
        nombre="sn-checkout-tipo-entrega"
        testId="sn-checkout-entrega"
        valor={domicilio ? 'domicilio' : recoger ? 'recoger' : undefined}
        onCambio={(v) => onCambio(v === 'recoger' ? 'recoger_almacen' : 'envio_domicilio')}
        opciones={[
          {
            valor: 'domicilio',
            etiqueta: (
              <span className="flex items-center justify-between gap-3">
                <span>Envío a domicilio</span>
                {domicilio && <span>{envioGratis ? 'Gratis' : `+$${COSTO_ENVIO}`}</span>}
              </span>
            ),
            detalle: domicilio ? (
              envioGratis ? (
                <span className="font-medium">¡Envío GRATIS!</span>
              ) : (
                <>
                  Envío: ${COSTO_ENVIO}
                  {falta > 0 && <span className="ml-2">(Agrega ${falta.toFixed(0)} más para envío gratis)</span>}
                </>
              )
            ) : undefined,
          },
          {
            valor: 'recoger',
            etiqueta: (
              <span className="flex flex-wrap items-center gap-2">
                <span>Recoger en almacén</span>
                <span className="rounded-sn-pildora border border-solid border-current px-2 py-0.5 text-sn-cuerpo-xs font-normal">Sin costo</span>
              </span>
            ),
          },
        ]}
      />
      {/* La bodega va fuera del fieldset: un enlace dentro de la etiqueta terra quedaría tinta sobre terra (`DeliveryTypeSelector.tsx:136-151`). */}
      {recoger && (
        <div className="flex flex-col gap-1 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
          <p data-testid="sn-checkout-entrega-bodega" className="m-0">
            {BODEGA.completa} ·{' '}
            <a
              href={BODEGA.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="sn-checkout-entrega-como-llegar"
              className={unirClases('font-medium text-sn-ink underline hover:text-sn-terra', FOCO)}
            >
              Cómo llegar
            </a>
          </p>
          <p className="m-0">{BODEGA.horario}</p>
        </div>
      )}
    </Bloque>
  )
}

// ─── Reloj del apartado (el de `checkout/RelojApartado.tsx:115-161`, con el diseño nuevo) ────────────────────────────────
function segundosQueQuedan(venceLocalMs: number): number {
  return Math.max(0, Math.ceil((venceLocalMs - Date.now()) / 1000))
}

export function Reloj({ venceLocalMs, onVencido, texto }: { venceLocalMs: number; onVencido: () => void; texto: string }) {
  const [segundos, setSegundos] = useState(() => segundosQueQuedan(venceLocalMs))
  const aviso = useRef(onVencido)
  useEffect(() => {
    aviso.current = onVencido
  }, [onVencido])
  useEffect(() => {
    let avisado = false
    const tic = () => {
      const s = segundosQueQuedan(venceLocalMs)
      setSegundos(s)
      if (s <= 0 && !avisado) {
        avisado = true
        aviso.current()
      }
    }
    tic()
    const id = window.setInterval(tic, 1000)
    return () => window.clearInterval(id)
  }, [venceLocalMs])
  const [antes, despues] = texto.split('{reloj}')
  return (
    <AvisoEnLinea tono="atencion" testId="sn-checkout-acciones-reloj" className="font-normal">
      <span role="timer" aria-live="polite">
        {antes}
        <strong className="font-medium tabular-nums">{relojApartado(segundos)}</strong>
        {despues}
      </span>
    </AvisoEnLinea>
  )
}

// ─── «Tu pedido» (`checkout/page.tsx:228-362`) ─────────────────────────────────────────────────────────────────────────
export function TuPedido({
  items,
  envio,
  hayProductos,
  canasta,
  recoger,
  descuento,
}: {
  items: ItemCarrito[]
  envio: number
  hayProductos: boolean
  canasta: boolean
  recoger: boolean
  descuento: { codigo: string; descuento: number } | null
}) {
  // `checkout/page.tsx:176-177`: los productos con la fórmula de lib/envio.ts y las experiencias con la suya.
  const subtotalProductos = subtotalDeProductos(items)
  const subtotalExperiencias = items.filter(esItemExperiencia).reduce((s, i) => s + subtotalRenglon(i), 0)
  const textoEnvio = !hayProductos
    ? 'Sin envío'
    : canasta
      ? 'Gratis (va con tu canasta)'
      : recoger
        ? 'Gratis (recoger)'
        : envio === 0
          ? 'Gratis'
          : dinero(envio)
  const renglon = 'flex justify-between gap-3 font-sn-texto text-sn-cuerpo-sm text-sn-ink'

  let nota: { tipo: string; texto: string } | null = null
  if (canasta) nota = { tipo: 'canasta', texto: 'Llega con tu canasta de suscripción, sin costo de envío' }
  else if (recoger && hayProductos) nota = { tipo: 'recoger', texto: `Recoger en: ${BODEGA.corta} · ${BODEGA.horario}` }
  else if (subtotalProductos > 0 && subtotalProductos < UMBRAL_ENVIO_GRATIS) {
    nota = { tipo: 'falta', texto: `Te faltan ${dinero(UMBRAL_ENVIO_GRATIS - subtotalProductos)} en productos para envío GRATIS` }
  } else if (subtotalProductos >= UMBRAL_ENVIO_GRATIS) nota = { tipo: 'gratis', texto: '¡Felicidades! Tu envío es GRATIS' }
  else if (subtotalProductos === 0 && subtotalExperiencias > 0) nota = { tipo: 'experiencias', texto: 'Las experiencias no tienen costo de envío' }

  return (
    <aside
      data-testid="sn-checkout-pedido"
      aria-labelledby="sn-checkout-pedido-titulo"
      className="flex flex-col gap-4 rounded-sn-tarjeta border border-solid border-sn-border bg-white p-7 min-[861px]:sticky min-[861px]:top-[88px] min-[861px]:self-start"
    >
      <h2 id="sn-checkout-pedido-titulo" className="m-0 font-sn-mono text-sn-eyebrow font-medium uppercase text-sn-terra">
        Tu pedido
      </h2>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((item) => {
          const imagen = imagenDe(item)
          const nombre = String(item.name ?? '')
          return (
            <li
              key={item.id}
              data-testid="sn-checkout-pedido-renglon"
              data-tipo={esItemExperiencia(item) ? 'experiencia' : 'producto'}
              data-id={item.id}
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-sn-cream">
                {imagen ? (
                  <Foto src={imagen} alt={nombre} proporcion="1/1" sizes="48px" />
                ) : esItemExperiencia(item) ? (
                  <CalendarDays aria-hidden="true" className="h-5 w-5 text-sn-ink/70" />
                ) : (
                  <ShoppingCart aria-hidden="true" className="h-5 w-5 text-sn-ink/70" />
                )}
              </div>
              <div className="min-w-0 flex-1 font-sn-texto">
                <p className="m-0 break-words text-sn-cuerpo-sm font-medium text-sn-ink">{nombre}</p>
                <p className="m-0 text-sn-cuerpo-xs text-sn-ink/70">
                  {esItemExperiencia(item)
                    ? `${formatFechaMexico(item.fecha, { day: 'numeric', month: 'short', year: undefined })} · ${item.hora} · ${textoPersonas(item.adultos, item.ninos)}`
                    : `${item.quantity} x $${String(item.price ?? '')}`}
                </p>
              </div>
              <span className="font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink">{dinero(subtotalRenglon(item))}</span>
            </li>
          )
        })}
      </ul>
      <div className="flex flex-col gap-2 border-0 border-t border-solid border-sn-border pt-4">
        <div data-testid="sn-checkout-pedido-subtotal" className={renglon}>
          <span>Subtotal</span>
          <span>{dinero(subtotalProductos + subtotalExperiencias)}</span>
        </div>
        <div data-testid="sn-checkout-pedido-envio" className={renglon}>
          <span>Envío</span>
          <span>{textoEnvio}</span>
        </div>
        {nota && (
          <AvisoEnLinea tono={nota.tipo === 'falta' ? 'atencion' : 'exito'} testId="sn-checkout-pedido-nota" className="font-normal">
            <span data-tipo={nota.tipo}>{nota.texto}</span>
          </AvisoEnLinea>
        )}
        {descuento && (
          <div data-testid="sn-checkout-pedido-descuento" className={renglon}>
            <span>Descuento ({descuento.codigo})</span>
            <span>−{dinero(descuento.descuento)}</span>
          </div>
        )}
        <div
          data-testid="sn-checkout-pedido-total"
          className="flex justify-between gap-3 border-0 border-t border-solid border-sn-border pt-3 font-sn-titulos text-[26px] font-normal leading-[1.55] text-sn-ink"
        >
          <span>Total</span>
          <span>{dinero(subtotalProductos + subtotalExperiencias + envio - (descuento?.descuento ?? 0))}</span>
        </div>
      </div>
      {hayProductos && (
        <p data-testid="sn-checkout-pedido-co2" className="m-0 rounded-sn-campo bg-sn-warm p-3 font-sn-texto text-sn-cuerpo-xs text-sn-ink">
          Con tu compra ahorras aproximadamente{' '}
          <span className="font-medium">{items.reduce((s, i) => s + co2Ahorrado(i), 0).toFixed(1)} kg de CO₂</span>
        </p>
      )}
    </aside>
  )
}
