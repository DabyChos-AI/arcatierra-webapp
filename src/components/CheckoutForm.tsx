'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, CreditCard, Truck, User, Phone, Mail } from 'lucide-react'

interface CheckoutFormProps {
  cartItems: any[]
  onOrderComplete: (orderId: string) => void
}

export default function CheckoutForm({ cartItems, onOrderComplete }: CheckoutFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  const [customerData, setCustomerData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    rfc: '',
  })

  const [deliveryData, setDeliveryData] = useState({
    address: '',
    postal_code: '',
    city: 'CDMX',
    preferred_date: '',
    notes: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('mercado_pago')
  const [createAccount, setCreateAccount] = useState(false)

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 500 ? 0 : 50 // Envío gratis arriba de $500
  const total = subtotal + shipping

  const handleSubmitOrder = async () => {
    // Validar que tenemos un email (de sesión o guest)
    const email = session?.user?.email || customerData.email
    if (!email) {
      alert('Por favor proporciona un email válido')
      return
    }

    setLoading(true)
    
    try {
      const orderData = {
        items: cartItems,
        customer: customerData,
        delivery: deliveryData,
        totals: {
          subtotal,
          shipping,
          total,
        },
        payment_method: paymentMethod,
        create_account: createAccount && !session?.user?.email,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        // Redirigir a la URL de pago de Mercado Pago
        if (result.payment_url) {
          window.location.href = result.payment_url
        } else {
          onOrderComplete(result.order_id)
        }
      } else {
        throw new Error(result.error || 'Error procesando la orden')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error procesando la orden. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const validatePostalCode = (cp: string) => {
    const cpNum = parseInt(cp)
    return cpNum >= 1000 && cpNum <= 16999
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#33503E]">Finalizar Compra</h2>
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step ? 'bg-[#B15543] text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {step === 1 && 'Información personal'}
          {step === 2 && 'Dirección de entrega'}
          {step === 3 && 'Método de pago'}
        </div>
      </div>

      {/* Paso 1: Información Personal */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#B15543]" />
            <h3 className="text-lg font-semibold">Información Personal</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <Input
                value={customerData.name}
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <Input
                value={customerData.phone}
                onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                placeholder="55 1234 5678"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              value={customerData.email}
              onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
              placeholder="tu@email.com"
              type="email"
              required
              disabled={!!session?.user?.email}
              className={session?.user?.email ? "bg-gray-100" : ""}
            />
            {session?.user?.email && (
              <p className="text-xs text-gray-500 mt-1">
                Email de tu cuenta iniciada
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RFC (opcional)
            </label>
            <Input
              value={customerData.rfc}
              onChange={(e) => setCustomerData({...customerData, rfc: e.target.value.toUpperCase()})}
              placeholder="XAXX010101000"
              maxLength={13}
            />
            <p className="text-xs text-gray-500 mt-1">
              Requerido solo si necesitas factura fiscal
            </p>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!customerData.name || !customerData.phone}
            className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white"
          >
            Continuar
          </Button>
        </div>
      )}

      {/* Paso 2: Dirección de Entrega */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#B15543]" />
            <h3 className="text-lg font-semibold">Dirección de Entrega</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección completa *
            </label>
            <Input
              value={deliveryData.address}
              onChange={(e) => setDeliveryData({...deliveryData, address: e.target.value})}
              placeholder="Calle, número, colonia"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Postal *
              </label>
              <Input
                value={deliveryData.postal_code}
                onChange={(e) => setDeliveryData({...deliveryData, postal_code: e.target.value})}
                placeholder="01000"
                maxLength={5}
                required
              />
              {deliveryData.postal_code && !validatePostalCode(deliveryData.postal_code) && (
                <p className="text-xs text-red-500 mt-1">
                  Solo entregamos en CDMX (CP 01000-16999)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha preferida
              </label>
              <Input
                type="date"
                value={deliveryData.preferred_date}
                onChange={(e) => setDeliveryData({...deliveryData, preferred_date: e.target.value})}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas de entrega (opcional)
            </label>
            <textarea
              value={deliveryData.notes}
              onChange={(e) => setDeliveryData({...deliveryData, notes: e.target.value})}
              placeholder="Instrucciones especiales para la entrega"
              className="w-full p-2 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1"
            >
              Atrás
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!deliveryData.address || !deliveryData.postal_code || !validatePostalCode(deliveryData.postal_code)}
              className="flex-1 bg-[#B15543] hover:bg-[#9a4a3a] text-white"
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Paso 3: Método de Pago */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-[#B15543]" />
            <h3 className="text-lg font-semibold">Método de Pago</h3>
          </div>

          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="mercado_pago"
                  checked={paymentMethod === 'mercado_pago'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-[#B15543]"
                />
                <div>
                  <div className="font-medium">Mercado Pago</div>
                  <div className="text-sm text-gray-500">
                    Tarjetas, OXXO, transferencias bancarias
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Opción de crear cuenta - solo para guests */}
          {!session?.user?.email && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-1 text-[#B15543] focus:ring-[#B15543]"
                />
                <div>
                  <div className="font-medium text-green-800">
                    Crear cuenta con mis datos
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Te enviaremos un email para crear tu contraseña y acceder a:
                  </div>
                  <ul className="text-xs text-green-600 mt-2 space-y-1">
                    <li>• Historial de pedidos</li>
                    <li>• Checkout más rápido en futuras compras</li>
                    <li>• Ofertas y descuentos exclusivos</li>
                  </ul>
                </div>
              </label>
            </div>
          )}

          {/* Resumen de la orden */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-3">Resumen de la orden</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} productos)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setStep(2)}
              variant="outline"
              className="flex-1"
            >
              Atrás
            </Button>
            <Button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="flex-1 bg-[#B15543] hover:bg-[#9a4a3a] text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </div>
              ) : (
                `Pagar $${total.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

