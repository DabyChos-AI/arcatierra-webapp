'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, ArrowRight, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PendingSubscription {
  subscription_id: string
  mp_preapproval_id: string
  plan_name: string
  frequency: string
  email: string
}

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')
  const [subscriptionInfo, setSubscriptionInfo] = useState<PendingSubscription | null>(null)

  useEffect(() => {
    const preapprovalId = searchParams.get('preapproval_id')
    const mpStatus = searchParams.get('status')

    const pending = localStorage.getItem('pendingSubscription')
    if (pending) {
      try {
        setSubscriptionInfo(JSON.parse(pending))
      } catch (e) {
        console.error('Error parsing pending subscription:', e)
      }
    }

    if (mpStatus === 'authorized' || mpStatus === 'approved') {
      setStatus('success')
      localStorage.removeItem('pendingSubscription')
    } else if (mpStatus === 'pending') {
      setStatus('pending')
    } else {
      setStatus('error')
    }
  }, [searchParams])

  const frequencyText = subscriptionInfo?.frequency === 'weekly' ? 'semanal' : 'quincenal'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-[#B15543] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Procesando...</h1>
              <p className="text-gray-600">Verificando el estado de tu suscripción</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-[#33503E] mb-4">
                ¡Suscripción Activada!
              </h1>
              <p className="text-gray-600 mb-6">
                Tu suscripción a <strong>{subscriptionInfo?.plan_name || 'Canasta'}</strong> con entrega{' '}
                <strong>{frequencyText}</strong> ha sido activada exitosamente.
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Próximos pasos:</h3>
                <ul className="text-sm text-green-700 text-left space-y-2">
                  <li className="flex items-start gap-2">
                    <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Recibirás tu primera canasta en los próximos días</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Los cobros se realizarán automáticamente cada {subscriptionInfo?.frequency === 'weekly' ? '7' : '14'} días</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Puedes pausar o cancelar desde tu perfil en cualquier momento</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Hemos enviado un correo de confirmación a <strong>{subscriptionInfo?.email}</strong>
              </p>

              <div className="flex gap-4 justify-center">
                <Link href="/usuario/dashboard">
                  <Button className="bg-[#33503E] hover:bg-[#2a4233] text-white">
                    Ver mis suscripciones
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/tienda">
                  <Button variant="outline">
                    Seguir comprando
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-yellow-700 mb-4">
                Pago Pendiente
              </h1>
              <p className="text-gray-600 mb-6">
                Tu suscripción está pendiente de confirmación. Esto puede tomar unos minutos.
              </p>
              
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  Si pagaste con OXXO o transferencia, espera a que se acredite el pago.
                  Te notificaremos por email cuando esté confirmado.
                </p>
              </div>

              <Link href="/">
                <Button className="bg-[#B15543] hover:bg-[#9a4a3a] text-white">
                  Volver al inicio
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-red-700 mb-4">
                No se pudo procesar
              </h1>
              <p className="text-gray-600 mb-6">
                Hubo un problema al procesar tu suscripción. No se realizó ningún cargo.
              </p>
              
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  Puedes intentar de nuevo o contactarnos si el problema persiste.
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Link href="/suscripciones">
                  <Button className="bg-[#B15543] hover:bg-[#9a4a3a] text-white">
                    Intentar de nuevo
                  </Button>
                </Link>
                <Link href="mailto:experiencias@arcatierra.com">
                  <Button variant="outline">
                    Contactar soporte
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmacionSuscripcion() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#B15543] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}
