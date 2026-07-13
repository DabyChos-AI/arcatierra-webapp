'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CheckoutFormSingleStep from '@/components/CheckoutFormSingleStep'
import DeliveryTypeSelector from '@/components/ui/DeliveryTypeSelector'
import AddToSubscriptionButton from '@/components/ui/AddToSubscriptionButton'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const sessionResult = useSession()
  const { data: session, status } = sessionResult || { data: null, status: 'loading' }
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [tipoEntrega, setTipoEntrega] = useState<'envio_domicilio' | 'recoger_almacen'>('envio_domicilio')

  useEffect(() => {
    // Cargar items del carrito desde localStorage
    const savedCart = localStorage.getItem('arcaTierraCart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Ya no redirigimos si no hay sesión - permitimos guest checkout

  const handleOrderComplete = (orderId: string) => {
    // Limpiar carrito
    localStorage.removeItem('cart')
    setCartItems([])
    
    // Redirigir a página de confirmación
    router.push(`/order-confirmation/${orderId}`)
  }

  if (status === 'loading') {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 text-[#B15543] hover:text-[#9a4a3a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de checkout */}
          <div className="lg:col-span-2">
            {/* Opción de agregar a suscripción existente */}
            <AddToSubscriptionButton 
              cartItems={cartItems}
              onSuccess={() => {
                localStorage.removeItem('arcaTierraCart')
                setCartItems([])
              }}
            />

            {/* Selector de tipo de entrega */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <DeliveryTypeSelector
                value={tipoEntrega}
                onChange={setTipoEntrega}
                subtotal={cartItems
                  .filter((item: any) => item.tipo !== 'experiencia')
                  .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
                }
                minimoEnvioGratis={1000}
                costoEnvio={100}
              />
            </div>
            
            <CheckoutFormSingleStep 
              cartItems={cartItems}
              onOrderComplete={handleOrderComplete}
              tipoEntrega={tipoEntrega}
              costoEnvio={tipoEntrega === 'recoger_almacen' ? 0 : 
                (cartItems.filter((item: any) => item.tipo !== 'experiencia')
                  .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) >= 1000 ? 0 : 100)}
            />
          </div>

          {/* Resumen del carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Tu pedido</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x ${item.price}
                      </p>
                    </div>
                    <span className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    ${cartItems.reduce((sum: number, item: any) => 
                      sum + (item.price * item.quantity), 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>
                    {(() => {
                      if (tipoEntrega === 'recoger_almacen') return 'Gratis (recoger)'
                      const subtotalProductos = cartItems
                        .filter((item: any) => item.tipo !== 'experiencia')
                        .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
                      return (subtotalProductos >= 1000) ? 'Gratis' : '$100.00'
                    })()}
                  </span>
                </div>
                {(() => {
                  if (tipoEntrega === 'recoger_almacen') {
                    return (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        🏪 Recoger en: Gob. Antonio Díez de Bonilla #37, San Miguel Chapultepec
                      </div>
                    )
                  }
                  const subtotalProductos = cartItems
                    .filter((item: any) => item.tipo !== 'experiencia')
                    .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
                  const subtotalExperiencias = cartItems
                    .filter((item: any) => item.tipo === 'experiencia')
                    .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
                  
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
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ${(() => {
                      const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
                      const subtotalProductos = cartItems
                        .filter((item: any) => item.tipo !== 'experiencia')
                        .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
                      const shipping = tipoEntrega === 'recoger_almacen' ? 0 : 
                        (subtotalProductos >= 1000 ? 0 : 100)
                      return (subtotal + shipping).toFixed(2)
                    })()}
                  </span>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

