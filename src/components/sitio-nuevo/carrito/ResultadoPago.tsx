'use client'

// R15 · F3 v2 (carrito, sesión 61): el resultado del pago del sitio nuevo (`/checkout/success|pending|failure`, D-F3-04). Las mismas lecturas de
// hoy (`src/app/checkout/{success,pending,failure}/page.tsx`): los parámetros que MercadoPago pone en la dirección de regreso, el carrito y el
// apartado. Textos de hoy salvo «Tiempo estimado de entrega: 24-48 horas» (`success/page.tsx:141`, D-7: contradice el día que eligió el cliente).
// En el link de revisión solo se llega entrando directo: las direcciones de regreso de MercadoPago son las de producción (D-F3-04).

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { apartadoVigente, contenidoDelCarrito, horaVenceApartado } from '@/components/checkout/RelojApartado'
import { experienciasDelCarrito, leerCarrito, vaciarCarrito } from '@/lib/carrito'
import { formatFechaMexico } from '@/lib/dates'
import { linkWhatsApp } from '@/lib/whatsapp'
import { CORREO_EXPERIENCIAS, CORREO_GENERAL } from '@/lib/contacto'
import { textoApartadoHasta } from '@/types/tienda'
import Encabezado from './Encabezado'
import { motivoDelPago, tiempoDeConfirmacion } from './reglas'

export type TipoResultado = 'exito' | 'pendiente' | 'fallo'

const LIGA = unirClases('font-medium text-sn-ink underline hover:text-sn-terra', FOCO)
const RENGLON = 'm-0 flex flex-col gap-0.5'
const ETIQUETA = 'font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink'
const VALOR = 'break-all font-sn-texto text-sn-cuerpo-sm text-sn-ink'

function Tarjeta({ titulo, idTitulo, testId, children }: { titulo: string; idTitulo: string; testId?: string; children: React.ReactNode }) {
  return (
    <section
      data-testid={testId}
      aria-labelledby={idTitulo}
      className="flex flex-col gap-3 rounded-sn-panel border border-solid border-sn-border bg-white p-5 min-[861px]:p-7"
    >
      <Titulo nivel={2} tamano="h5" id={idTitulo}>
        {titulo}
      </Titulo>
      {children}
    </section>
  )
}

function Lista({ renglones }: { renglones: string[] }) {
  return (
    <ul className="m-0 list-disc pl-5 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
      {renglones.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  )
}

/** El aviso del apartado vigente (`pending/page.tsx:44-50`, `failure/page.tsx:29-35`). */
function useAvisoApartado(): string | null {
  const [aviso, setAviso] = useState<string | null>(null)
  useEffect(() => {
    const items = leerCarrito()
    const apartado = apartadoVigente(items)
    setAviso(apartado ? `${textoApartadoHasta(contenidoDelCarrito(items), horaVenceApartado(apartado))}: vuelve a intentar` : null)
  }, [])
  return aviso
}

function Contacto({ texto, mensajeWhatsApp, testIdWhatsApp }: { texto: string; mensajeWhatsApp: string; testIdWhatsApp: string }) {
  return (
    <div className="flex flex-col gap-1 text-center font-sn-texto text-sn-cuerpo-sm text-sn-ink">
      <p className="m-0">{texto}</p>
      <p className="m-0">
        Email:{' '}
        <a href={`mailto:${CORREO_GENERAL}`} className={LIGA}>
          {CORREO_GENERAL}
        </a>
      </p>
      <p className="m-0">
        WhatsApp:{' '}
        <a href={linkWhatsApp(mensajeWhatsApp)} target="_blank" rel="noopener noreferrer" data-testid={testIdWhatsApp} className={LIGA}>
          Escríbenos por WhatsApp
        </a>
      </p>
    </div>
  )
}

function Botones({ reintentar }: { reintentar?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {reintentar && (
        <Boton href="/checkout" anchoCompleto testId="sn-checkout-fallo-reintentar">
          Intentar Pago Nuevamente
        </Boton>
      )}
      <Boton href="/tienda" anchoCompleto variante={reintentar ? 'contorno' : 'primario'}>
        Continuar Comprando
      </Boton>
      <Boton href="/" anchoCompleto variante={reintentar ? 'texto' : 'contorno'}>
        Volver al Inicio
      </Boton>
    </div>
  )
}

// ─── Éxito (`success/page.tsx:23-196`) ─────────────────────────────────────────────────────────────────────────────────────
function Exito() {
  const parametros = useSearchParams()
  const [listo, setListo] = useState(false)
  const [conExperiencias, setConExperiencias] = useState(false)
  const [conProductos, setConProductos] = useState(false)
  const [fecha, setFecha] = useState('')

  useEffect(() => {
    // Lo que traía el carrito ANTES de vaciarlo (y olvidar el apartado: ya se pagó).
    const items = leerCarrito()
    const experiencias = experienciasDelCarrito(items).length
    setConExperiencias((prev) => prev || experiencias > 0)
    setConProductos((prev) => prev || items.length > experiencias)
    vaciarCarrito()
    setFecha(formatFechaMexico(new Date()))
    setListo(true)
  }, [parametros])

  if (!listo) {
    return (
      <p data-testid="sn-checkout-cargando" role="status" className="m-0 py-24 text-center font-sn-texto text-sn-cuerpo text-sn-ink">
        Procesando información del pago...
      </p>
    )
  }

  const pago = parametros.get('payment_id')
  const estado = parametros.get('status')
  const orden = parametros.get('merchant_order_id')
  const deExperiencias = (parametros.get('external_reference') ?? '').startsWith('AT-EXP-')
  const correo = conExperiencias || deExperiencias ? CORREO_EXPERIENCIAS : CORREO_GENERAL

  return (
    <>
      <Encabezado titulo="¡Pago Exitoso!" texto="Tu orden ha sido confirmada y está siendo procesada" />
      <Contenedor ancho="angosto" className="flex max-w-[760px] flex-col gap-6 py-8 min-[861px]:py-12">
        <Tarjeta titulo="Detalles del Pago" idTitulo="sn-checkout-exito-detalles-titulo" testId="sn-checkout-exito-detalles">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pago && (
              <p className={RENGLON}>
                <span className={ETIQUETA}>ID de Pago:</span>
                <span className={VALOR}>{pago}</span>
              </p>
            )}
            {estado && (
              <p className={RENGLON}>
                <span className={ETIQUETA}>Estado:</span>
                <span className={VALOR}>{estado === 'approved' ? 'Aprobado' : estado}</span>
              </p>
            )}
            {orden && (
              <p className={RENGLON}>
                <span className={ETIQUETA}>Orden:</span>
                <span className={VALOR}>{orden}</span>
              </p>
            )}
            <p className={RENGLON}>
              <span className={ETIQUETA}>Fecha:</span>
              <span className={VALOR}>{fecha}</span>
            </p>
          </div>
        </Tarjeta>
        <Tarjeta titulo="¿Qué sigue?" idTitulo="sn-checkout-exito-que-sigue-titulo" testId="sn-checkout-exito-que-sigue">
          <Lista
            renglones={[
              ...(conExperiencias ? ['Te mandamos un correo con la fecha, la hora y el punto de encuentro'] : []),
              ...(conProductos || !conExperiencias
                ? [
                    'Recibirás un email de confirmación en unos minutos',
                    'Tu pedido será preparado y empacado con cuidado',
                    'Te contactaremos para coordinar la entrega',
                  ]
                : []),
            ]}
          />
        </Tarjeta>
        <AvisoEnLinea tono="exito" as="div" className="font-normal">
          <p className="m-0 font-medium">¡Gracias por elegir productos locales!</p>
          <p className="m-0">Con tu compra contribuyes al desarrollo de productores locales y reduces la huella de carbono de tus alimentos.</p>
        </AvisoEnLinea>
        <Botones />
        <p className="m-0 text-center font-sn-texto text-sn-cuerpo-sm text-sn-ink">
          Si tienes alguna pregunta sobre tu pedido, puedes contactarnos en{' '}
          <a href={`mailto:${correo}`} data-testid="sn-checkout-exito-contacto" className={LIGA}>
            {correo}
          </a>
        </p>
      </Contenedor>
    </>
  )
}

// ─── Pendiente (`pending/page.tsx:37-203`) ─────────────────────────────────────────────────────────────────────────────────
function Pendiente() {
  const parametros = useSearchParams()
  const aviso = useAvisoApartado()
  const [fecha, setFecha] = useState<string | null>(null)
  useEffect(() => setFecha(formatFechaMexico(new Date())), [parametros])
  const pago = parametros.get('payment_id')
  const estado = parametros.get('status')
  const orden = parametros.get('merchant_order_id')

  return (
    <>
      <Encabezado titulo="Pago Pendiente" texto="Tu pago está siendo procesado" />
      <Contenedor ancho="angosto" className="flex max-w-[760px] flex-col gap-6 py-8 min-[861px]:py-12">
        {fecha !== null && (
          <Tarjeta titulo="Detalles del Pago" idTitulo="sn-checkout-pendiente-detalles-titulo" testId="sn-checkout-pendiente-detalles">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pago && (
                <p className={RENGLON}>
                  <span className={ETIQUETA}>ID de Pago:</span>
                  <span className={VALOR}>{pago}</span>
                </p>
              )}
              {estado && (
                <p className={RENGLON}>
                  <span className={ETIQUETA}>Estado:</span>
                  <span className={VALOR}>{estado === 'pending' ? 'Pendiente' : estado}</span>
                </p>
              )}
              {orden && (
                <p className={RENGLON}>
                  <span className={ETIQUETA}>Orden:</span>
                  <span className={VALOR}>{orden}</span>
                </p>
              )}
              <p className={RENGLON}>
                <span className={ETIQUETA}>Fecha:</span>
                <span className={VALOR}>{fecha}</span>
              </p>
            </div>
          </Tarjeta>
        )}
        {aviso && (
          <AvisoEnLinea tono="atencion" as="div" testId="sn-checkout-pendiente-apartado">
            <span className="block">{aviso}</span>
            <a href="/checkout" className={unirClases(LIGA, 'mt-1 inline-block')}>
              Volver a pagar
            </a>
          </AvisoEnLinea>
        )}
        <Tarjeta titulo="¿Qué significa esto?" idTitulo="sn-checkout-pendiente-significa-titulo">
          <Lista
            renglones={[
              'Tu pago está siendo verificado por el banco',
              'Recibirás una notificación cuando se confirme',
              'El proceso puede tomar hasta 48 horas',
              'Te contactaremos por email con actualizaciones',
            ]}
          />
        </Tarjeta>
        <Tarjeta titulo="¿Cuánto tarda?" idTitulo="sn-checkout-pendiente-tiempo-titulo">
          <p data-testid="sn-checkout-pendiente-tiempo" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
            {tiempoDeConfirmacion(parametros.get('payment_type'))}
          </p>
        </Tarjeta>
        <Botones />
        <Contacto
          texto="Si tienes preguntas sobre tu pago, contáctanos:"
          mensajeWhatsApp="Hola, tengo una pregunta sobre mi pago pendiente en la página de Arca Tierra"
          testIdWhatsApp="sn-checkout-pendiente-whatsapp"
        />
      </Contenedor>
    </>
  )
}

// ─── Fallo (`failure/page.tsx:22-225`) ─────────────────────────────────────────────────────────────────────────────────────
function Fallo() {
  const parametros = useSearchParams()
  const aviso = useAvisoApartado()
  const [fecha, setFecha] = useState<string | null>(null)
  useEffect(() => setFecha(formatFechaMexico(new Date())), [parametros])
  const pago = parametros.get('payment_id')
  const estado = parametros.get('status')
  const detalle = parametros.get('status_detail')

  return (
    <>
      <Encabezado titulo="Pago No Procesado" texto="Hubo un problema al procesar tu pago" />
      <Contenedor ancho="angosto" className="flex max-w-[760px] flex-col gap-6 py-8 min-[861px]:py-12">
        {fecha !== null && (
          <Tarjeta titulo="Detalles del Error" idTitulo="sn-checkout-fallo-detalles-titulo">
            {estado && detalle && (
              <p className={RENGLON}>
                <span className={ETIQUETA}>Motivo:</span>
                <span data-testid="sn-checkout-fallo-motivo" className={VALOR}>
                  {motivoDelPago(estado, detalle)}
                </span>
              </p>
            )}
            {pago && (
              <p className={RENGLON}>
                <span className={ETIQUETA}>ID de Transacción:</span>
                <span className={VALOR}>{pago}</span>
              </p>
            )}
            <p className={RENGLON}>
              <span className={ETIQUETA}>Fecha del Intento:</span>
              <span className={VALOR}>{fecha}</span>
            </p>
          </Tarjeta>
        )}
        <Tarjeta titulo="¿Qué puedes hacer?" idTitulo="sn-checkout-fallo-hacer-titulo">
          <Lista
            renglones={[
              'Verifica que los datos de tu tarjeta sean correctos',
              'Asegúrate de tener fondos suficientes',
              'Intenta con otra tarjeta o con saldo de MercadoPago',
              'Contacta a tu banco si el problema persiste',
              'Puedes intentar el pago nuevamente',
            ]}
          />
        </Tarjeta>
        {aviso && (
          <AvisoEnLinea tono="atencion" testId="sn-checkout-fallo-apartado">
            {aviso}
          </AvisoEnLinea>
        )}
        <AvisoEnLinea tono="info" as="div" className="font-normal">
          <p className="m-0 font-medium">Tu carrito se mantiene guardado</p>
          <p className="m-0">No te preocupes, tus productos siguen en el carrito. Puedes intentar el pago nuevamente cuando estés listo.</p>
        </AvisoEnLinea>
        <Botones reintentar />
        <Contacto
          texto="Si continúas teniendo problemas, no dudes en contactarnos:"
          mensajeWhatsApp="Hola, tuve un problema al pagar en la página de Arca Tierra"
          testIdWhatsApp="sn-checkout-fallo-whatsapp"
        />
      </Contenedor>
    </>
  )
}

const TESTID: Record<TipoResultado, string> = {
  exito: 'sn-checkout-exito',
  pendiente: 'sn-checkout-pendiente',
  fallo: 'sn-checkout-fallo',
}

export default function ResultadoPago({ tipo }: { tipo: TipoResultado }) {
  return (
    <main data-testid={TESTID[tipo]}>
      {tipo === 'exito' ? <Exito /> : tipo === 'pendiente' ? <Pendiente /> : <Fallo />}
    </main>
  )
}
