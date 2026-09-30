'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CheckoutFormSingleStep from '@/components/CheckoutFormSingleStep'
import DeliveryTypeSelector from '@/components/ui/DeliveryTypeSelector'
import ConMiCanasta, { type CanastaExtras } from '@/components/ui/ConMiCanasta'
import { API_URL } from '@/lib/api'
import { ShoppingCart, ArrowLeft, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { calcularCostoEnvio, subtotalProductos as calcSubtotalProductos } from '@/lib/envio'
import { formatFechaMexico } from '@/lib/dates'
import { leerCarrito, limpiarExperienciasViejas, vaciarCarrito } from '@/lib/carrito'
import { esItemExperiencia, subtotalExperiencia, textoPersonas } from '@/types/compra-experiencias'

/** Lo que cuesta un renglón: una experiencia es adultos × precio + niños × precio de niño. */
function subtotalRenglon(item: { price?: unknown; quantity?: unknown }): number {
  return esItemExperiencia(item) ? subtotalExperiencia(item) : (Number(item.price) || 0) * (Number(item.quantity) || 0)
}

function textoExperienciasQuitadas(n: number): string {
  return n === 1
    ? 'Quitamos 1 experiencia de tu carrito: vuelve a elegir la fecha'
    : `Quitamos ${n} experiencias de tu carrito: vuelve a elegir la fecha`
}

export default function CheckoutPage() {
  const sessionResult = useSession()
  const { data: session, status } = sessionResult || { data: null, status: 'loading' }
  const router = useRouter()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [carritoCargado, setCarritoCargado] = useState(false)
  const [experienciasQuitadas, setExperienciasQuitadas] = useState(0)
  const [tipoEntrega, setTipoEntrega] = useState<'envio_domicilio' | 'recoger_almacen'>('envio_domicilio')
  // El código de descuento se aplica en el formulario; aquí solo se refleja.
  const [cuponAplicado, setCuponAplicado] = useState<{ codigo: string; descuento: number } | null>(null)
  // SU2 (opción A, decisión de David 2026-09-29): los extras de una suscripción se pagan aquí y
  // viajan con la próxima canasta — envío gratis, sin cupón, hasta 2 días hábiles antes. Reemplaza
  // al botón que los agregaba sin cobrarlos.
  const [canastas, setCanastas] = useState<CanastaExtras[]>([])
  const [conCanasta, setConCanasta] = useState<CanastaExtras | null>(null)
  const accessToken = (session as any)?.accessToken as string | undefined

  const hayExperiencias = cartItems.some(esItemExperiencia)
  const hayProductos = cartItems.some((item) => !esItemExperiencia(item))

  useEffect(() => {
    if (!accessToken) { setCanastas([]); setConCanasta(null); return }
    let vigente = true
    fetch(`${API_URL}/api/subscriptions/extras-disponibles`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : { entregas: [] }))
      .then((d) => { if (vigente) setCanastas(Array.isArray(d?.entregas) ? d.entregas : []) })
      .catch(() => { if (vigente) setCanastas([]) })
    return () => { vigente = false }
  }, [accessToken])

  // Las experiencias se pagan aparte de los extras de una canasta (C3): con experiencias no se ofrece.
  useEffect(() => {
    if (hayExperiencias) setConCanasta(null)
  }, [hayExperiencias])

  // El envío de las dos columnas sale de aquí: con la canasta es gratis. Solo cuentan los productos.
  const envioPedido = (items: any[]) =>
    conCanasta ? 0 : calcularCostoEnvio(calcSubtotalProductos(items), tipoEntrega)

  useEffect(() => {
    // Renglones de experiencia de antes de la Fase 4 (sin evento_id): fuera, con aviso.
    setExperienciasQuitadas(limpiarExperienciasViejas())
    // El carrito se relee cada vez que cambia (p. ej. desde el carrito lateral, abierto sobre esta página).
    const recargar = () => setCartItems(leerCarrito())
    recargar()
    setCarritoCargado(true)
    window.addEventListener('cartUpdated', recargar)
    return () => window.removeEventListener('cartUpdated', recargar)
  }, [])

  // Ya no redirigimos si no hay sesión - permitimos guest checkout

  const handleOrderComplete = (orderId: string) => {
    // Limpiar carrito
    vaciarCarrito()

    // Redirigir a página de confirmación
    router.push(`/order-confirmation/${orderId}`)
  }

  const avisoQuitadas = experienciasQuitadas > 0 && (
    <p className="mb-6 rounded-lg bg-amarillo-bg p-3 text-sm text-verde-tipografia" role="status" data-testid="checkout-aviso-viejas">
      {textoExperienciasQuitadas(experienciasQuitadas)}
    </p>
  )

  if (status === 'loading' || !carritoCargado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#B15543] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {avisoQuitadas}
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-6">
            Agrega algunos productos antes de proceder al checkout
          </p>
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 bg-[#B15543] text-white px-6 py-3 rounded-lg hover:bg-[#9a4a3a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir a la tienda
          </Link>
        </div>
      </div>
    )
  }

  const subtotalProductos = calcSubtotalProductos(cartItems)
  const subtotalExperiencias = cartItems.filter(esItemExperiencia).reduce((sum, exp) => sum + subtotalExperiencia(exp), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="sr-only">Finalizar compra</h1>
        <div className="mb-6">
          <Link
            href={hayProductos ? '/tienda' : '/calendario'}
            className="inline-flex items-center gap-2 text-[#B15543] hover:text-[#9a4a3a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {hayProductos ? 'Volver a la tienda' : 'Volver al calendario'}
          </Link>
        </div>

        {avisoQuitadas}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de checkout */}
          <div className="lg:col-span-2 min-w-0">
            {/* Extras que viajan con la canasta de la suscripción (SU2); no con experiencias */}
            {!hayExperiencias && (
              <ConMiCanasta canastas={canastas} seleccion={conCanasta} onChange={setConCanasta} />
            )}

            {/* Selector de tipo de entrega (con la canasta lo decide la suscripción; sin productos no hay entrega) */}
            {!conCanasta && hayProductos && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <DeliveryTypeSelector
                value={tipoEntrega}
                onChange={setTipoEntrega}
                subtotal={subtotalProductos}
                minimoEnvioGratis={1000}
                costoEnvio={100}
              />
            </div>
            )}

            <CheckoutFormSingleStep
              cartItems={cartItems}
              onOrderComplete={handleOrderComplete}
              tipoEntrega={tipoEntrega}
              costoEnvio={envioPedido(cartItems)}
              onCuponChange={setCuponAplicado}
              conCanasta={conCanasta}
            />
          </div>

          {/* Resumen del carrito */}
          <div className="lg:col-span-1 min-w-0">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Tu pedido</h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 shrink-0 object-cover rounded"
                      />
                    ) : (
                      <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded bg-neutro-light" aria-hidden="true">
                        {esItemExperiencia(item) ? <CalendarDays className="w-5 h-5 text-verde" /> : <ShoppingCart className="w-5 h-5 text-verde" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      {esItemExperiencia(item) ? (
                        <p className="text-xs text-gray-500">
                          {formatFechaMexico(item.fecha, { day: 'numeric', month: 'short', year: undefined })} · {item.hora} ·{' '}
                          {textoPersonas(item.adultos, item.ninos)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          {item.quantity} x ${item.price}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-sm">
                      ${subtotalRenglon(item).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    ${(subtotalProductos + subtotalExperiencias).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span data-testid="envio-pedido">
                    {(() => {
                      if (!hayProductos) return 'Sin envío'
                      if (conCanasta) return 'Gratis (va con tu canasta)'
                      if (tipoEntrega === 'recoger_almacen') return 'Gratis (recoger)'
                      const envio = envioPedido(cartItems)
                      return envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`
                    })()}
                  </span>
                </div>
                {(() => {
                  if (conCanasta) {
                    return (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        🧺 Llega con tu canasta de suscripción, sin costo de envío
                      </div>
                    )
                  }
                  if (tipoEntrega === 'recoger_almacen' && hayProductos) {
                    return (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        🏪 Recoger en: Gob. Antonio Díez de Bonilla #37, San Miguel Chapultepec
                      </div>
                    )
                  }
                  if (subtotalProductos > 0 && subtotalProductos < 1000) {
                    return (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        💰 Te faltan ${(1000 - subtotalProductos).toFixed(2)} en productos para envío GRATIS
                      </div>
                    )
                  } else if (subtotalProductos >= 1000) {
                    return (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        🎉 ¡Felicidades! Tu envío es GRATIS
                      </div>
                    )
                  } else if (subtotalProductos === 0 && subtotalExperiencias > 0) {
                    return (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        ✨ Las experiencias no tienen costo de envío
                      </div>
                    )
                  }
                  return null
                })()}
                {cuponAplicado && (
                  <div className="flex justify-between text-green-700">
                    <span>Descuento ({cuponAplicado.codigo})</span>
                    <span>−${cuponAplicado.descuento.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span data-testid="total-pedido">
                    ${(subtotalProductos + subtotalExperiencias + envioPedido(cartItems) - (cuponAplicado?.descuento ?? 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {hayProductos && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700">
                  🌱 Con tu compra ahorras aproximadamente{' '}
                  <strong>
                    {cartItems.reduce((sum: number, item: any) =>
                      sum + (item.environmental_metrics?.co2_saved || 0) * item.quantity, 0
                    ).toFixed(1)} kg de CO₂
                  </strong>
                </p>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
