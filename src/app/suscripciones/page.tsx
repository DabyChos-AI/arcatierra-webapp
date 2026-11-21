'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar, Package, Leaf, Users, Star, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SubscriptionCheckoutForm from '@/components/SubscriptionCheckoutForm'
import { aviso } from '@/components/ui/Avisos'
import { precioLegible } from '@/lib/precio'
import { calcularCostoEnvio } from '@/lib/envio'
import { API_URL } from '@/lib/api'

type EstadoPrecios = { fase: 'cargando' } | { fase: 'listo'; precios: Record<string, number> } | { fase: 'error' }

/** `{ planes: [{ id, price }] }` de `GET /api/subscriptions/planes` → `{ id: precio }`; null si la forma no es esa. */
function preciosDePlanes(datos: unknown): Record<string, number> | null {
  const lista = (datos as { planes?: unknown } | null)?.planes
  if (!Array.isArray(lista)) return null
  const precios: Record<string, number> = {}
  for (const p of lista) {
    const fila = p as { id?: unknown; price?: unknown } | null
    const precio = typeof fila?.price === 'number' ? fila.price : typeof fila?.price === 'string' && fila.price.trim() ? Number(fila.price) : NaN
    if (typeof fila?.id === 'string' && Number.isFinite(precio) && precio >= 0) precios[fila.id] = precio
  }
  return precios
}

/** «4.5 kg» → 4.5; «Variable» → null (para el precio por kilo, que sale del precio real). */
function kilosDe(peso: string): number | null {
  const m = /^(\d+(?:\.\d+)?)\s*kg$/i.exec(peso.trim())
  return m ? Number(m[1]) : null
}

const SUBSCRIPTION_PLANS = [
  // CANASTAS REGULARES
  {
    id: 'individual',
    itemcode: '1885',
    codigo: 'INDIVIDUAL',
    name: 'Canasta Individual',
    description: 'Perfecta para personas solteras o parejas',
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
    popular: true
  },
  {
    id: 'media',
    itemcode: '1886',
    codigo: 'MEDIA',
    name: 'Canasta Media',
    description: 'Equilibrio perfecto entre variedad y cantidad',
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
    popular: true
  },
  {
    id: 'completa',
    itemcode: '1887',
    codigo: 'COMPLETA',
    name: 'Canasta Completa',
    description: 'Variedad amplia con productos especiales',
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
    popular: false
  },
  // CANASTAS BÁSICAS (CON EXTRAS)
  {
    id: 'basica-individual',
    itemcode: '1889',
    codigo: 'BASICA_INDIVIDUAL',
    name: 'Canasta Básica Individual',
    description: 'Con productos básicos esenciales y artesanales',
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
    popular: false
  },
  {
    id: 'basica-media',
    itemcode: '1890',
    codigo: 'BASICA_MEDIA',
    name: 'Canasta Básica Media',
    description: 'Combo completo para alimentación variada',
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
    popular: false
  },
  {
    id: 'basica-familiar',
    itemcode: '1891',
    codigo: 'BASICA_FAMILIAR',
    name: 'Canasta Básica Familiar',
    description: 'El combo más completo para familias',
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
    popular: false
  },
  // CANASTAS ESPECIALES
  {
    id: 'familiar',
    itemcode: '1888',
    codigo: 'FAMILIAR',
    name: 'Canasta Familiar',
    description: 'La opción más popular para familias grandes',
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
    popular: true
  },
  {
    id: 'retornable',
    codigo: 'RETORNABLE',
    name: 'Canasta Retornable',
    description: 'Opción ecológica con contenedor reutilizable',
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
    popular: false
  },
  // ─── Planes de prueba ─────────────────────────────────────────────────────
  // Visibles en público por decisión de David (2026-08-31). Cuestan $0 y no
  // cobran: `crear_suscripcion` detecta el importe cero, se salta MercadoPago y
  // deja la suscripción activa con su primera entrega programada.
  {
    id: 'test-01',
    codigo: 'QA-01',
    name: 'Test 01 — Canasta de prueba',
    description: 'Producto de prueba del sistema. No es un producto real y no se surte.',
    weight: '3.5 kg',
    ideal: 'Pruebas internas',
    tipo: 'prueba',
    categoria: 'Pruebas',
    emoji: '🧪',
    features: [
      'PRODUCTO DE PRUEBA — no es una canasta real',
      'Sin costo y sin cobro',
      'No genera costo de envío',
      'Sirve para validar el sistema de punta a punta'
    ],
    popular: false
  },
  {
    id: 'test-02',
    codigo: 'QA-02',
    name: 'Test 02 — Canasta básica de prueba',
    description: 'Producto de prueba del sistema. No es un producto real y no se surte.',
    weight: '7.5 kg',
    ideal: 'Pruebas internas',
    tipo: 'prueba',
    categoria: 'Pruebas',
    emoji: '🧪',
    features: [
      'PRODUCTO DE PRUEBA — no es una canasta real',
      'Sin costo y sin cobro',
      'No genera costo de envío',
      'Sirve para validar el sistema de punta a punta'
    ],
    popular: false
  }
]

const DELIVERY_FREQUENCIES = [
  { id: 'weekly', name: 'Semanal', description: 'Cada semana' },
  { id: 'biweekly', name: 'Quincenal', description: 'Cada 2 semanas' }
]

// Componente interno que maneja useSearchParams
function SuscripcionesContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Detectar si viene pre-carga desde tienda
  const canastaPreseleccionada = searchParams.get('canasta')
  const itemcodePreseleccionado = searchParams.get('itemcode')
  const esPrecarga = searchParams.get('precarga') === 'true'
  
  const [selectedCanastas, setSelectedCanastas] = useState<string[]>([])
  const [selectedFrequency, setSelectedFrequency] = useState('weekly')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [carneSelections, setCarneSelections] = useState<Record<string, string>>({})
  
  // SUBP0 §9.3 (S67): los precios salen de la API, de la MISMA consulta con la que cobra `crear_suscripcion`
  // (`GET /api/subscriptions/planes`, `routers/subscriptions.py:273-294`). Antes un `fetch('/api/products…')` relativo daba 404
  // y la página pintaba precios escritos en el código (Básica Familiar $1,488 contra $1,413.60 cobrados). Sin respaldo a otro
  // número: si no llegan, la canasta dice «Precio no disponible» y no se puede agregar.
  const [estadoPrecios, setEstadoPrecios] = useState<EstadoPrecios>({ fase: 'cargando' })
  const pedidoPreciosRef = useRef(0)
  const cargarPrecios = useCallback(async () => {
    const pedido = ++pedidoPreciosRef.current
    setEstadoPrecios({ fase: 'cargando' })
    try {
      const res = await fetch(`${API_URL}/api/subscriptions/planes`, { cache: 'no-store' })
      const datos: unknown = res.ok ? await res.json().catch(() => null) : null
      if (pedido !== pedidoPreciosRef.current) return
      const precios = preciosDePlanes(datos)
      setEstadoPrecios(precios ? { fase: 'listo', precios } : { fase: 'error' })
    } catch {
      if (pedido === pedidoPreciosRef.current) setEstadoPrecios({ fase: 'error' })
    }
  }, [])

  useEffect(() => {
    void cargarPrecios()
  }, [cargarPrecios])

  const plans = SUBSCRIPTION_PLANS.map((plan) => {
    const price =
      estadoPrecios.fase === 'listo' && Object.prototype.hasOwnProperty.call(estadoPrecios.precios, plan.id)
        ? estadoPrecios.precios[plan.id]
        : null
    const kg = kilosDe(plan.weight)
    return { ...plan, price, precioKg: price !== null && kg ? Math.round((price / kg) * 100) / 100 : 0 }
  })

  const currentFrequency = DELIVERY_FREQUENCIES.find(freq => freq.id === selectedFrequency)
  // Solo las que tienen precio de la API (una sin precio no se puede contratar).
  const selectedPlans = plans
    .filter((plan) => selectedCanastas.includes(plan.id))
    .flatMap((plan) => (plan.price !== null ? [{ ...plan, price: plan.price }] : []))

  // SUBP0 §9.1: lo que cobra MercadoPago = precio + `calcular_costo_envio(precio)` (`routers/subscriptions.py:137-141`).
  const finalPrice = selectedPlans.reduce((total, plan) => total + plan.price, 0)
  const envioTotal = selectedPlans.reduce((total, plan) => total + calcularCostoEnvio(plan.price), 0)
  const totalPorEntrega = Math.round((finalPrice + envioTotal) * 100) / 100

  // Helper: Obtener nombre de canasta desde ID
  const getNombreCanasta = (id: string) => {
    const plan = plans.find(p => p.id === id)
    return plan ? plan.name : 'Canasta'
  }

  // Pre-cargar canasta seleccionada desde tienda
  useEffect(() => {
    if (esPrecarga && canastaPreseleccionada) {
      setSelectedCanastas([canastaPreseleccionada])
      
      // Scroll automático al formulario de suscripción
      setTimeout(() => {
        const formulario = document.getElementById('planes-suscripcion')
        formulario?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)
    }
  }, [esPrecarga, canastaPreseleccionada])

  // SUBP0 §9.2 (versión mínima, S67): una sola canasta a la vez. El alta suscribe SOLO la primera (`onSubscribe` abajo) y el botón
  // sumaba todas las marcadas; elegir otra reemplaza a la anterior.
  const addToSubscription = (canastaId: string) => {
    setSelectedCanastas((prev) => (prev.includes(canastaId) ? [] : [canastaId]))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#33503E] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-[#CCBB9A]" />
            <h1 className="text-4xl font-bold mb-4 text-white">Canastas Agroecológicas de Temporada</h1>
            <p className="text-xl text-[#CCBB9A] max-w-2xl mx-auto">
              Recibe alimentos frescos y deliciosos directamente de nuestra red agrícola cada semana
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Banner de confirmación si viene pre-cargado */}
        {esPrecarga && canastaPreseleccionada && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  ✅ Canasta pre-seleccionada: {getNombreCanasta(canastaPreseleccionada)}
                </h3>
                <p className="text-green-700 mb-3">
                  Tu canasta ya está seleccionada. Completa los datos a continuación para finalizar tu suscripción y recibir alimentos frescos cada semana.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Star className="h-4 w-4" />
                  <span>Ahorra 5% vs compra única + envío automático</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <Leaf className="w-12 h-12 text-[#B15543] mx-auto mb-3" />
            <h3 className="font-semibold text-[#33503E] mb-2">100% Agroecológico</h3>
            <p className="text-sm text-gray-600">Alimentos cultivados sin químicos ni pesticidas</p>
          </div>
          <div className="text-center">
            <Calendar className="w-12 h-12 text-[#B15543] mx-auto mb-3" />
            <h3 className="font-semibold text-[#33503E] mb-2">De Temporada</h3>
            <p className="text-sm text-gray-600">Alimentos frescos según la época del año</p>
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
        <div id="planes-suscripcion" className="mb-12">
          <h2 className="text-3xl font-bold text-center text-[#33503E] mb-8">
            Elige tu Canasta Ideal
          </h2>

          {estadoPrecios.fase === 'error' && (
            <div
              data-testid="suscripcion-precios-error"
              role="alert"
              className="mx-auto mb-6 max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800"
            >
              No pudimos cargar el precio de las canastas. Sin el precio no puedes suscribirte todavía.{' '}
              <button type="button" onClick={() => void cargarPrecios()} className="font-medium text-[#B15543] underline">
                Intentar de nuevo
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:p-8">
            {plans.map((plan) => (
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
                    {plan.id === 'familiar' && plan.precioKg > 0 && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        💰 Más barata ${plan.precioKg}/kg
                      </span>
                    )}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-[#33503E] mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  {/* PNT1 (S67): con sus centavos (`precioLegible`), como la tienda. SUBP0 §9.1/§9.3: el precio de la API y el
                      envío que cobra MercadoPago, con el texto de la rama (`sitio-nuevo/tienda/AltaSuscripcion.tsx:375`). */}
                  <div
                    className="text-3xl font-bold text-[#B15543] mb-1"
                    data-testid={`suscripcion-plan-precio-${plan.id}`}
                    data-monto={plan.price ?? undefined}
                    data-estado={estadoPrecios.fase}
                  >
                    {plan.price !== null
                      ? precioLegible(plan.price)
                      : estadoPrecios.fase === 'cargando'
                        ? 'Cargando precio…'
                        : 'Precio no disponible'}
                  </div>
                  <p
                    className="text-sm text-gray-500"
                    data-testid={`suscripcion-plan-envio-${plan.id}`}
                    data-envio={plan.price !== null ? calcularCostoEnvio(plan.price) : undefined}
                  >
                    {plan.price === null
                      ? 'por entrega'
                      : calcularCostoEnvio(plan.price) > 0
                        ? `por entrega · + ${precioLegible(calcularCostoEnvio(plan.price))} de envío`
                        : 'por entrega · Envío gratis'}
                  </p>
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
                    disabled={plan.price === null}
                    data-testid={`suscripcion-plan-agregar-${plan.id}`}
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
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
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
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:p-8">
            {/* Resumen */}
            <div>
              <h3 className="text-xl font-bold text-[#33503E] mb-4">Resumen de tu Suscripción</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Canastas seleccionadas:</span>
                  <span className="font-medium">{selectedPlans.length} canasta{selectedPlans.length !== 1 ? 's' : ''}</span>
                </div>
                {selectedPlans.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detalle de canastas:</h4>
                    <ul className="space-y-1">
                      {selectedPlans.map((plan) => (
                        <li key={plan.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{plan.name}</span>
                          <span className="font-medium" data-testid={`suscripcion-detalle-precio-${plan.id}`} data-monto={plan.price}>
                            {precioLegible(plan.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Frecuencia:</span>
                  <span className="font-medium">{currentFrequency?.name}</span>
                </div>
                {selectedPlans.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium" data-testid="suscripcion-pagina-envio" data-monto={envioTotal}>
                      {envioTotal > 0 ? precioLegible(envioTotal) : 'Envío gratis'}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span className="text-[#33503E]">Total por entrega:</span>
                  <span className="text-[#B15543]" data-testid="suscripcion-pagina-total" data-monto={totalPorEntrega}>
                    {precioLegible(totalPorEntrega)}
                  </span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">¿Cómo funciona?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Puedes cancelar en cualquier momento</li>
                  <li>• Cambios hasta 3 días hábiles antes de la entrega</li>
                  <li>• Notificación 24h antes de cada entrega</li>
                  <li>• Primer cargo al confirmar la suscripción</li>
                </ul>
              </div>
            </div>

            {/* Formulario de Suscripción - Nuevo Componente Unificado */}
            <SubscriptionCheckoutForm
              selectedPlans={selectedPlans}
              selectedFrequency={selectedFrequency}
              frequencyName={currentFrequency?.name || 'Semanal'}
              carneSelections={carneSelections}
              onSubscribe={async (formData, zonaEntrega) => {
                // Crear suscripción para la primera canasta seleccionada
                const canastaId = selectedCanastas[0]
                const plan = plans.find(p => p.id === canastaId)
                if (!plan) {
                  throw new Error('Plan no encontrado')
                }

                setIsSubscribing(true)
                
                try {
                  const subscriptionData = {
                    plan_id: canastaId,
                    frequency: selectedFrequency,
                    email: formData.email,
                    nombre: formData.nombre,
                    telefono: formData.telefono,
                    direccion: formData.direccion,
                    alcaldia: formData.alcaldia,
                    codigo_postal: formData.codigoPostal,
                    referencias: formData.referencias || null,
                    dia_preferido: formData.diaPreferido || null,
                    alergias: formData.alergias || null,
                    opcion_carne: carneSelections[canastaId] || null
                  }

                  const response = await fetch('/api/subscriptions/crear', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(subscriptionData)
                  })

                  const result = await response.json()

                  if (!response.ok || !result.success) {
                    throw new Error(result.error || result.detail || 'Error creando suscripción')
                  }

                  // Suscripción sin costo: el backend no llamó a MercadoPago
                  // (no autoriza un preapproval de $0). Ya quedó activa y con
                  // su primera entrega programada, así que no hay nada que pagar.
                  if (!result.init_point && result.subscription_id) {
                    localStorage.setItem('pendingSubscription', JSON.stringify({
                      subscription_id: result.subscription_id,
                      plan_name: plan.name,
                      frequency: selectedFrequency,
                      email: formData.email,
                      sin_costo: true
                    }))
                    window.location.href = '/suscripciones/confirmacion?sin_costo=1'
                    return
                  }

                  // Redirigir al checkout de MercadoPago
                  if (result.init_point) {
                    localStorage.setItem('pendingSubscription', JSON.stringify({
                      subscription_id: result.subscription_id,
                      mp_preapproval_id: result.mp_preapproval_id,
                      plan_name: plan.name,
                      frequency: selectedFrequency,
                      email: formData.email
                    }))

                    window.location.href = result.init_point
                    return
                  }

                  aviso.error('Error: No se recibió URL de pago')
                  
                } catch (error) {
                  console.error('Error creating subscription:', error)
                  aviso.error(`Error creando la suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`)
                } finally {
                  setIsSubscribing(false)
                }
              }}
              isSubscribing={isSubscribing}
            />
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
                name: "Ximena Hernández",
                plan: "Canasta Media",
                comment: "Muy buen servicio y todo delicioso",
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

// Componente principal con Suspense
export default function SuscripcionesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-[#33503E] animate-pulse" />
          <p className="text-[#33503E] font-medium">Cargando suscripciones...</p>
        </div>
      </div>
    }>
      <SuscripcionesContent />
    </Suspense>
  )
}

