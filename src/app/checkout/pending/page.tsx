'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Clock, Package, Home, ShoppingCart, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { apartadoVigente, contenidoDelCarrito, horaVenceApartado } from '@/components/checkout/RelojApartado'
import { leerCarrito } from '@/lib/carrito'
import { textoApartadoHasta } from '@/types/tienda'
import { formatFechaMexico } from '@/lib/dates'
import { linkWhatsApp } from '@/lib/whatsapp'

interface DatosPagoPendiente {
  paymentId: string | null
  status: string | null
  merchantOrderId: string | null
  preferenceId: string | null
  /** `payment_type` que MercadoPago pone en la URL de regreso (`credit_card`, `ticket`, `bank_transfer`…). */
  paymentType: string | null
}

/**
 * DR7-b (R2): cuánto tarda en confirmarse, según CÓMO pagó el cliente (`payment_type` de la URL de MercadoPago).
 * La tienda y las experiencias solo cobran con tarjeta o saldo de MercadoPago: ahí nunca se habla de OXXO. El efectivo
 * y la transferencia solo aparecen si el pago de verdad fue así (un link de pago de una reserva, desde el panel).
 */
function tiempoDeConfirmacion(paymentType: string | null): string {
  if (paymentType === 'ticket') return 'Pagaste en efectivo en una tienda: se confirma en hasta 24 horas.'
  if (paymentType === 'bank_transfer' || paymentType === 'atm') {
    return 'Pagaste con transferencia o en cajero: se confirma en 1 a 2 días hábiles.'
  }
  return 'Tu banco está revisando el pago con tarjeta o saldo de MercadoPago; normalmente se resuelve en minutos.'
}

function PagoPendienteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<DatosPagoPendiente | null>(null)
  // F4 / R2: si el apartado sigue vigente (y es de este carrito), el aviso con la hora (México).
  const [avisoApartado, setAvisoApartado] = useState<string | null>(null)

  useEffect(() => {
    const items = leerCarrito()
    const apartado = apartadoVigente(items)
    setAvisoApartado(
      apartado ? `${textoApartadoHasta(contenidoDelCarrito(items), horaVenceApartado(apartado))}: vuelve a intentar` : null
    )
  }, [])

  useEffect(() => {
    // Obtener parámetros de la URL de Mercado Pago
    setPaymentData({
      paymentId: searchParams.get('payment_id'),
      status: searchParams.get('status'),
      merchantOrderId: searchParams.get('merchant_order_id'),
      preferenceId: searchParams.get('preference_id'),
      paymentType: searchParams.get('payment_type'),
    })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Ícono de pendiente */}
          <div className="mb-6">
            <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pago Pendiente ⏳
            </h1>
            <p className="text-lg text-gray-600">
              Tu pago está siendo procesado
            </p>
          </div>

          {/* Información del pago */}
          {paymentData && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                Detalles del Pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {paymentData.paymentId && (
                  <div>
                    <span className="font-medium text-yellow-600">ID de Pago:</span>
                    <p className="text-yellow-800">{paymentData.paymentId}</p>
                  </div>
                )}
                {paymentData.status && (
                  <div>
                    <span className="font-medium text-yellow-600">Estado:</span>
                    <p className="text-yellow-600 font-medium">
                      {paymentData.status === 'pending' ? 'Pendiente' : paymentData.status}
                    </p>
                  </div>
                )}
                {paymentData.merchantOrderId && (
                  <div>
                    <span className="font-medium text-yellow-600">Orden:</span>
                    <p className="text-yellow-800">{paymentData.merchantOrderId}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-yellow-600">Fecha:</span>
                  <p className="text-yellow-800">{formatFechaMexico(new Date())}</p>
                </div>
              </div>
            </div>
          )}

          {avisoApartado && (
            <div className="bg-amarillo-bg border border-amarillo rounded-lg p-4 mb-6 text-left" role="status" data-testid="pago-apartado-vigente">
              <p className="text-sm font-medium text-verde-tipografia">
                {avisoApartado}
              </p>
              <Link href="/checkout" className="mt-2 inline-block text-sm font-medium text-[#B15543] hover:underline">
                Volver a pagar
              </Link>
            </div>
          )}

          {/* Mensaje informativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-800 mb-1">
                  ¿Qué significa esto?
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tu pago está siendo verificado por el banco</li>
                  <li>• Recibirás una notificación cuando se confirme</li>
                  <li>• El proceso puede tomar hasta 48 horas</li>
                  <li>• Te contactaremos por email con actualizaciones</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cuánto tarda, según cómo pagó (DR7-b: la tienda no ofrece OXXO) */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
            <h4 className="flex items-center gap-2 font-medium text-gray-800 mb-2">
              <CreditCard className="h-4 w-4 shrink-0 text-terracota" aria-hidden="true" />
              ¿Cuánto tarda?
            </h4>
            <p className="text-sm text-gray-600" data-testid="pago-pendiente-tiempo">
              {tiempoDeConfirmacion(searchParams.get('payment_type'))}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/tienda')}
              className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white py-3"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Continuar Comprando
            </Button>
            
            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full border-[#33503E] text-[#33503E] hover:bg-[#33503E] hover:text-white py-3"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer informativo */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">
            Si tienes preguntas sobre tu pago, contáctanos:
          </p>
          <div className="space-y-1">
            <p>
              📧 Email: <a href="mailto:pagos@arcatierra.com" className="text-[#B15543] hover:underline">pagos@arcatierra.com</a>
            </p>
            <p>
              📱 WhatsApp:{' '}
              <a
                href={linkWhatsApp('Hola, tengo una pregunta sobre mi pago pendiente en la página de Arca Tierra')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B15543] hover:underline"
                data-testid="pago-whatsapp"
              >
                Escríbenos por WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PagoPendientePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pago...</p>
        </div>
      </div>
    }>
      <PagoPendienteContent />
    </Suspense>
  )
}
