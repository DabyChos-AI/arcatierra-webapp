'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function PagoFallidoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    // Obtener parámetros de la URL de Mercado Pago
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const statusDetail = searchParams.get('status_detail')
    const preferenceId = searchParams.get('preference_id')

    setPaymentData({
      paymentId,
      status,
      statusDetail,
      preferenceId
    })
  }, [searchParams])

  const getStatusMessage = (status: string, statusDetail: string) => {
    if (status === 'rejected') {
      switch (statusDetail) {
        case 'cc_rejected_insufficient_amount':
          return 'Fondos insuficientes en la tarjeta'
        case 'cc_rejected_invalid_installments':
          return 'Número de cuotas inválido'
        case 'cc_rejected_max_attempts':
          return 'Has superado el límite de intentos'
        case 'cc_rejected_duplicate_payment':
          return 'Pago duplicado'
        case 'cc_rejected_card_disabled':
          return 'Tarjeta deshabilitada'
        case 'cc_rejected_bad_filled_card_number':
          return 'Número de tarjeta incorrecto'
        case 'cc_rejected_bad_filled_date':
          return 'Fecha de vencimiento incorrecta'
        case 'cc_rejected_bad_filled_other':
          return 'Datos de la tarjeta incorrectos'
        case 'cc_rejected_bad_filled_security_code':
          return 'Código de seguridad incorrecto'
        default:
          return 'Pago rechazado'
      }
    }
    if (status === 'cancelled') {
      return 'Pago cancelado por el usuario'
    }
    return 'Error en el procesamiento del pago'
  }

  const handleRetry = () => {
    // Redirigir de vuelta al checkout para intentar de nuevo
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Ícono de error */}
          <div className="mb-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pago No Procesado
            </h1>
            <p className="text-lg text-gray-600">
              Hubo un problema al procesar tu pago
            </p>
          </div>

          {/* Información del error */}
          {paymentData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                Detalles del Error
              </h3>
              <div className="text-sm text-left space-y-2">
                {paymentData.status && paymentData.statusDetail && (
                  <div>
                    <span className="font-medium text-red-700">Motivo:</span>
                    <p className="text-red-600">
                      {getStatusMessage(paymentData.status, paymentData.statusDetail)}
                    </p>
                  </div>
                )}
                {paymentData.paymentId && (
                  <div>
                    <span className="font-medium text-red-700">ID de Transacción:</span>
                    <p className="text-red-600">{paymentData.paymentId}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-red-700">Fecha del Intento:</span>
                  <p className="text-red-600">{new Date().toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sugerencias */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-800 mb-2">
                  ¿Qué puedes hacer?
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Verifica que los datos de tu tarjeta sean correctos</li>
                  <li>• Asegúrate de tener fondos suficientes</li>
                  <li>• Intenta con otro método de pago</li>
                  <li>• Contacta a tu banco si el problema persiste</li>
                  <li>• Puedes intentar el pago nuevamente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estado del carrito */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h4 className="font-medium text-yellow-800 mb-2">
              📦 Tu carrito se mantiene guardado
            </h4>
            <p className="text-sm text-yellow-700">
              No te preocupes, tus productos siguen en el carrito. 
              Puedes intentar el pago nuevamente cuando estés listo.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white py-3"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Intentar Pago Nuevamente
            </Button>
            
            <Link href="/tienda" className="block">
              <Button
                variant="outline"
                className="w-full border-[#33503E] text-[#33503E] hover:bg-[#33503E] hover:text-white py-3"
                size="lg"
              >
                Continuar Comprando
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800 py-3"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer de ayuda */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">
            Si continúas teniendo problemas, no dudes en contactarnos:
          </p>
          <div className="space-y-1">
            <p>
              📧 Email: <a href="mailto:soporte@arcatierra.com" className="text-[#B15543] hover:underline">soporte@arcatierra.com</a>
            </p>
            <p>
              📱 WhatsApp: <a href="https://wa.me/5512345678" className="text-[#B15543] hover:underline">+52 55 1234 5678</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PagoFallidoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pago...</p>
        </div>
      </div>
    }>
      <PagoFallidoContent />
    </Suspense>
  )
}
