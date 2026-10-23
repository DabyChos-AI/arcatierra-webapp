'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import PostalCodeSelector from '@/components/ui/PostalCodeSelector'
import { MapPin, CreditCard, User, Phone, Mail, Edit2, Calendar, Leaf, Package } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import type { PrimeraEntregaRespuesta } from '@/types/cuenta'
import { TEXTO_METODO_PAGO_CORTO } from '@/types/tienda'
import { aviso } from '@/components/ui/Avisos'

interface SubscriptionPlan {
  id: string
  itemcode?: string
  codigo: string
  name: string
  description: string
  price: number
  weight: string
  ideal: string
  tipo: string
  categoria: string
  emoji: string
  features: string[]
  precioKg: number
  popular: boolean
  contenidoDetallado?: string[]
  opciones?: {
    carne?: {
      requerida: boolean
      opciones: string[]
    }
  }
}

type EstadoPrimeraEntrega = { fase: 'cargando' } | { fase: 'listo'; fecha: string } | { fase: 'error' }

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/

interface SubscriptionCheckoutFormProps {
  selectedPlans: SubscriptionPlan[]
  selectedFrequency: string
  frequencyName: string
  carneSelections: { [key: string]: string }
  onSubscribe: (formData: any, zonaEntrega: any) => Promise<void>
  isSubscribing: boolean
}

export default function SubscriptionCheckoutForm({
  selectedPlans,
  selectedFrequency,
  frequencyName,
  carneSelections,
  onSubscribe,
  isSubscribing
}: SubscriptionCheckoutFormProps) {
  const { data: session } = useSession()
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [editingAddress, setEditingAddress] = useState(false)
  
  const [customerData, setCustomerData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    codigo_pais: '+52',
  })

  const [deliveryData, setDeliveryData] = useState({
    address: '',
    postal_code: '',
    alcaldia: '',
    referencias: '',
    diaPreferido: '',
    alergias: '',
  })

  const [zonaEntrega, setZonaEntrega] = useState<any>(null)

  // SUBF1 (R11b, DR41): la fecha REAL de la primera canasta, la que calcula el backend con la misma regla con la que la
  // programa (`GET /api/subscriptions/primera-entrega`, público). Antes había un calendario que nunca se mandaba.
  const [primeraEntrega, setPrimeraEntrega] = useState<EstadoPrimeraEntrega>({ fase: 'cargando' })
  const pedidoPrimeraRef = useRef(0)

  const finalPrice = selectedPlans.reduce((total, plan) => total + plan.price, 0)

  // Función para auto-validar código postal contra API de zonas
  const autoValidatePostalCode = async (cp: string) => {
    if (!cp || cp.length !== 5) return null
    
    try {
      const response = await fetch(`${API_URL}/api/zonas-entrega/${cp}`)
      if (response.ok) {
        const zona = await response.json()
        if (zona && zona.codigo_postal) {
          return zona
        }
      }
    } catch (error) {
      console.error('Error validando CP automáticamente:', error)
    }
    return null
  }

  // SUBF1: se relee al cambiar el día preferido; una respuesta vieja no pisa a la nueva.
  const cargarPrimeraEntrega = useCallback(async (diaPreferido: string) => {
    const pedido = ++pedidoPrimeraRef.current
    setPrimeraEntrega({ fase: 'cargando' })
    try {
      const res = await fetch(
        `${API_URL}/api/subscriptions/primera-entrega?dia_preferido=${encodeURIComponent(diaPreferido)}`,
        { cache: 'no-store' }
      )
      const datos: unknown = res.ok ? await res.json().catch(() => null) : null
      if (pedido !== pedidoPrimeraRef.current) return
      const fecha = (datos as Partial<PrimeraEntregaRespuesta> | null)?.fecha
      setPrimeraEntrega(
        typeof fecha === 'string' && FECHA_ISO.test(fecha) ? { fase: 'listo', fecha } : { fase: 'error' }
      )
    } catch {
      if (pedido === pedidoPrimeraRef.current) setPrimeraEntrega({ fase: 'error' })
    }
  }, [])

  useEffect(() => {
    void cargarPrimeraEntrega(deliveryData.diaPreferido)
  }, [deliveryData.diaPreferido, cargarPrimeraEntrega])

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
            
            setCustomerData({
              nombre: userData.nombre || session.user.name || '',
              email: userData.email || session.user.email || '',
              telefono: userData.telefono || '',
              codigo_pais: userData.codigo_pais || '+52',
            })

            // Cargar dirección principal si existe
            if (userData.direccion_principal || userData.direccion_estructurada) {
              const direccion = userData.direccion_estructurada
              const cpMatch = userData.direccion_principal?.match(/\b(\d{5})\b/)
              const extractedCP = direccion?.codigo_postal || (cpMatch ? cpMatch[1] : '')
              
              setDeliveryData(prev => ({
                ...prev,
                address: direccion 
                  ? `${direccion.calle} ${direccion.numero_exterior}${direccion.numero_interior ? ` ${direccion.numero_interior}` : ''}, ${direccion.colonia}`
                  : userData.direccion_principal || '',
                postal_code: extractedCP,
                alcaldia: direccion?.alcaldia || '',
                referencias: direccion?.referencias || '',
                diaPreferido: direccion?.dia_preferido_entrega || '',
                alergias: direccion?.alergias_restricciones || '',
              }))

              // AUTO-VALIDAR: Si hay CP, validar automáticamente
              if (extractedCP) {
                // CONS1 (R11): la consola no lleva el CP, la zona ni la fecha de entrega
                console.log('🔍 Auto-validando CP')
                const zona = await autoValidatePostalCode(extractedCP)
                
                if (zona) {
                  console.log('✅ Zona encontrada automáticamente')
                  setZonaEntrega(zona)
                } else {
                  console.log('⚠️ CP sin cobertura, forzando edición')
                  setEditingAddress(true)
                }
              } else {
                console.log('⚠️ Dirección sin CP, forzando edición')
                setEditingAddress(true)
              }
            } else {
              setEditingAddress(true)
            }

            console.log('✅ Datos del usuario cargados:', userData)
          } else {
            setCustomerData({
              nombre: session.user.name || '',
              email: session.user.email || '',
              telefono: '',
              codigo_pais: '+52',
            })
            setEditingAddress(true)
          }
        } catch (error) {
          console.error('Error cargando datos del usuario:', error)
          setCustomerData({
            nombre: session.user.name || '',
            email: session.user.email || '',
            telefono: '',
            codigo_pais: '+52',
          })
          setEditingAddress(true)
        }
      } else {
        setEditingAddress(true)
      }
      setLoadingUserData(false)
    }

    loadUserData()
  }, [session])

  const handleSubmit = async () => {
    if (selectedPlans.length === 0) {
      aviso.error('Selecciona al menos una canasta para continuar')
      return
    }

    if (!customerData.nombre || !customerData.email || !customerData.telefono) {
      aviso.error('Por favor completa todos los campos de información personal')
      return
    }

    if (!deliveryData.address || !zonaEntrega) {
      aviso.error('Por favor selecciona una dirección con código postal válido')
      return
    }

    // Validar selecciones de carne para Canasta Básica Familiar
    const basicaFamiliarSelected = selectedPlans.some(p => p.id === 'basica-familiar')
    if (basicaFamiliarSelected && !carneSelections['basica-familiar']) {
      aviso.error('Debes seleccionar una opción de carne para la Canasta Básica Familiar')
      return
    }

    const formData = {
      nombre: customerData.nombre,
      email: customerData.email,
      telefono: `${customerData.codigo_pais}${customerData.telefono}`,
      direccion: deliveryData.address,
      alcaldia: zonaEntrega?.municipio || deliveryData.alcaldia,
      codigoPostal: deliveryData.postal_code,
      referencias: deliveryData.referencias,
      diaPreferido: deliveryData.diaPreferido,
      alergias: deliveryData.alergias,
    }

    await onSubscribe(formData, zonaEntrega)
  }

  if (loadingUserData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#33503E] mb-2">¡Completa tu Suscripción!</h2>
        <p className="text-sm text-gray-600">
          Abajo ves la fecha de tu primera canasta.
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
                Nombre completo *
              </label>
              <Input
                value={customerData.nombre}
                onChange={(e) => setCustomerData({...customerData, nombre: e.target.value})}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <div className="flex gap-2">
                <div className="w-28">
                  <CountryCodeSelector
                    value={customerData.codigo_pais}
                    onChange={(dialCode) => setCustomerData({...customerData, codigo_pais: dialCode})}
                  />
                </div>
                <Input
                  value={customerData.telefono}
                  onChange={(e) => setCustomerData({...customerData, telefono: e.target.value.replace(/\D/g, '')})}
                  placeholder="1234567890"
                  maxLength={10}
                  className="flex-1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico *
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
        </div>

        {/* Dirección de Entrega */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#B15543]" />
              <h3 className="text-lg font-semibold">Dirección de Entrega</h3>
            </div>
            {deliveryData.address && !editingAddress && zonaEntrega && (
              <button
                onClick={() => setEditingAddress(true)}
                className="flex items-center gap-1 text-sm text-[#B15543] hover:text-[#9a4a3a]"
              >
                <Edit2 className="w-4 h-4" />
                Cambiar
              </button>
            )}
          </div>

          {/* Aviso de cobertura */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">ℹ</span>
              </div>
              <p className="text-sm text-blue-800">
                <strong>Cobertura actual:</strong> Solo realizamos entregas en Ciudad de México (CDMX)
              </p>
            </div>
          </div>

          {(!deliveryData.address || editingAddress || !zonaEntrega) ? (
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

              {/* Selector de Código Postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona de entrega *
                </label>
                <PostalCodeSelector
                  value={deliveryData.postal_code}
                  onChange={(cp, zona) => {
                    setDeliveryData({...deliveryData, postal_code: cp, alcaldia: zona?.municipio || ''})
                    setZonaEntrega(zona)
                  }}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencias de entrega
                </label>
                <textarea
                  value={deliveryData.referencias}
                  onChange={(e) => setDeliveryData({...deliveryData, referencias: e.target.value})}
                  placeholder="Ej: Casa azul, portón negro, entre calles..."
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                  rows={2}
                />
              </div>

              {editingAddress && zonaEntrega && (
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
                {zonaEntrega?.municipio && (
                  <p><span className="font-medium">Alcaldía:</span> {zonaEntrega.municipio}</p>
                )}
              </div>
              {deliveryData.referencias && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Referencias:</span> {deliveryData.referencias}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Preferencias de Suscripción */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-[#B15543]" />
            <h3 className="text-lg font-semibold">Preferencias</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Día preferido de entrega
            </label>
            <select 
              value={deliveryData.diaPreferido}
              onChange={(e) => setDeliveryData({...deliveryData, diaPreferido: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
            >
              <option value="">Sin preferencia</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Se respetará según disponibilidad de tu zona
            </p>
          </div>

          {/* SUBF1: la fecha real de la primera canasta (sin calendario: la decide la regla del backend) */}
          <div
            className="mt-4 flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 p-3"
            data-testid="suscripcion-primera-entrega"
            data-estado={primeraEntrega.fase}
            data-fecha={primeraEntrega.fase === 'listo' ? primeraEntrega.fecha : undefined}
            aria-live="polite"
          >
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-green-700" aria-hidden="true" />
            <div className="min-w-0 text-sm text-green-800">
              {primeraEntrega.fase === 'cargando' && <p className="mb-0">Calculando la fecha de tu primera canasta…</p>}
              {primeraEntrega.fase === 'listo' && (
                <p className="mb-0">
                  Tu primera canasta llega el{' '}
                  <span className="font-semibold">
                    {formatFechaMexico(primeraEntrega.fecha, { weekday: 'long', day: 'numeric', month: 'long', year: undefined })}
                  </span>
                  .
                </p>
              )}
              {primeraEntrega.fase === 'error' && (
                <p className="mb-0">
                  No pudimos calcular la fecha de tu primera canasta en este momento.{' '}
                  <button
                    type="button"
                    onClick={() => void cargarPrimeraEntrega(deliveryData.diaPreferido)}
                    className="font-medium text-[#B15543] underline"
                  >
                    Intentar de nuevo
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alergias o restricciones alimentarias
            </label>
            <textarea 
              value={deliveryData.alergias}
              onChange={(e) => setDeliveryData({...deliveryData, alergias: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent resize-none"
              placeholder="Ej: alérgico a frutos secos, vegetariano, etc."
            />
          </div>
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
                checked={true}
                readOnly
                className="text-[#B15543]"
              />
              <div>
                <div className="font-medium">Mercado Pago</div>
                {/* La suscripción es un cobro recurrente (preapproval) de MercadoPago: sin OXXO ni transferencia (C6). */}
                <div className="text-sm text-gray-500">
                  {TEXTO_METODO_PAGO_CORTO}
                </div>
              </div>
            </label>
          </div>

          {/* Resumen de la orden */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-3">Resumen de Suscripción</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Canastas seleccionadas</span>
                <span>{selectedPlans.length} canasta{selectedPlans.length !== 1 ? 's' : ''}</span>
              </div>
              {selectedPlans.map((plan) => (
                <div key={plan.id} className="flex justify-between text-gray-600 pl-2">
                  <span>{plan.name}</span>
                  <span>${plan.price}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Frecuencia</span>
                <span>{frequencyName}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-green-600 font-medium">Incluido</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total por entrega</span>
                <span className="text-[#B15543]">${finalPrice.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de confirmación */}
        <Button
          onClick={handleSubmit}
          disabled={isSubscribing || !customerData.nombre || !customerData.telefono || 
                   !deliveryData.address || !zonaEntrega}
          className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white text-lg py-6"
        >
          {isSubscribing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Procesando...
            </div>
          ) : (
            `Confirmar Suscripción - $${finalPrice.toFixed(0)}`
          )}
        </Button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Al suscribirte aceptas nuestros términos y condiciones.
            Puedes cancelar en cualquier momento. 
            <br />
            🔒 Tus datos están protegidos y no se compartirán con terceros.
          </p>
        </div>
      </div>
    </div>
  )
}
