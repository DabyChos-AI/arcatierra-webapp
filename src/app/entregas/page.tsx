'use client'

import { useState } from 'react'
import { MapPin, Clock, Truck, CheckCircle, XCircle, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DeliveryMap from '@/components/DeliveryMap'

export default function EntregasPage() {
  const [postalCode, setPostalCode] = useState('')
  const [address, setAddress] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateDelivery = async () => {
    if (!postalCode) return

    setIsValidating(true)
    try {
      const response = await fetch('/api/delivery/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postal_code: postalCode,
          address: address
        }),
      })

      const result = await response.json()
      setValidationResult(result)
    } catch (error) {
      console.error('Error validating delivery:', error)
      setValidationResult({
        valid: false,
        message: 'Error validando la dirección'
      })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#33503E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Truck className="w-16 h-16 mx-auto mb-4 text-[#CCBB9A]" />
            <h1 className="text-4xl font-bold mb-4">Entregas Sustentables</h1>
            <p className="text-xl text-[#CCBB9A] max-w-2xl mx-auto">
              Llevamos productos frescos y orgánicos directamente a tu hogar en Ciudad de México
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Validador de Código Postal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <Calculator className="w-12 h-12 text-[#B15543] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#33503E] mb-2">
              Verifica tu Zona de Entrega
            </h2>
            <p className="text-gray-600">
              Ingresa tu código postal para conocer disponibilidad y costos
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Postal
              </label>
              <Input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="01000"
                maxLength={5}
                className="text-center text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección (opcional)
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, colonia"
              />
            </div>

            <Button
              onClick={validateDelivery}
              disabled={!postalCode || isValidating}
              className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white"
            >
              {isValidating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Validando...
                </div>
              ) : (
                'Verificar Entrega'
              )}
            </Button>
          </div>

          {/* Resultado de Validación */}
          {validationResult && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className={`p-6 rounded-lg border-2 ${
                validationResult.valid 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {validationResult.valid ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <h3 className={`text-lg font-semibold ${
                    validationResult.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.valid ? '¡Entregamos en tu zona!' : 'Zona no disponible'}
                  </h3>
                </div>

                <p className={`mb-4 ${
                  validationResult.valid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {validationResult.message}
                </p>

                {validationResult.valid && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-gray-900">Costo de Envío</div>
                      <div className="text-[#B15543] font-bold">
                        {validationResult.delivery_cost === 0 ? 'Gratis' : `$${validationResult.delivery_cost}`}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-gray-900">Tiempo de Entrega</div>
                      <div className="text-[#B15543] font-bold">
                        {validationResult.delivery_time}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-gray-900">Zona</div>
                      <div className="text-[#B15543] font-bold capitalize">
                        {validationResult.zone}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mapa */}
              {validationResult.valid && address && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">Ubicación en el Mapa</h4>
                  <DeliveryMap 
                    address={address}
                    postalCode={postalCode}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información de Entregas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Zonas de Entrega */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-[#B15543]" />
              <h3 className="text-xl font-bold text-[#33503E]">Zonas de Entrega</h3>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-700">Zona Centro</h4>
                <p className="text-sm text-gray-600">Roma, Condesa, Centro, Doctores</p>
                <p className="text-sm font-medium text-green-600">Envío gratis • 24-48 horas</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-700">Zona Norte</h4>
                <p className="text-sm text-gray-600">Polanco, Lindavista, Gustavo A. Madero</p>
                <p className="text-sm font-medium text-blue-600">$50 • 48-72 horas</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-700">Zona Sur</h4>
                <p className="text-sm text-gray-600">Coyoacán, Del Valle, Narvarte</p>
                <p className="text-sm font-medium text-orange-600">$50 • 48-72 horas</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-purple-700">Zona Oriente/Poniente</h4>
                <p className="text-sm text-gray-600">Iztapalapa, Benito Juárez, Miguel Hidalgo</p>
                <p className="text-sm font-medium text-purple-600">$75 • 72-96 horas</p>
              </div>
            </div>
          </div>

          {/* Horarios y Políticas */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-[#B15543]" />
              <h3 className="text-xl font-bold text-[#33503E]">Horarios y Políticas</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Horarios de Entrega</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Lunes a Viernes: 9:00 AM - 6:00 PM</li>
                  <li>• Sábados: 9:00 AM - 2:00 PM</li>
                  <li>• Domingos: No hay entregas</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Políticas de Entrega</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Envío gratis en compras mayores a $500</li>
                  <li>• Productos frescos en empaques sustentables</li>
                  <li>• Notificación 1 hora antes de la entrega</li>
                  <li>• Reprogramación gratuita hasta 2 horas antes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Sustentabilidad</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Vehículos eléctricos e híbridos</li>
                  <li>• Empaques biodegradables</li>
                  <li>• Rutas optimizadas para reducir CO₂</li>
                  <li>• Programa de devolución de envases</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#33503E] text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">¿Listo para tu primera entrega?</h3>
          <p className="text-[#CCBB9A] mb-6">
            Descubre nuestros productos frescos y orgánicos
          </p>
          <Button
            onClick={() => window.location.href = '/tienda'}
            className="bg-[#B15543] hover:bg-[#9a4a3a] text-white px-8 py-3"
          >
            Ir a la Tienda
          </Button>
        </div>
      </div>
    </div>
  )
}

