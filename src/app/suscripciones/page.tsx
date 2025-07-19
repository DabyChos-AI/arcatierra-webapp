'use client'

import { useState } from 'react'
// import { useSession } from 'next-auth/react' // Temporalmente desactivado
import { Calendar, Package, Leaf, Users, Star, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SUBSCRIPTION_PLANS = [
  // CANASTAS REGULARES
  {
    id: 'individual',
    codigo: 'INDIVIDUAL',
    name: 'Canasta Individual',
    description: 'Perfecta para personas solteras o parejas',
    price: 290,
    weight: '3.5 kg',
    ideal: '1-2 personas',
    tipo: 'regular',
    categoria: 'Canastas Regulares',
    emoji: '🥬',
    features: [
      'Perfecta para personas solteras o parejas',
      'Variedad balanceada de nutrientes',
      'Fácil de consumir en una semana',
      'Incluye fruta y verduras de temporada'
    ],
    precioKg: 82.86,
    popular: true
  },
  {
    id: 'media',
    codigo: 'MEDIA',
    name: 'Canasta Media',
    description: 'Equilibrio perfecto entre variedad y cantidad',
    price: 350,
    weight: '5 kg',
    ideal: '2-3 personas',
    tipo: 'regular',
    categoria: 'Canastas Regulares',
    emoji: '🌱',
    features: [
      'Equilibrio perfecto entre variedad y cantidad',
      'Incluye frutas y verduras de temporada',
      'Ideal para familias pequeñas',
      'Excelente relación calidad-precio'
    ],
    precioKg: 70.00,
    popular: true
  },
  {
    id: 'completa',
    codigo: 'COMPLETA',
    name: 'Canasta Completa',
    description: 'Variedad amplia con productos especiales',
    price: 510,
    weight: '7.5 kg',
    ideal: '3-4 personas',
    tipo: 'regular',
    categoria: 'Canastas Regulares',
    emoji: '🥕',
    features: [
      'Variedad amplia de productos',
      'Incluye fruta y verduras de temporada',
      'Perfecta para familias medianas',
      'Mayor diversidad nutricional'
    ],
    precioKg: 68.00,
    popular: false
  },
  // CANASTAS BÁSICAS (CON EXTRAS)
  {
    id: 'basica-individual',
    codigo: 'BASICA_INDIVIDUAL',
    name: 'Canasta Básica Individual',
    description: 'Con productos básicos esenciales y artesanales',
    price: 471,
    weight: '4.5 kg',
    ideal: '1-2 personas (productos básicos)',
    tipo: 'basica',
    categoria: 'Canastas Básicas',
    emoji: '🌿',
    features: [
      'Productos básicos esenciales',
      'Queso artesanal',
      'Tortillas de maíz nativo',
      'Huevos de gallinas de libre pastoreo',
      'Perfecto para cocinar en casa'
    ],
    contenidoDetallado: [
      '3.5 kg de frutas y verduras de temporada',
      '250 g de queso Oaxaca artesanal',
      '12 tortillas de maíz nativo',
      '12 huevos de gallinas de libre pastoreo en las chinampas',
      'Todo proveniente de productores locales'
    ],
    precioKg: 104.67,
    popular: false
  },
  {
    id: 'basica-media',
    codigo: 'BASICA_MEDIA',
    name: 'Canasta Básica Media',
    description: 'Combo completo para alimentación variada',
    price: 1023,
    weight: '8 kg',
    ideal: '2-4 personas (productos básicos)',
    tipo: 'basica',
    categoria: 'Canastas Básicas',
    emoji: '🥔',
    features: [
      'Combo completo para alimentación variada',
      'Incluye proteínas de origen regenerativo',
      'Queso artesanal',
      'Ideal para parejas o familias pequeñas',
      'Directamente del campo a tu mesa'
    ],
    contenidoDetallado: [
      '5 kg de frutas y verduras de temporada',
      '500 g de queso Oaxaca artesanal',
      '24 tortillas de maíz nativo',
      '18 huevos frescos de gallinas de libre pastoreo en las chinampas',
      '500 g de milanesas de pollo de origen regenerativo',
      '500 g de bistec de res de origen regenerativo'
    ],
    precioKg: 127.88,
    popular: false
  },
  {
    id: 'basica-familiar',
    codigo: 'BASICA_FAMILIAR',
    name: 'Canasta Básica Familiar',
    description: 'El combo más completo para familias',
    price: 1488,
    weight: '13 kg',
    ideal: '4-6 personas (productos básicos)',
    tipo: 'basica',
    categoria: 'Canastas Básicas',
    emoji: '🌽',
    features: [
      'El combo más completo para familias',
      'Doble variedad de quesos artesanales',
      'Proteínas de origen regenerativo',
      'Todo lo necesario para comidas balanceadas',
      'Apoya a productores locales',
      'Frescura del campo mexicano'
    ],
    contenidoDetallado: [
      '10 kg de frutas y verduras de temporada',
      '500 g de queso Oaxaca artesanal',
      '250 g de queso Manchego artesanal',
      '24 tortillas de maíz nativo',
      '18 huevos frescos de gallinas de libre pastoreo de las chinampas',
      '600 g de pechuga de pollo (con hueso)'
    ],
    opciones: {
      carne: {
        requerida: true,
        opciones: [
          '500 g de carne molida de res de origen regenerativo',
          '500 g de carne deshebrada de res de origen regenerativo'
        ]
      }
    },
    precioKg: 114.46,
    popular: false
  },
  // CANASTAS ESPECIALES
  {
    id: 'familiar',
    codigo: 'FAMILIAR',
    name: 'Canasta Familiar',
    description: 'La opción más popular para familias grandes',
    price: 670,
    weight: '10 kg',
    ideal: '4-6 personas',
    tipo: 'regular',
    categoria: 'Canastas Regulares',
    emoji: '🍅',
    features: [
      'La opción más popular para familias grandes',
      'Abundante variedad de alimentos agroecológicos',
      'Incluye fruta y verduras de temporada',
      'Máximo aprovechamiento familiar'
    ],
    precioKg: 67.00,
    popular: true
  },
  {
    id: 'retornable',
    codigo: 'RETORNABLE',
    name: 'Canasta Retornable',
    description: 'Opción ecológica con contenedor reutilizable',
    price: 310,
    weight: 'Variable',
    ideal: 'Consumo sustentable',
    tipo: 'especial',
    categoria: 'Eco-Friendly',
    emoji: '♻️',
    features: [
      'NO INCLUYE FRUTAS NI VERDURAS',
      'Sistema de economía circular',
      'Contenedor reutilizable',
      'Compromiso con el medio ambiente'
    ],
    precioKg: 0,
    popular: false
  }
]

const DELIVERY_FREQUENCIES = [
  { id: 'weekly', name: 'Semanal', description: 'Cada semana' },
  { id: 'biweekly', name: 'Quincenal', description: 'Cada 2 semanas' }
]

export default function SuscripcionesPage() {
  // const sessionResult = useSession() // Temporalmente desactivado
  // const { data: session } = sessionResult || { data: null }
  const session = null // Temporalmente sin autenticación
  const [selectedCanastas, setSelectedCanastas] = useState<string[]>([])
  const [selectedFrequency, setSelectedFrequency] = useState('weekly')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [carneSelections, setCarneSelections] = useState<Record<string, string>>({})

  const currentFrequency = DELIVERY_FREQUENCIES.find(freq => freq.id === selectedFrequency)
  const selectedPlans = SUBSCRIPTION_PLANS.filter(plan => selectedCanastas.includes(plan.id))
  
  const finalPrice = selectedPlans.reduce((total, plan) => total + plan.price, 0)

  const addToSubscription = (canastaId: string) => {
    if (selectedCanastas.includes(canastaId)) {
      setSelectedCanastas(prev => prev.filter(id => id !== canastaId))
    } else {
      setSelectedCanastas(prev => [...prev, canastaId])
    }
  }

  const handleSubscribe = async () => {
    if (selectedCanastas.length === 0) {
      alert('Selecciona al menos una canasta para continuar')
      return
    }

    // Validar selecciones de carne para Canasta Básica Familiar
    const basicaFamiliarSelected = selectedCanastas.includes('basica-familiar')
    if (basicaFamiliarSelected && !carneSelections['basica-familiar']) {
      alert('Debes seleccionar una opción de carne para la Canasta Básica Familiar')
      return
    }

    setIsSubscribing(true)
    
    try {
      // Aquí se enviaría la suscripción a la API
      const subscriptionData = {
        canasta_ids: selectedCanastas,
        frequency: selectedFrequency,
        price: finalPrice,
        user_email: 'usuario@temporal.com' // Email temporal mientras no hay autenticación
      }

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`¡Suscripción creada exitosamente! Recibirás ${selectedCanastas.length} canasta${selectedCanastas.length > 1 ? 's' : ''} según la frecuencia elegida.`)
      
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
            <h1 className="text-4xl font-bold mb-4 text-white">Canastas Agroecológicas de Temporada</h1>
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
                className={`relative bg-white rounded-lg shadow-lg p-8 transition-all duration-200 hover:shadow-xl ${
                  selectedCanastas.includes(plan.id) 
                    ? 'ring-2 ring-green-500' 
                    : ''
                } ${plan.popular ? 'border-2 border-[#B15543]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                    <span className="bg-[#B15543] text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      {plan.id === 'familiar' ? '⭐ Más Popular' : 'Popular'}
                    </span>
                    {plan.id === 'familiar' && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        💰 Más barata ${plan.precioKg}/kg
                      </span>
                    )}
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
                    <span className="text-gray-600">Ideal para:</span>
                    <span className="font-medium">{plan.ideal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Peso:</span>
                    <span className="font-medium">{plan.weight}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium">{plan.categoria}</span>
                  </div>
                  {plan.precioKg > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Precio/kg:</span>
                      <span className="font-medium text-green-600">${plan.precioKg.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Contenido Detallado para Canastas Básicas */}
                {(plan as any).contenidoDetallado && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-green-800 mb-3 flex items-center">
                      <Leaf className="w-4 h-4 mr-2" />
                      Contenido Detallado Incluido
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {(plan as any).contenidoDetallado.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Opciones de carne para Canasta Básica Familiar */}
                    {(plan as any).opciones?.carne && (
                      <div className="mt-4 pt-3 border-t border-green-200">
                        <h5 className="font-medium text-green-800 mb-2">Elige tu opción de carne:</h5>
                        <div className="space-y-2">
                          {(plan as any).opciones.carne.opciones.map((opcion: string, idx: number) => (
                            <label key={idx} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`carne-${plan.id}`}
                                value={opcion}
                                checked={carneSelections[plan.id] === opcion}
                                onChange={(e) => setCarneSelections(prev => ({...prev, [plan.id]: e.target.value}))}
                                className="text-green-600"
                              />
                              <span className="text-sm text-gray-700">{opcion}</span>
                            </label>
                          ))}
                        </div>
                        {selectedCanastas.includes(plan.id) && !carneSelections[plan.id] && (
                          <p className="text-red-600 text-xs mt-2">⚠️ Debes seleccionar una opción de carne</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center">
                  <Button
                    onClick={() => addToSubscription(plan.id)}
                    className={`w-full ${
                      selectedCanastas.includes(plan.id)
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-[#B15543] hover:bg-[#9a4a3a] text-white'
                    }`}
                  >
                    {selectedCanastas.includes(plan.id) ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Agregada a suscripción
                      </div>
                    ) : (
                      'Añadir a suscripción'
                    )}
                  </Button>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
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
                  <span className="text-gray-600">Canastas seleccionadas:</span>
                  <span className="font-medium">{selectedCanastas.length} canasta{selectedCanastas.length !== 1 ? 's' : ''}</span>
                </div>
                {selectedPlans.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detalle de canastas:</h4>
                    <ul className="space-y-1">
                      {selectedPlans.map((plan) => (
                        <li key={plan.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{plan.name}</span>
                          <span className="font-medium">${plan.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Frecuencia:</span>
                  <span className="font-medium">{currentFrequency?.name}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span className="text-[#33503E]">Total por entrega:</span>
                  <span className="text-[#B15543]">${finalPrice.toFixed(0)}</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">¿Cómo funciona?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Puedes pausar o cancelar en cualquier momento</li>
                  <li>• Cambios hasta 3 días hábiles antes de la entrega</li>
                  <li>• Notificación 24h antes de cada entrega</li>
                  <li>• Primer cargo al confirmar la suscripción</li>
                </ul>
              </div>
            </div>

            {/* Formulario de Suscripción */}
            <div className="flex flex-col justify-center">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#33503E] mb-2">
                  ¡Completa tu Suscripción!
                </h3>
                <p className="text-gray-600">
                  Tu primera canasta llegará la próxima semana
                </p>
              </div>

              {/* Formulario */}
              <form className="space-y-4 mb-6">
                {/* Información Personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input 
                      type="tel" 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
                      placeholder="(55) 1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Dirección de Entrega */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Dirección de Entrega</h4>
                  
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección completa *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
                      placeholder="Calle, número, colonia, alcaldía"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alcaldía *
                      </label>
                      <select 
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
                      >
                        <option value="">Selecciona tu alcaldía</option>
                        <option value="alvaro-obregon">Álvaro Obregón</option>
                        <option value="azcapotzalco">Azcapotzalco</option>
                        <option value="benito-juarez">Benito Juárez</option>
                        <option value="coyoacan">Coyoacán</option>
                        <option value="cuajimalpa">Cuajimalpa</option>
                        <option value="cuauhtemoc">Cuauhtémoc</option>
                        <option value="gustavo-a-madero">Gustavo A. Madero</option>
                        <option value="iztacalco">Iztacalco</option>
                        <option value="iztapalapa">Iztapalapa</option>
                        <option value="la-magdalena-contreras">La Magdalena Contreras</option>
                        <option value="miguel-hidalgo">Miguel Hidalgo</option>
                        <option value="milpa-alta">Milpa Alta</option>
                        <option value="tlahuac">Tláhuac</option>
                        <option value="tlalpan">Tlalpan</option>
                        <option value="venustiano-carranza">Venustiano Carranza</option>
                        <option value="xochimilco">Xochimilco</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal *
                      </label>
                      <input 
                        type="text" 
                        required
                        pattern="[0-9]{5}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
                        placeholder="Ej: 06700"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referencias de entrega
                    </label>
                    <textarea 
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
                      placeholder="Ej: Casa azul, portón negro, entre calles..."
                    />
                  </div>
                </div>

                {/* Preferencias */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Preferencias</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Día preferido de entrega
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent">
                      <option value="">Sin preferencia</option>
                      <option value="lunes">Lunes</option>
                      <option value="martes">Martes</option>
                      <option value="miercoles">Miércoles</option>
                      <option value="jueves">Jueves</option>
                      <option value="viernes">Viernes</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alergias o restricciones alimentarias
                    </label>
                    <textarea 
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B15543] focus:border-transparent"
                      placeholder="Ej: alérgico a frutos secos, vegetariano, etc."
                    />
                  </div>
                </div>
              </form>

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
                  `Confirmar Suscripción - $${finalPrice.toFixed(0)}`
                )}
              </Button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Al suscribirte aceptas nuestros términos y condiciones.
                  Puedes cancelar en cualquier momento. 
                  <br />
                  🔒 Tus datos están protegidos y no se compartirán con terceros.
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

