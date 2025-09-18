// @ts-nocheck
'use client';

import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useState, useEffect } from 'react';

// Interfaces para los tipos
interface Articulo {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: number;
  cantidad: number;
}

interface Usuario {
  id?: string;
  email: string;
  nombre?: string;
  telefono?: string;
}

interface PropsMercadoPagoCheckout {
  articulos: Articulo[];
  usuario?: Usuario;
  onExito?: (ordenId: string) => void;
  onError?: (error: string) => void;
}

export default function MercadoPagoCheckout({ 
  articulos, 
  usuario,
  onExito,
  onError 
}: PropsMercadoPagoCheckout) {
  const [preferenciaId, setPreferenciaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarWallet, setMostrarWallet] = useState(false);
  
  // Calcular total
  const total = articulos.reduce((suma, articulo) => 
    suma + (articulo.precio * articulo.cantidad), 0
  );

  // Inicializar MercadoPago cuando el componente se monte
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, {
        locale: 'es-MX'
      });
    } else {
      setError('Error de configuración: Falta la clave pública de MercadoPago');
    }
  }, []);

  // Función para procesar el checkout
  const procesarCheckout = async () => {
    setCargando(true);
    setError(null);

    try {
      // Validaciones básicas
      if (articulos.length === 0) {
        throw new Error('El carrito está vacío');
      }

      if (!usuario?.email) {
        throw new Error('Se requiere un email para continuar');
      }

      // Llamar a la API para crear la preferencia
      const respuesta = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articulos: articulos,
          pagador: {
            email: usuario.email,
            nombre: usuario.nombre || '',
            telefono: usuario.telefono || ''
          },
          idUsuario: usuario.id || null
        }),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const datos = await respuesta.json();
      
      // Guardar el ID de la preferencia
      setPreferenciaId(datos.preferenciaId);
      setMostrarWallet(true);
      
      // Callback de éxito si existe
      if (onExito && datos.ordenId) {
        onExito(datos.ordenId);
      }

    } catch (err: any) {
      const mensajeError = err.message || 'Error al procesar el pago. Intenta nuevamente.';
      setError(mensajeError);
      console.error('Error en checkout:', err);
      
      // Callback de error si existe
      if (onError) {
        onError(mensajeError);
      }
    } finally {
      setCargando(false);
    }
  };

  // Función para reintentar
  const reintentar = () => {
    setError(null);
    setPreferenciaId(null);
    setMostrarWallet(false);
  };

  return (
    <div className="mercadopago-checkout-container">
      {/* Resumen del pedido */}
      <div className="resumen-pedido bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
        
        {/* Lista de artículos */}
        <div className="articulos-lista space-y-2 mb-4">
          {articulos.map(articulo => (
            <div key={articulo.id} className="flex justify-between py-2 border-b">
              <div className="flex-1">
                <span className="font-medium">{articulo.nombre}</span>
                <span className="text-gray-500 ml-2">x{articulo.cantidad}</span>
              </div>
              <span className="font-semibold">
                ${(articulo.precio * articulo.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        
        {/* Total */}
        <div className="total-pedido pt-4 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">${total.toFixed(2)} MXN</span>
          </div>
        </div>

        {/* Información del comprador */}
        {usuario && (
          <div className="info-comprador mt-4 pt-4 border-t text-sm text-gray-600">
            <p>Comprador: {usuario.nombre || usuario.email}</p>
            {usuario.telefono && <p>Teléfono: {usuario.telefono}</p>}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alerta-error bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>{error}
          <button 
            onClick={reintentar}
            className="ml-4 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Botón de checkout o Wallet de MercadoPago */}
      {!mostrarWallet ? (
        <button 
          onClick={procesarCheckout}
          disabled={cargando || articulos.length === 0}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors
            ${cargando || articulos.length === 0
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
        >
          {cargando ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            'Proceder al pago con MercadoPago'
          )}
        </button>
      ) : (
        <div className="mercadopago-wallet-container">
          {preferenciaId && (
            <Wallet
              initialization={{ 
                preferenceId: preferenciaId,
                redirectMode: 'self'
              }}
              onReady={() => console.log('Wallet de MercadoPago lista')}
              onError={(error: any) => {
                console.error('Error en Wallet:', error);
                setError('Error al cargar MercadoPago. Por favor recarga la página.');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}