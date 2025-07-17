'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, Package, Leaf, Users, Star, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SUBSCRIPTION_PLANS = [
  {
    id: 'individual',
    name: 'Canasta Individual',
    description: 'Perfecta para 1-2 personas',
    price: 350,
    items: '8-10 productos',
    weight: '3-4 kg',
    features: [
      '5-6 verduras de temporada',
      '2-3 frutas frescas',
      '1 producto especial (hierbas, chiles, etc.)',
      'Recetas incluidas',
      'Origen de cada producto'
    ],
    popular: false
  },
  {
    id: 'familiar',
    name: 'Canasta Familiar',
    description: 'Ideal para familias de 3-4 personas',
    price: 550,
    items: '12-15 productos',
    weight: '5-6 kg',
    features: [
      '8-9 verduras de temporada',
      '3-4 frutas frescas',
      '2 productos especiales',
      'Recetas familiares incluidas',
      'Origen de cada producto',
      'Descuento en productos adicionales'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Canasta Premium',
    description: 'La experiencia completa para familias grandes',
    price: 750,
    items: '18-20 productos',
    weight: '7-8 kg',
    features: [
      '10-12 verduras de temporada',
      '4-5 frutas frescas',
      '3-4 productos especiales',
      'Productos exclusivos de temporada',
      'Recetas de chef incluidas',
      'Origen y historia de cada producto',
      'Acceso prioritario a experiencias',
      'Envío gratis'
    ],
    popular: false
  }
]

const DELIVERY_FREQUENCIES = [
  { id: 'weekly', name: 'Semanal', description: 'Cada semana', discount: 0 },
  { id: 'biweekly', name: 'Quincenal', description: 'Cada 2 semanas', discount: 5 },
  { id: 'monthly', name: 'Mensual', description: 'Una vez al mes', discount: 10 }
]

export default function SuscripcionesPage() {
  const sessionResult = useSession()
  const { data: session } = sessionResult || { data: null }
  const [selectedPlan, setSelectedPlan] = useState('familiar')
  const [selectedFrequency, setSelectedFrequency] = useState('weekly')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan)
  const currentFrequency = DELIVERY_FREQUENCIES.find(freq => freq.id === selectedFrequency)
  
  const finalPrice = currentPlan ? 
    currentPlan.price * (1 - (currentFrequency?.discount || 0) / 100) : 0

  const handleSubscribe = async () => {
    if (!session) {
      window.location.href = '/auth/signin?callbackUrl=/suscripciones'
      return
    }

    setIsSubscribing(true)
    
    try {
      // Aquí se enviaría la suscripción a la API
      const subscriptionData = {
        plan_id: selectedPlan,
        frequency: selectedFrequency,
        price: finalPrice,
        user_email: session.user?.email
      }

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('¡Suscripción creada exitosamente! Recibirás tu primera canasta la próxima semana.')
      
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Error creando la suscripción. Por favor intenta de nuevo.')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#33503E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-[#CCBB9A]" />
            <h1 className="text-4xl font-bold mb-4">Canastas de Temporada</h1>
            <p className="text-xl text-[#CCBB9A] max-w-2xl mx-auto">
              Recibe productos frescos y orgánicos directamente de nuestras chinampas cada semana
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <Leaf className="w-12 h-12 text-[#B15543] mx-auto mb-3" />
            <h3 className="font-semibold text-[#33503E] mb-2">100% Orgánico</h3>
            <p className="text-sm text-gray-600">Productos cultivados sin químicos ni pesticidas</p>
          </div>
          <div className="text-center">
            <Calendar className="w-12 h-12 text-[#B15543] mx-auto mb-3" />
            <h3 className="font-semibold text-[#33503E] mb-2">De Temporada</h3>
            <p className="text-sm text-gray-600">Productos frescos según la época del año</p>
          </div>
          <div className="text-center">
            <Users className="w-12 h-12 text-[#B15543] mx-auto mb-3" />
            <h3 className="font-semibold text-[#33503E] mb-2">Comercio Justo</h3>
            <p className="text-sm text-gray-600">Apoyas directamente a familias campesinas</p>
          </div>
          <div className="text-center">
            <Star className="w-12 h-12 text-[#B15543] mx-auto mb-3" />
            <h3 className="font-semibold text-[#33503E] mb-2">Calidad Premium</h3>
            <p className="text-sm text-gray-600">Selección cuidadosa de los mejores productos</p>
          </div>
        </div>

        {/* Planes de Suscripción */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-[#33503E] mb-8">
            Elige tu Canasta Ideal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-lg p-8 cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-[#B15543] transform scale-105' 
                    : 'hover:shadow-xl'
                } ${plan.popular ? 'border-2 border-[#B15543]' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#B15543] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-[#33503E] mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-[#B15543] mb-1">
                    ${plan.price}
                  </div>
                  <p className="text-sm text-gray-500">por entrega</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Productos:</span>
                    <span className="font-medium">{plan.items}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Peso aprox:</span>
                    <span className="font-medium">{plan.weight}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center">
                  {selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center gap-2 text-[#B15543] font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Seleccionado
                    </div>
                  ) : (
                    <span className="text-gray-500">Click para seleccionar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frecuencia de Entrega */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-[#33503E] mb-6 text-center">
            Frecuencia de Entrega
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DELIVERY_FREQUENCIES.map((frequency) => (
              <div
                key={frequency.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedFrequency === frequency.id
                    ? 'border-[#B15543] bg-[#B15543] bg-opacity-10'
                    : 'border-gray-200 hover:border-[#B15543]'
                }`}
                onClick={() => setSelectedFrequency(frequency.id)}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-[#33503E] mb-1">{frequency.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{frequency.description}</p>
                  {frequency.discount > 0 && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {frequency.discount}% descuento
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen y Suscripción */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumen */}
            <div>
              <h3 className="text-xl font-bold text-[#33503E] mb-4">Resumen de tu Suscripción</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan seleccionado:</span>
                  <span className="font-medium">{currentPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frecuencia:</span>
                  <span className="font-medium">{currentFrequency?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio base:</span>
                  <span className="font-medium">${currentPlan?.price}</span>
                </div>
                {currentFrequency && currentFrequency.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({currentFrequency.discount}%):</span>
                    <span>-${((currentPlan?.price || 0) * currentFrequency.discount / 100).toFixed(0)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span className="text-[#33503E]">Total por entrega:</span>
                  <span className="text-[#B15543]">${finalPrice.toFixed(0)}</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">¿Cómo funciona?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Puedes pausar o cancelar en cualquier momento</li>
                  <li>• Cambios hasta 3 días antes de la entrega</li>
                  <li>• Notificación 24h antes de cada entrega</li>
                  <li>• Primer cargo al confirmar la suscripción</li>
                </ul>
              </div>
            </div>

            {/* Botón de Suscripción */}
            <div className="flex flex-col justify-center">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#33503E] mb-2">
                  ¡Comienza tu Suscripción!
                </h3>
                <p className="text-gray-600">
                  Tu primera canasta llegará la próxima semana
                </p>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white py-4 text-lg font-semibold"
              >
                {isSubscribing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </div>
                ) : (
                  `Suscribirme por $${finalPrice.toFixed(0)}`
                )}
              </Button>

              {!session && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  Se te pedirá iniciar sesión para continuar
                </p>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Al suscribirte aceptas nuestros términos y condiciones.
                  Puedes cancelar en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonios */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-[#33503E] mb-8">
            Lo que dicen nuestros suscriptores
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "María González",
                plan: "Canasta Familiar",
                comment: "Los productos siempre llegan fresquísimos y las recetas incluidas son geniales. Mi familia está encantada.",
                rating: 5
              },
              {
                name: "Carlos Ruiz",
                plan: "Canasta Individual",
                comment: "Perfecto para mi estilo de vida. Productos de calidad y el servicio es excelente.",
                rating: 5
              },
              {
                name: "Ana Martínez",
                plan: "Canasta Premium",
                comment: "Vale cada peso. Los productos exclusivos y las recetas de chef han transformado mi cocina.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <div>
                  <p className="font-semibold text-[#33503E]">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

