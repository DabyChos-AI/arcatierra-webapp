// @ts-nocheck
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function ContenidoFallo() {
  const searchParams = useSearchParams();
  const [infoPago, setInfoPago] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  // Obtener parámetros de la URL
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    if (paymentId) {
      consultarEstadoPago(paymentId);
    } else {
      setCargando(false);
    }
  }, [paymentId]);

  const consultarEstadoPago = async (idPago: string) => {
    try {
      const respuesta = await fetch(`/api/payment/status/${idPago}`);
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setInfoPago(datos);
      }
    } catch (error) {
      console.error('Error consultando pago:', error);
    } finally {
      setCargando(false);
    }
  };

  // Mensajes de error según el motivo del rechazo
  const obtenerMensajeError = (detalleEstado: string) => {
    const mensajes: Record<string, string> = {
      'cc_rejected_insufficient_amount': 'Tu tarjeta no tiene fondos suficientes.',
      'cc_rejected_bad_filled_security_code': 'El código de seguridad es incorrecto.',
      'cc_rejected_bad_filled_date': 'La fecha de vencimiento es incorrecta.',
      'cc_rejected_card_disabled': 'Tu tarjeta está deshabilitada. Contacta a tu banco.',
      'cc_rejected_duplicated_payment': 'Ya realizaste un pago similar recientemente.',
      'cc_rejected_high_risk': 'El pago fue rechazado por seguridad.',
      'cc_rejected_invalid_installments': 'El número de cuotas no es válido.',
      'cc_rejected_max_attempts': 'Alcanzaste el límite de intentos. Intenta más tarde.',
      'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco.',
      'cc_rejected_other_reason': 'El pago fue rechazado. Intenta con otro medio de pago.'
    };

    return mensajes[detalleEstado] || 'El pago no pudo ser procesado. Por favor intenta nuevamente.';
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Tarjeta de error */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icono de error */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Pago no completado
          </h1>
          
          <p className="text-center text-gray-600 mb-8">
            {infoPago?.detalleEstado 
              ? obtenerMensajeError(infoPago.detalleEstado)
              : 'No pudimos procesar tu pago. Por favor intenta nuevamente.'}
          </p>

          {/* Detalles del error si están disponibles */}
          {infoPago && (
            <div className="bg-red-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-red-800">
                Detalles del problema:
              </h2>
              
              <div className="space-y-2 text-red-700">
                {externalReference && (
                  <div className="flex justify-between">
                    <span>Número de orden:</span>
                    <span className="font-medium">{externalReference}</span>
                  </div>
                )}
                
                {infoPago.estado && (
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="font-medium capitalize">{infoPago.estado}</span>
                  </div>
                )}

                {infoPago.detalleEstado && (
                  <div className="flex justify-between">
                    <span>Motivo:</span>
                    <span className="font-medium">
                      {obtenerMensajeError(infoPago.detalleEstado)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sugerencias para el usuario */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-yellow-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Sugerencias:
                </h3>
                <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Verifica que los datos de tu tarjeta sean correctos</li>
                  <li>Asegúrate de tener fondos suficientes</li>
                  <li>Prueba con otro medio de pago</li>
                  <li>Contacta a tu banco si el problema persiste</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/checkout"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Intentar nuevamente
            </Link>
            
            <Link 
              href="/tienda"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>¿Necesitas ayuda con tu pago?</p>
          <p>
            Contáctanos en{' '}
            <a 
              href="mailto:soporte@arcatierra.com" 
              className="text-blue-600 hover:underline"
            >
              soporte@arcatierra.com
            </a>
          </p>
          <p className="mt-2">
            O llámanos al{' '}
            <a 
              href="tel:+525555555555" 
              className="text-blue-600 hover:underline"
            >
              (55) 5555-5555
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function PaginaFalloPago() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    }>
      <ContenidoFallo />
    </Suspense>
  );
}