// @ts-nocheck
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function ContenidoPendiente() {
  const searchParams = useSearchParams();
  const [infoPago, setInfoPago] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  // Obtener parámetros de la URL
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');
  const paymentType = searchParams.get('payment_type');

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

  // Información según el tipo de pago pendiente
  const obtenerInfoPagoPendiente = (tipo: string) => {
    const informacion: Record<string, any> = {
      'ticket': {
        titulo: 'Pago en efectivo pendiente',
        descripcion: 'Tu orden ha sido generada. Realiza el pago en el establecimiento que elegiste.',
        icono: '🏪',
        instrucciones: [
          'Presenta el código de pago en la tienda seleccionada',
          'Realiza el pago en efectivo',
          'Guarda tu comprobante',
          'Tu pedido será confirmado automáticamente'
        ]
      },
      'bank_transfer': {
        titulo: 'Transferencia bancaria pendiente',
        descripcion: 'Tu orden ha sido generada. Completa la transferencia bancaria.',
        icono: '🏦',
        instrucciones: [
          'Realiza la transferencia a la cuenta proporcionada',
          'Usa la referencia de pago indicada',
          'La confirmación puede tardar hasta 24 horas',
          'Recibirás un email cuando se acredite el pago'
        ]
      },
      'default': {
        titulo: 'Pago pendiente de confirmación',
        descripcion: 'Tu orden ha sido registrada y está pendiente de confirmación de pago.',
        icono: '⏳',
        instrucciones: [
          'El pago está siendo procesado',
          'Recibirás una confirmación por email',
          'Esto puede tomar algunos minutos',
          'No es necesario que hagas nada más'
        ]
      }
    };

    return informacion[tipo] || informacion['default'];
  };

  const infoPendiente = obtenerInfoPagoPendiente(paymentType || 'default');

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Tarjeta de pago pendiente */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icono de pendiente */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">{infoPendiente.icono}</span>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            {infoPendiente.titulo}
          </h1>
          
          <p className="text-center text-gray-600 mb-8">
            {infoPendiente.descripcion}
          </p>

          {/* Detalles del pedido */}
          {(infoPago || externalReference) && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Información de tu pedido:</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de orden:</span>
                  <span className="font-medium">
                    {infoPago?.idOrden || externalReference || 'Pendiente'}
                  </span>
                </div>
                
                {paymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de referencia:</span>
                    <span className="font-medium text-sm">{paymentId}</span>
                  </div>
                )}
                
                {infoPago?.monto && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto a pagar:</span>
                    <span className="font-medium text-yellow-600">
                      ${infoPago.monto.toFixed(2)} MXN
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Instrucciones */}
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
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Próximos pasos:
                </h3>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  {infoPendiente.instrucciones.map((instruccion: string, index: number) => (
                    <li key={index}>{instruccion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Tiempo estimado */}
          <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <svg 
                className="inline-block w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Tiempo estimado de confirmación: 
              <span className="font-semibold ml-1">
                {paymentType === 'bank_transfer' ? '24 horas' : '15-30 minutos'}
              </span>
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/usuario/pedidos"
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors text-center"
            >
              Ver estado del pedido
            </Link>
            
            <Link 
              href="/tienda"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              Seguir comprando
            </Link>
          </div>

          {/* Nota importante */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Importante:</strong> Recibirás un correo electrónico de confirmación 
              una vez que tu pago sea procesado. Si no recibes el correo en las próximas 
              horas, revisa tu carpeta de spam o contáctanos.
            </p>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>¿Tienes alguna pregunta sobre tu pago?</p>
          <p>
            Contáctanos en{' '}
            <a 
              href="mailto:pagos@arcatierra.com" 
              className="text-yellow-600 hover:underline"
            >
              pagos@arcatierra.com
            </a>
          </p>
          <p className="mt-2">
            WhatsApp:{' '}
            <a 
              href="https://wa.me/525555555555" 
              className="text-green-600 hover:underline"
            >
              +52 55 5555 5555
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function PaginaPagoPendiente() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del pago...</p>
        </div>
      </div>
    }>
      <ContenidoPendiente />
    </Suspense>
  );
}