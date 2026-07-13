'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Package, Home, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function PagoExitosoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    // Limpiar el carrito al confirmar pago exitoso
    localStorage.removeItem('arcaTierraCart')
    window.dispatchEvent(new Event('cartUpdated'))

    // Obtener parámetros de la URL de Mercado Pago
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const merchantOrderId = searchParams.get('merchant_order_id')
    const preferenceId = searchParams.get('preference_id')

    setPaymentData({
      paymentId,
      status,
      merchantOrderId,
      preferenceId
    })

    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#B15543] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando información del pago...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-[#33503E]/10 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Ícono de éxito */}
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Pago Exitoso! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Tu orden ha sido confirmada y está siendo procesada
            </p>
          </div>

          {/* Información del pago */}
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Detalles del Pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {paymentData.paymentId && (
                  <div>
                    <span className="font-medium text-gray-600">ID de Pago:</span>
                    <p className="text-gray-800">{paymentData.paymentId}</p>
                  </div>
                )}
                {paymentData.status && (
                  <div>
                    <span className="font-medium text-gray-600">Estado:</span>
                    <p className="text-green-600 font-medium">
                      {paymentData.status === 'approved' ? 'Aprobado' : paymentData.status}
                    </p>
                  </div>
                )}
                {paymentData.merchantOrderId && (
                  <div>
                    <span className="font-medium text-gray-600">Orden:</span>
                    <p className="text-gray-800">{paymentData.merchantOrderId}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-600">Fecha:</span>
                  <p className="text-gray-800">{new Date().toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje informativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-800 mb-1">
                  ¿Qué sigue?
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Recibirás un email de confirmación en unos minutos</li>
                  <li>• Tu pedido será preparado y empacado con cuidado</li>
                  <li>• Te contactaremos para coordinar la entrega</li>
                  <li>• Tiempo estimado de entrega: 24-48 horas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mensaje ambiental */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <h4 className="font-medium text-green-800 mb-2">
              🌱 ¡Gracias por elegir productos locales!
            </h4>
            <p className="text-sm text-green-700">
              Con tu compra contribuyes al desarrollo de productores locales 
              y reduces la huella de carbono de tus alimentos.
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
          <p>
            Si tienes alguna pregunta sobre tu pedido, puedes contactarnos en{' '}
            <a href="mailto:pedidos@arcatierra.com" className="text-[#B15543] hover:underline">
              pedidos@arcatierra.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#B15543] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pago...</p>
        </div>
      </div>
    }>
      <PagoExitosoContent />
    </Suspense>
  )
}
