'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, Users, ShoppingCart, AlertTriangle,
  Package, Activity, Award, RefreshCw, Crown
} from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'

interface DashboardMetrics {
  resumen: {
    pedidos_hoy: number;
    ventas_hoy: number;
    checkins_hoy: number;
    alertas_criticas: number;
    total_usuarios: number;
    total_productos: number;
  };
  top_empleados: Array<{
    nombre: string;
    puntos_mes_actual: number;
    nivel: number;
    titulo_actual: string;
  }>;
  actividad_reciente: Array<{
    tipo: string;
    timestamp: string;
    usuario: string;
    descripcion: string;
  }>;
}

export default function AdminInicioTienda() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFundador, setIsFundador] = useState(false)
  const [carritosAbandonados, setCarritosAbandonados] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.email) {
      const fundadores = ['pablo@arcatierra.com', 'luh@arcatierra.com']
      const superAdmin = ['ing.davidabraham@gmail.com']
      // Super admin también ve vistas de fundadores
      setIsFundador(fundadores.includes(session.user.email) || superAdmin.includes(session.user.email))
    }
  }, [session])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard/metricas')

      if (!response.ok) {
        throw new Error('Error cargando métricas')
      }

      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const fetchCarritosAbandonados = async () => {
    try {
      const response = await fetch('/api/admin/carritos/abandonados?dias=7&limit=5')
      if (response.ok) {
        const data = await response.json()
        setCarritosAbandonados(data)
      }
    } catch (err) {
      console.error('Error cargando carritos abandonados:', err)
    }
  }

  useEffect(() => {
    fetchMetrics()
    fetchCarritosAbandonados()
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchMetrics()
      fetchCarritosAbandonados()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Cargando métricas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <button
              onClick={fetchMetrics}
              className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const kpiCards = [
    {
      title: 'Ventas Hoy',
      value: `$${metrics.resumen.ventas_hoy?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pedidos Hoy',
      value: metrics.resumen.pedidos_hoy || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Check-ins Hoy',
      value: metrics.resumen.checkins_hoy || 0,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Alertas Críticas',
      value: metrics.resumen.alertas_criticas || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Usuarios',
      value: metrics.resumen.total_usuarios || 0,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total Productos',
      value: metrics.resumen.total_productos || 0,
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header con mensaje especial para fundadores */}
      <div className="flex justify-between items-center">
        <div>
          {isFundador ? (
            <>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                  Dashboard Ejecutivo
                </h1>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-semibold">Fundador</span>
                </div>
              </div>
              <p className="text-gray-600 mt-1">Vista ejecutiva - Métricas clave del negocio</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600 mt-1">Gestión integral de operaciones Arcatierra</p>
            </>
          )}
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Widget Carritos Abandonados */}
        {carritosAbandonados && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="h-5 w-5 text-amber-600 mr-2" />
                Carritos Abandonados
              </h3>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total carritos:</span>
                <span className="text-2xl font-bold text-amber-600">
                  {carritosAbandonados.total_carritos}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor potencial:</span>
                <span className="text-xl font-bold text-green-600">
                  ${carritosAbandonados.valor_total_abandonado.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/admin/carritos-abandonados'}
              className="w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              Ver todos los detalles →
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Empleados - Filtrado para fundadores */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 text-yellow-500 mr-2" />
            {isFundador ? 'Ranking Empleados Competitivos' : 'Top Empleados del Mes'}
          </h3>
          <div className="space-y-3">
            {metrics.top_empleados.length > 0 ? (
              metrics.top_empleados
                .filter(emp => !emp.titulo_actual.includes('FUNDADOR'))
                .map((emp, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      #{index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{emp.nombre}</p>
                      <p className="text-sm text-gray-600">{emp.titulo_actual} • Nivel {emp.nivel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{emp.puntos_mes_actual}</p>
                    <p className="text-xs text-gray-500">puntos</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de empleados</p>
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 text-blue-500 mr-2" />
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {metrics.actividad_reciente.length > 0 ? (
              metrics.actividad_reciente.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.descripcion}</p>
                    <p className="text-sm text-gray-600">por {activity.usuario}</p>
                    <p className="text-xs text-gray-500">
                      {formatFechaHoraMexico(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>Última actualización: {formatFechaHoraMexico(new Date())}</p>
          <p>Panel Admin v1.0.0 • Datos en tiempo real</p>
        </div>
      </div>
    </div>
  )
}
