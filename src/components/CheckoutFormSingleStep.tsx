'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import DeliveryDatePicker from '@/components/ui/DeliveryDatePicker'
import PostalCodeSelector from '@/components/ui/PostalCodeSelector'
import { MapPin, CreditCard, User, Phone, Mail, Edit2, Calendar } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface CheckoutFormProps {
  cartItems: any[]
  onOrderComplete: (orderId: string) => void
  tipoEntrega?: 'envio_domicilio' | 'recoger_almacen'
  costoEnvio?: number
}

export default function CheckoutFormSingleStep({ cartItems, onOrderComplete, tipoEntrega = 'envio_domicilio', costoEnvio = 0 }: CheckoutFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [editingAddress, setEditingAddress] = useState(false)
  
  const [customerData, setCustomerData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    codigo_pais: '+52',
    rfc: '',
  })

  // Fecha por defecto: pasado mañana (para dar tiempo de preparación)
  // Entregamos de lunes a viernes y necesitamos un día hábil de preparación.
  // El backend valida lo mismo (services/dias_habiles.py); esto solo propone un
  // default sensato para que el cliente no elija un sábado y reciba un error.
  const getDefaultDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1)
    }
    return d.toISOString().split('T')[0]
  }

  const [deliveryData, setDeliveryData] = useState({
    address: '',
    postal_code: '',
    city: 'CDMX',
    preferred_date: getDefaultDate(),
    notes: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('mercado_pago')
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date | null>(null)
  const [zonaEntrega, setZonaEntrega] = useState<any>(null)

  // Función para auto-validar código postal contra API de zonas
  const autoValidatePostalCode = async (cp: string) => {
    if (!cp || cp.length !== 5) return null
    
    try {
      // Usar el endpoint que devuelve la zona completa, no solo validar
      const response = await fetch(`${API_URL}/api/zonas-entrega/${cp}`)
      if (response.ok) {
        const zona = await response.json()
        // El endpoint devuelve directamente el objeto zona
        if (zona && zona.codigo_postal) {
          return zona
        }
      }
    } catch (error) {
      console.error('Error validando CP automáticamente:', error)
    }
    return null
  }

  // Función para calcular la próxima fecha de entrega disponible
  const getNextDeliveryDate = (zona: any): Date | null => {
    if (!zona) return null
    
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    const today = new Date()
    const tiempoMinimo = zona.tiempo_minimo_dias || 2
    
    // Empezar desde el tiempo mínimo
    for (let i = tiempoMinimo; i < tiempoMinimo + 14; i++) {
      const fecha = new Date(today)
      fecha.setDate(today.getDate() + i)
      const diaSemana = diasSemana[fecha.getDay()]
      
      // Verificar si ese día tiene entrega
      if (zona[diaSemana]) {
        return fecha
      }
    }
    return null
  }

  // Cargar datos del usuario desde el backend
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user?.email) {
        try {
          const BACKEND_URL = API_URL
          const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(session as any).accessToken}`
            },
          })

          if (response.ok) {
            const userData = await response.json()
            
            // Cargar datos personales
            setCustomerData({
              nombre: userData.nombre || session.user.name?.split(' ')[0] || '',
              apellido: userData.apellidos || session.user.name?.split(' ').slice(1).join(' ') || '',
              email: userData.email || session.user.email || '',
              telefono: userData.telefono || '',
              codigo_pais: userData.codigo_pais || '+52',
              rfc: '',
            })

            // Cargar dirección principal si existe
            if (userData.direccion_principal) {
              // Intentar extraer código postal de la dirección (5 dígitos)
              const cpMatch = userData.direccion_principal.match(/\b(\d{5})\b/)
              const extractedCP = cpMatch ? cpMatch[1] : ''
              
              setDeliveryData(prev => ({
                ...prev,
                address: userData.direccion_principal,
                postal_code: extractedCP,
                notes: userData.preferencias_entrega?.notas || '',
              }))

              // AUTO-VALIDAR: Si hay CP, validar automáticamente contra API de zonas
              if (extractedCP) {
                console.log('🔍 Auto-validando CP:', extractedCP)
                const zona = await autoValidatePostalCode(extractedCP)
                
                if (zona) {
                  console.log('✅ Zona encontrada automáticamente:', zona)
                  setZonaEntrega(zona)
                  
                  // Pre-seleccionar la próxima fecha de entrega disponible
                  const nextDate = getNextDeliveryDate(zona)
                  if (nextDate) {
                    console.log('📅 Fecha de entrega pre-seleccionada:', nextDate)
                    setSelectedDeliveryDate(nextDate)
                    setDeliveryData(prev => ({
                      ...prev,
                      preferred_date: nextDate.toISOString().split('T')[0]
                    }))
                  }
                } else {
                  // CP no tiene cobertura - forzar edición
                  console.log('⚠️ CP sin cobertura, forzando edición')
                  setEditingAddress(true)
                }
              } else {
                // No hay CP en la dirección - forzar edición
                console.log('⚠️ Dirección sin CP, forzando edición')
                setEditingAddress(true)
              }
            }

            console.log('✅ Datos del usuario cargados:', userData)
          } else {
            // Si falla, usar datos de sesión básicos
            setCustomerData({
              nombre: session.user.name?.split(' ')[0] || '',
              apellido: session.user.name?.split(' ').slice(1).join(' ') || '',
              email: session.user.email || '',
              telefono: '',
              codigo_pais: '+52',
              rfc: '',
            })
          }
        } catch (error) {
          console.error('Error cargando datos del usuario:', error)
          // Usar datos básicos de sesión
          setCustomerData({
            nombre: session.user.name?.split(' ')[0] || '',
            apellido: session.user.name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email || '',
            telefono: '',
            codigo_pais: '+52',
            rfc: '',
          })
        }
      }
      setLoadingUserData(false)
    }

    loadUserData()
  }, [session])

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const subtotalProductos = cartItems
    .filter(item => item.tipo !== 'experiencia')
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  // Productos de prueba (contienen "test" en nombre o descripción, o son Acedera) - no generan costo de envío
  const subtotalProductosParaEnvio = cartItems
    .filter(item => {
      if (item.tipo === 'experiencia') return false
      const nombre = item.name?.toLowerCase() || ''
      const descripcion = (item.description || item.descripcion || '')?.toLowerCase()
      const esProductoTest = nombre.includes('test') || descripcion.includes('test') || nombre.includes('acedera')
      return !esProductoTest
    })
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  // Si es recoger en almacén, envío es siempre 0
  const shipping = tipoEntrega === 'recoger_almacen' ? 0 : 
    ((subtotalProductosParaEnvio > 0 && subtotalProductosParaEnvio < 1000) ? 100 : 0)
  const total = subtotal + shipping

  const validatePostalCode = (cp: string) => {
    const cpNum = parseInt(cp)
    return cpNum >= 1000 && cpNum <= 16999
  }

  const handleSubmitOrder = async () => {
    const email = session?.user?.email || customerData.email
    if (!email) {
      alert('Por favor proporciona un email válido')
      return
    }

    if (!customerData.nombre || !customerData.apellido || !customerData.telefono) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    if (!deliveryData.address) {
      alert('Por favor completa la dirección de entrega')
      return
    }

    if (!zonaEntrega) {
      alert('El código postal no tiene cobertura de entrega. Por favor verifica tu código postal.')
      return
    }

    if (!selectedDeliveryDate) {
      alert('Por favor selecciona una fecha de entrega')
      return
    }

    setLoading(true)
    
    try {
      console.log('🔄 Sincronizando y validando carrito con backend...')
      
      // Usa proxy local que inyecta JWT desde la sesion
      const syncResponse = await fetch(`/api/cart/sync-and-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          items: cartItems
        })
      })
      
      if (!syncResponse.ok) {
        const error = await syncResponse.json()
        alert(`❌ Error: ${error.detail || 'No se pudo validar el carrito'}`)
        setLoading(false)
        return
      }
      
      const syncResult = await syncResponse.json()
      const { validated_items, total: validatedTotal, _guest_token } = syncResult
      console.log('✅ Items validados:', validated_items)

      // NO agregar envío aquí - el backend lo agrega como item separado
      // basándose en costo_envio para evitar duplicación
      const paymentData: any = {
        items: validated_items,
        email: email,
        nombre: customerData.nombre,
        apellido: customerData.apellido,
        telefono: customerData.telefono,
        codigo_pais: customerData.codigo_pais,
        delivery_address: tipoEntrega === 'recoger_almacen' ? 'RECOGER EN ALMACÉN - Calle Gobernador Antonio Díez de Bonilla #37, San Miguel Chapultepec, CDMX' : deliveryData.address,
        delivery_postal_code: tipoEntrega === 'recoger_almacen' ? '11850' : deliveryData.postal_code,
        delivery_notes: deliveryData.notes,
        tipo_entrega: tipoEntrega,
        costo_envio: costoEnvio,
        // Sin esta fecha el pedido no aparece en el corte del día ni en las
        // etiquetas: el selector ya existía en el formulario pero nunca se
        // enviaba al backend.
        fecha_entrega: deliveryData.preferred_date,
      }

      // Si fue guest checkout, pasar el token al siguiente paso para reusarlo
      if (_guest_token) {
        paymentData._guest_token = _guest_token
      }

      console.log('🚀 Enviando datos a MercadoPago:', paymentData)

      // Usa proxy local que inyecta JWT desde la sesion
      const response = await fetch(`/api/crear-preferencia-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()
      console.log('✅ Respuesta de MercadoPago:', result)

      if (result.init_point || result.payment_url) {
        localStorage.setItem('pendingOrder', JSON.stringify({
          customer: customerData,
          delivery: deliveryData,
          items: cartItems,
          total: total,
          preference_id: result.id,
          created_at: new Date().toISOString()
        }))

        const paymentUrl = result.payment_url || result.init_point
        console.log('🔗 Redirigiendo a:', paymentUrl)
        window.location.href = paymentUrl
      } else {
        throw new Error(result.detail || 'Error creando preferencia de pago')
      }
    } catch (error) {
      console.error('❌ Error:', error)
      alert('Error procesando la orden. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingUserData) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#B15543] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus datos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#33503E] mb-2">Finalizar Compra</h2>
        <p className="text-sm text-gray-600">
          {session?.user?.email ? 'Verifica tus datos y confirma tu pedido' : 'Completa tus datos para continuar'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Información Personal */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#B15543]" />
            <h3 className="text-lg font-semibold">Información Personal</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <Input
                value={customerData.nombre}
                onChange={(e) => setCustomerData({...customerData, nombre: e.target.value})}
                placeholder="Tu nombre"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <Input
                value={customerData.apellido}
                onChange={(e) => setCustomerData({...customerData, apellido: e.target.value})}
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de país *
              </label>
              <CountryCodeSelector
                value={customerData.codigo_pais}
                onChange={(dialCode) => setCustomerData({...customerData, codigo_pais: dialCode})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <Input
                value={customerData.telefono}
                onChange={(e) => setCustomerData({...customerData, telefono: e.target.value.replace(/\D/g, '')})}
                placeholder="1234567890"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="mt-4">
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

          <div className="mt-4">
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
        </div>

        {/* Dirección de Entrega */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#B15543]" />
              <h3 className="text-lg font-semibold">Dirección de Entrega</h3>
            </div>
            {deliveryData.address && !editingAddress && (
              <button
                onClick={() => setEditingAddress(true)}
                className="flex items-center gap-1 text-sm text-[#B15543] hover:text-[#9a4a3a]"
              >
                <Edit2 className="w-4 h-4" />
                Cambiar
              </button>
            )}
          </div>

          {(!deliveryData.address || editingAddress) ? (
            <>
              <div className="mb-4">
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

              {/* Selector de Código Postal ÉPICO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona de entrega *
                </label>
                <PostalCodeSelector
                  value={deliveryData.postal_code}
                  onChange={(cp, zona) => {
                    setDeliveryData({...deliveryData, postal_code: cp})
                    setZonaEntrega(zona)
                    // Limpiar fecha si cambia la zona
                    if (!zona) {
                      setSelectedDeliveryDate(null)
                    }
                  }}
                />
              </div>

              {/* Selector de fecha de entrega - Solo si hay zona seleccionada */}
              {zonaEntrega && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-green-700" />
                    <label className="text-sm font-medium text-gray-700">
                      Selecciona tu día de entrega
                    </label>
                  </div>
                  <DeliveryDatePicker
                    codigoPostal={deliveryData.postal_code}
                    selectedDate={selectedDeliveryDate}
                    onDateSelect={(date, zona) => {
                      setSelectedDeliveryDate(date)
                      if (date) {
                        setDeliveryData({...deliveryData, preferred_date: date.toISOString().split('T')[0]})
                      }
                    }}
                  />
                </div>
              )}

              <div className="mt-4">
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

              {editingAddress && (
                <button
                  onClick={() => setEditingAddress(false)}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Guardar cambios
                </button>
              )}
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">{deliveryData.address}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                {deliveryData.postal_code && (
                  <p><span className="font-medium">CP:</span> {deliveryData.postal_code}</p>
                )}
                {deliveryData.preferred_date && (
                  <p><span className="font-medium">Entrega:</span> {new Date(deliveryData.preferred_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</p>
                )}
              </div>
              {deliveryData.notes && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Notas:</span> {deliveryData.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Método de Pago */}
        <div className="pb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-[#B15543]" />
            <h3 className="text-lg font-semibold">Método de Pago</h3>
          </div>

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
                <span className="text-green-600 font-medium">
                  {shipping === 0 ? '¡Felicidades! Tu envío es GRATIS' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de pago */}
        <Button
          onClick={handleSubmitOrder}
          disabled={loading || !customerData.nombre || !customerData.apellido || !customerData.telefono || 
                   !deliveryData.address || !zonaEntrega || !selectedDeliveryDate}
          className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white text-lg py-6"
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
  )
}
