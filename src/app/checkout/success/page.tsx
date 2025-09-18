// @ts-nocheck
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function ContenidoExito() {
  const searchParams = useSearchParams();
  const [infoPago, setInfoPago] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  // Obtener parámetros de la URL que MercadoPago envía
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const merchantOrderId = searchParams.get('merchant_order_id');
  const externalReference = searchParams.get('external_reference');
  const preferenceId = searchParams.get('preference_id');

  useEffect(() => {
    // Si tenemos un ID de pago, consultar su estado
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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Tarjeta de éxito */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            ¡Pago exitoso!
          </h1>
          
          <p className="text-center text-gray-600 mb-8">
            Tu pago ha sido procesado correctamente. 
            Recibirás un email de confirmación en breve.
          </p>

          {/* Detalles del pago si están disponibles */}
          {infoPago && infoPago.exito && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Detalles de tu pedido:</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de orden:</span>
                  <span className="font-medium">{infoPago.idOrden || externalReference}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de pago:</span>
                  <span className="font-medium">{paymentId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto pagado:</span>
                  <span className="font-medium text-green-600">
                    ${infoPago.monto?.toFixed(2)} MXN
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-medium capitalize">
                    {infoPago.estado || 'Aprobado'}
                  </span>
                </div>

                {infoPago.metodoPago?.ultimosDigitos && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarjeta:</span>
                    <span className="font-medium">
                      **** {infoPago.metodoPago.ultimosDigitos}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-blue-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Tu pedido está siendo preparado. 
                  Te notificaremos cuando esté listo para entrega.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/tienda"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
            >
              Seguir comprando
            </Link>
            
            <Link 
              href="/usuario/pedidos"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Ver mis pedidos
            </Link>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>¿Tienes alguna pregunta?</p>
          <p>
            Contáctanos en{' '}
            <a 
              href="mailto:ventas@arcatierra.com" 
              className="text-green-600 hover:underline"
            >
              ventas@arcatierra.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense para manejar useSearchParams
export default function PaginaExitoPago() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del pago...</p>
        </div>
      </div>
    }>
      <ContenidoExito />
    </Suspense>
  );
}