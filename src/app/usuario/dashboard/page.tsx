'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  User, TrendingUp, Heart, MapPin, ShoppingBag, 
  Leaf, Droplets, Recycle, Calendar, Plus,
  Edit3, Trash2, Home, Building2, AlertCircle, CreditCard
} from 'lucide-react'
import PostalCodeSelector from '@/components/ui/PostalCodeSelector'

interface ZonaEntrega {
  id: number
  codigo_postal: string
  colonia: string
  municipio: string
  lunes: boolean
  martes: boolean
  miercoles: boolean
  jueves: boolean
  viernes: boolean
  sabado: boolean
  domingo: boolean
  tiempo_minimo_dias: number
}

// Interfaces tipadas según auditoría
interface PedidoAbandonado {
  id: string
  numero_pedido: string
  fecha: string
  total: number
}

interface DashboardData {
  usuario: {
    id: string
    nombre: string
    email: string
  }
  estadisticas_personales: {
    total_pedidos: number
    dinero_invertido: number
    productos_unicos: number
    tiempo_cliente_dias?: number
    ultimo_pedido?: string
  }
  suscripciones: {
    total: number
    activas: number
    pausadas: number
  }
  pedidos_abandonados?: {
    total: number
    recientes: PedidoAbandonado[]
  }
  timestamp_consulta: string
}

interface ImpactoData {
  co2_ahorrado_kg: number
  agua_conservada_litros: number
  plastico_evitado_kg: number
  categorias_compradas: number
  timestamp_calculo: string
}

interface DireccionData {
  id: string
  nombre_direccion: string
  calle: string
  numero_exterior: string
  numero_interior?: string
  colonia: string
  alcaldia?: string
  codigo_postal: string
  ciudad: string
  estado: string
  referencias?: string
  dia_preferido_entrega?: string
  alergias_restricciones?: string
  es_principal: boolean
  activa: boolean
}

export default function DashboardPage() {
  // Patrón hooks verificado (usuario/perfil/page.tsx línea 24-30)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [impactoData, setImpactoData] = useState<ImpactoData | null>(null)
  const [direcciones, setDirecciones] = useState<DireccionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModalDireccion, setShowModalDireccion] = useState(false)
  const [editingDireccion, setEditingDireccion] = useState<DireccionData | null>(null)
  const [formDireccion, setFormDireccion] = useState({
    nombre_direccion: '',
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    alcaldia: '',
    codigo_postal: '',
    referencias: '',
    dia_preferido_entrega: '',
    alergias_restricciones: '',
    es_principal: false
  })
  const [zonaEntregaForm, setZonaEntregaForm] = useState<ZonaEntrega | null>(null)

  // Patrón auth check verificado (usuario/perfil/page.tsx línea 34-37)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      fetchDashboardData()
    }
  }, [session, status])

  // Patrón API calls verificado (15+ archivos usan este patrón)
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Llamadas paralelas a través de las rutas API locales (autenticadas por NextAuth)
      const [resumenRes, impactoRes, direccionesRes] = await Promise.all([
        fetch('/api/dashboard/resumen'),
        fetch('/api/dashboard/impacto'),
        fetch('/api/direcciones')
      ])

      // Verificar respuestas (patrón admin/productos/page.tsx línea 129-133)
      if (resumenRes.ok) {
        const resumenData = await resumenRes.json()
        setDashboardData(resumenData)
      }

      if (impactoRes.ok) {
        const impactoData = await impactoRes.json()
        setImpactoData(impactoData)
      }

      if (direccionesRes.ok) {
        const direccionesData = await direccionesRes.json()
        setDirecciones(direccionesData)
      } else {
        // Fallback: Si no hay direcciones, array vacío
        setDirecciones([])
      }

    } catch (err) {
      console.error('Error cargando dashboard:', err)
      setError('Error cargando datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarDireccion = async () => {
    try {
      const response = await fetch('/api/direcciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDireccion)
      })

      if (response.ok) {
        const newDireccion = await response.json()
        setDirecciones([...direcciones, newDireccion])
        setShowModalDireccion(false)
        setEditingDireccion(null)
        setFormDireccion({
          nombre_direccion: '',
          calle: '',
          numero_exterior: '',
          numero_interior: '',
          colonia: '',
          alcaldia: '',
          codigo_postal: '',
          referencias: '',
          dia_preferido_entrega: '',
          alergias_restricciones: '',
          es_principal: false
        })
      }
    } catch (error) {
      console.error('Error agregando dirección:', error)
    }
  }

  const handleEditarDireccion = (direccion: DireccionData) => {
    setEditingDireccion(direccion)
    setFormDireccion({
      nombre_direccion: direccion.nombre_direccion,
      calle: direccion.calle,
      numero_exterior: direccion.numero_exterior,
      numero_interior: direccion.numero_interior || '',
      colonia: direccion.colonia,
      alcaldia: direccion.alcaldia || '',
      codigo_postal: direccion.codigo_postal,
      referencias: direccion.referencias || '',
      dia_preferido_entrega: direccion.dia_preferido_entrega || '',
      alergias_restricciones: direccion.alergias_restricciones || '',
      es_principal: direccion.es_principal
    })
    setShowModalDireccion(true)
  }

  const handleGuardarEdicion = async () => {
    if (!editingDireccion) return

    try {
      const response = await fetch(`/api/direcciones/${editingDireccion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDireccion)
      })

      if (response.ok) {
        const updatedDireccion = await response.json()
        setDirecciones(direcciones.map(d => 
          d.id === editingDireccion.id ? updatedDireccion : d
        ))
        setShowModalDireccion(false)
        setEditingDireccion(null)
        setFormDireccion({
          nombre_direccion: '',
          calle: '',
          numero_exterior: '',
          numero_interior: '',
          colonia: '',
          alcaldia: '',
          codigo_postal: '',
          referencias: '',
          dia_preferido_entrega: '',
          alergias_restricciones: '',
          es_principal: false
        })
      }
    } catch (error) {
      console.error('Error editando dirección:', error)
    }
  }

  const handleEliminarDireccion = async (direccionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return

    try {
      const response = await fetch(`/api/direcciones/${direccionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDirecciones(direcciones.filter(d => d.id !== direccionId))
      }
    } catch (error) {
      console.error('Error eliminando dirección:', error)
    }
  }

  // Loading state (patrón verificado en múltiples archivos)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu dashboard personal...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-800 font-medium mb-2">Error cargando dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-8 w-8 text-green-600" />
                Mi Dashboard Personal
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, {dashboardData?.usuario?.nombre || session?.user?.name || 'Usuario'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Miembro desde</p>
              <p className="font-medium text-gray-900">
                {dashboardData?.estadisticas_personales?.tiempo_cliente_dias 
                  ? `${Math.floor(dashboardData.estadisticas_personales.tiempo_cliente_dias)} días`
                  : 'Nuevo usuario'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Estadísticas principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total pedidos */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {dashboardData?.estadisticas_personales?.total_pedidos || 0}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {dashboardData?.estadisticas_personales?.productos_unicos || 0} productos únicos
                </p>
              </div>

              {/* Dinero invertido */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Invertido</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      ${(dashboardData?.estadisticas_personales?.dinero_invertido || 0).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  En productos sustentables
                </p>
              </div>

              {/* Suscripciones */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suscripciones</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">
                      {dashboardData?.suscripciones?.activas || 0}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {dashboardData?.suscripciones?.total || 0} total, {dashboardData?.suscripciones?.pausadas || 0} pausadas
                </p>
              </div>

            </div>

            {/* Impacto ambiental */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Tu Impacto Ambiental
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CO2 */}
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Leaf className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {(impactoData?.co2_ahorrado_kg || 0).toFixed(1)} kg
                  </p>
                  <p className="text-sm text-gray-600">CO₂ evitado</p>
                </div>

                {/* Agua */}
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Droplets className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {(impactoData?.agua_conservada_litros || 0).toFixed(0)} L
                  </p>
                  <p className="text-sm text-gray-600">Agua conservada</p>
                </div>

                {/* Plástico */}
                <div className="text-center">
                  <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Recycle className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {(impactoData?.plastico_evitado_kg || 0).toFixed(2)} kg
                  </p>
                  <p className="text-sm text-gray-600">Plástico evitado</p>
                </div>

              </div>

              {impactoData?.categorias_compradas && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 text-center">
                    Has explorado <span className="font-semibold text-green-600">{impactoData.categorias_compradas}</span> categorías de productos sustentables
                  </p>
                </div>
              )}
            </div>

            {/* Pedidos abandonados sin pagar */}
            {dashboardData?.pedidos_abandonados && dashboardData.pedidos_abandonados.total > 0 && (
              <div className="bg-amber-50 rounded-xl shadow-sm p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Pedidos sin completar ({dashboardData.pedidos_abandonados.total})
                </h3>
                
                <p className="text-sm text-amber-700 mb-4">
                  Tienes pedidos que no fueron pagados. ¿Te gustaría completarlos?
                </p>

                <div className="space-y-3">
                  {dashboardData.pedidos_abandonados.recientes.map((pedido) => (
                    <div key={pedido.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                      <div>
                        <p className="font-medium text-gray-900">Pedido #{pedido.numero_pedido}</p>
                        <p className="text-xs text-gray-500">
                          {pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Sin fecha'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-700">${pedido.total.toFixed(2)}</p>
                        <button 
                          onClick={() => router.push(`/checkout?pedido=${pedido.id}`)}
                          className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 mt-1"
                        >
                          <CreditCard className="h-3 w-3" />
                          Completar pago
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {dashboardData.pedidos_abandonados.total > 5 && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <button className="text-amber-700 hover:text-amber-800 text-sm font-medium w-full text-center">
                      Ver todos los pedidos pendientes
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebar derecho */}
          <div className="space-y-6">
            
            {/* Direcciones */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Mis Direcciones
                </h3>
                <button 
                  onClick={() => setShowModalDireccion(true)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {direcciones.length > 0 ? (
                  direcciones.slice(0, 3).map((direccion) => (
                    <div key={direccion.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        {direccion.es_principal ? <Home className="h-4 w-4 text-blue-600" /> : <Building2 className="h-4 w-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm flex items-center gap-2">
                          {direccion.nombre_direccion}
                          {direccion.es_principal && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Principal</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {direccion.calle} {direccion.numero_exterior}, {direccion.colonia}
                        </p>
                        <p className="text-xs text-gray-500">
                          {direccion.ciudad}, {direccion.estado} {direccion.codigo_postal}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditarDireccion(direccion)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {!direccion.es_principal && (
                          <button 
                            onClick={() => handleEliminarDireccion(direccion.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm mb-2">No tienes direcciones guardadas</p>
                    <button 
                      onClick={() => setShowModalDireccion(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Agregar primera dirección
                    </button>
                  </div>
                )}
              </div>

              {direcciones.length > 3 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium w-full text-center">
                    Ver todas las direcciones ({direcciones.length})
                  </button>
                </div>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/tienda')}
                  className="w-full flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Explorar Tienda</span>
                </button>

                <button 
                  onClick={() => router.push('/usuario/favoritos')}
                  className="w-full flex items-center gap-3 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors text-left"
                >
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span className="font-medium text-pink-800">Mis Favoritos</span>
                </button>

                <button 
                  onClick={() => router.push('/experiencias')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Experiencias</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer del dashboard */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Datos actualizados el {dashboardData?.timestamp_consulta ? 
                new Date(dashboardData.timestamp_consulta).toLocaleString('es-MX') : 
                'hace un momento'
              }
            </p>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Actualizar datos
            </button>
          </div>
        </div>
      </div>

      {/* Modal Agregar Dirección */}
      {showModalDireccion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20 pb-4 px-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-4">
            {/* Header fijo del modal */}
            <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingDireccion ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
              </h3>
              <button 
                onClick={() => setShowModalDireccion(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => { 
                e.preventDefault(); 
                editingDireccion ? handleGuardarEdicion() : handleAgregarDireccion(); 
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la dirección *
                  </label>
                  <input 
                    type="text"
                    required
                    value={formDireccion.nombre_direccion}
                    onChange={(e) => setFormDireccion({...formDireccion, nombre_direccion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Casa, Oficina, Casa de mis padres"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calle *
                    </label>
                    <input 
                      type="text"
                      required
                      value={formDireccion.calle}
                      onChange={(e) => setFormDireccion({...formDireccion, calle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre de la calle"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número ext. *
                      </label>
                      <input 
                        type="text"
                        required
                        value={formDireccion.numero_exterior}
                        onChange={(e) => setFormDireccion({...formDireccion, numero_exterior: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número int.
                      </label>
                      <input 
                        type="text"
                        value={formDireccion.numero_interior}
                        onChange={(e) => setFormDireccion({...formDireccion, numero_interior: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="A"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona de entrega *
                  </label>
                  <PostalCodeSelector
                    value={formDireccion.codigo_postal}
                    onChange={(cp, zona) => {
                      setZonaEntregaForm(zona)
                      if (zona) {
                        setFormDireccion({
                          ...formDireccion, 
                          codigo_postal: cp,
                          colonia: zona.colonia,
                          alcaldia: zona.municipio,
                          dia_preferido_entrega: '' // Reset día cuando cambia zona
                        })
                      } else {
                        setFormDireccion({...formDireccion, codigo_postal: cp})
                      }
                    }}
                    onRecogerEnMatriz={() => {
                      setFormDireccion({
                        ...formDireccion,
                        calle: 'Calle Anatole France 307',
                        colonia: 'Polanco Reforma',
                        alcaldia: 'Miguel Hidalgo',
                        codigo_postal: '11550'
                      })
                    }}
                  />
                  {zonaEntregaForm && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      ✓ {zonaEntregaForm.colonia}, {zonaEntregaForm.municipio}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencias de entrega
                  </label>
                  <textarea 
                    rows={3}
                    value={formDireccion.referencias}
                    onChange={(e) => setFormDireccion({...formDireccion, referencias: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Casa azul, portón negro, entre calles..."
                  />
                </div>

                {/* Separador de Preferencias */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias</h3>
                </div>

                {zonaEntregaForm && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Día preferido de entrega
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'lunes', label: 'Lunes' },
                        { key: 'martes', label: 'Martes' },
                        { key: 'miercoles', label: 'Miércoles' },
                        { key: 'jueves', label: 'Jueves' },
                        { key: 'viernes', label: 'Viernes' },
                        { key: 'sabado', label: 'Sábado' },
                        { key: 'domingo', label: 'Domingo' },
                      ].map(({ key, label }) => {
                        const disponible = zonaEntregaForm[key as keyof ZonaEntrega] as boolean
                        const seleccionado = formDireccion.dia_preferido_entrega === key
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={!disponible}
                            onClick={() => setFormDireccion({...formDireccion, dia_preferido_entrega: key})}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              !disponible
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : seleccionado
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Solo se muestran los días disponibles para tu zona
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias o restricciones alimentarias
                  </label>
                  <textarea 
                    rows={3}
                    value={formDireccion.alergias_restricciones || ''}
                    onChange={(e) => setFormDireccion({...formDireccion, alergias_restricciones: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: alérgico a frutos secos, vegetariano, etc."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={formDireccion.es_principal}
                    onChange={(e) => setFormDireccion({...formDireccion, es_principal: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">
                    Establecer como dirección principal
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModalDireccion(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingDireccion ? 'Actualizar Dirección' : 'Guardar Dirección'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
