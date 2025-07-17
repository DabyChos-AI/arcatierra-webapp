'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CheckoutForm from '@/components/CheckoutForm'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    // Cargar items del carrito desde localStorage
    const savedCart = localStorage.getItem('arcaTierraCart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    // Redirigir si no hay sesión
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout')
    }
  }, [session, status, router])

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

  if (!session) {
    return null // El useEffect se encargará de la redirección
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
            <CheckoutForm 
              cartItems={cartItems}
              onOrderComplete={handleOrderComplete}
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
                    {cartItems.reduce((sum: number, item: any) => 
                      sum + (item.price * item.quantity), 0
                    ) > 500 ? 'Gratis' : '$50.00'}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ${(cartItems.reduce((sum: number, item: any) => 
                      sum + (item.price * item.quantity), 0
                    ) + (cartItems.reduce((sum: number, item: any) => 
                      sum + (item.price * item.quantity), 0
                    ) > 500 ? 0 : 50)).toFixed(2)}
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

