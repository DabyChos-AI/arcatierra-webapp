'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingCart, Mail, Clock, DollarSign, User, Package, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CarritoAbandonado {
  usuario_id: string
  email: string
  nombre: string
  es_invitado: boolean
  total_items: number
  total_monto: number
  ultimo_checkout: string
  horas_desde_abandono: number
  estado_alerta: string
}

interface EstadisticasCarritos {
  periodo_dias: number
  total_abandonados: number
  total_completados: number
  valor_total_abandonado: number
  tasa_conversion: number
  promedio_horas_abandono: number
}

export default function CarritosAbandonadosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [carritos, setCarritos] = useState<CarritoAbandonado[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasCarritos | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [diasFiltro, setDiasFiltro] = useState(7)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener carritos abandonados
      const carritosRes = await fetch(`/api/admin/carritos/abandonados?dias=${diasFiltro}&limit=50`)
      if (!carritosRes.ok) throw new Error('Error cargando carritos')
      const carritosData = await carritosRes.json()
      setCarritos(carritosData.carritos || [])

      // Obtener estadísticas
      const statsRes = await fetch(`/api/admin/carritos/estadisticas?dias=${diasFiltro}`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setEstadisticas(statsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, diasFiltro])

  const getAlertaColor = (estado: string) => {
    switch (estado) {
      case 'critico':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'urgente':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getAlertaText = (estado: string, horas: number) => {
    if (horas < 2) return '🔥 Recién abandonado'
    if (horas < 24) return '⚠️ Menos de 1 día'
    return `⏰ Hace ${Math.floor(horas / 24)} días`
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-lg">Cargando datos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
          <span className="text-red-800 font-semibold">Error: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="h-8 w-8 text-amber-600 mr-3" />
              Carritos Abandonados
            </h1>
            <p className="text-gray-600 mt-1">Recupera ventas perdidas</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={diasFiltro}
            onChange={(e) => setDiasFiltro(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value={1}>Últimas 24 horas</option>
            <option value={3}>Últimos 3 días</option>
            <option value={7}>Última semana</option>
            <option value={30}>Último mes</option>
          </select>
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Carritos Abandonados</p>
                <p className="text-2xl font-bold text-amber-600">{estadisticas.total_abandonados}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-amber-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Potencial</p>
                <p className="text-2xl font-bold text-green-600">
                  ${estadisticas.valor_total_abandonado.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Conversión</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.tasa_conversion.toFixed(1)}%</p>
              </div>
              <Package className="h-8 w-8 text-blue-300" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {estadisticas.promedio_horas_abandono < 24 
                    ? `${estadisticas.promedio_horas_abandono.toFixed(1)}h`
                    : `${(estadisticas.promedio_horas_abandono / 24).toFixed(1)}d`
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-300" />
            </div>
          </div>
        </div>
      )}

      {/* Lista de Carritos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carritos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No hay carritos abandonados en este periodo</p>
                  </td>
                </tr>
              ) : (
                carritos.map((carrito) => (
                  <tr key={carrito.usuario_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{carrito.nombre}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {carrito.email}
                          </div>
                          {carrito.es_invitado && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                              Guest
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{carrito.total_items} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">${carrito.total_monto.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAlertaColor(carrito.estado_alerta)}`}>
                        {getAlertaText(carrito.estado_alerta, carrito.horas_desde_abandono)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          // TODO: Implementar modal de detalle
                          alert(`Ver detalle de carrito: ${carrito.usuario_id}`)
                        }}
                        className="text-amber-600 hover:text-amber-900 font-medium"
                      >
                        Ver detalle →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sugerencias */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Estrategias de Recuperación</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Envía emails de recordatorio dentro de las primeras 2 horas</li>
          <li>• Ofrece descuentos del 10% para carritos mayores a $500</li>
          <li>• Contacta por WhatsApp a carritos VIP (&gt;$1,000)</li>
          <li>• Revisa si hay problemas técnicos recurrentes en el checkout</li>
        </ul>
      </div>
    </div>
  )
}
