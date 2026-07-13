'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Download, DollarSign, ShoppingCart, Users, Package, TrendingUp, RefreshCw, AlertTriangle, Repeat } from 'lucide-react'

interface Metricas {
  ventas_totales: number
  cambio_ventas_pct: number
  pedidos_total: number
  pedidos_semana: number
  pedidos_abandonados: number
  valor_abandonados: number
  pendientes_entrega: number
  valor_pendientes_entrega: number
  usuarios_activos: number
  usuarios_nuevos_hoy: number
  productos_total: number
  categorias_total: number
}

export default function ReportesPage() {
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetricas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reportes/metricas')
      const data = await res.json()
      if (data.success) {
        setMetricas(data.metricas)
      }
    } catch (err) {
      setError('Error cargando métricas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetricas()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            Reportes y Analytics
          </h1>
          <p className="text-gray-600 mt-1">Análisis detallado y reportes del negocio (datos reales)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchMetricas}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button 
            onClick={() => window.open('/api/admin/reportes/ventas/csv?dias=30', '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* Métricas de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(metricas?.ventas_totales || 0)}
              </p>
              <p className={`text-xs ${(metricas?.cambio_ventas_pct || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(metricas?.cambio_ventas_pct || 0) >= 0 ? '+' : ''}{metricas?.cambio_ventas_pct || 0}% vs mes anterior
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes Entrega</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatNumber(metricas?.pendientes_entrega || 0)}
              </p>
              <p className="text-xs text-yellow-600">
                {formatCurrency(metricas?.valor_pendientes_entrega || 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abandonados</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatNumber(metricas?.pedidos_abandonados || 0)}
              </p>
              <p className="text-xs text-red-600">
                {formatCurrency(metricas?.valor_abandonados || 0)} perdidos
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatNumber(metricas?.usuarios_activos || 0)}
              </p>
              <p className="text-xs text-purple-600">
                +{metricas?.usuarios_nuevos_hoy || 0} nuevos hoy
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : formatNumber(metricas?.productos_total || 0)}
              </p>
              <p className="text-xs text-orange-600">
                {metricas?.categorias_total || 0} categorías
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tipos de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reporte de Ventas</h3>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-gray-600 mb-4">Análisis completo de ventas, productos más vendidos y tendencias.</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.open('/api/admin/reportes/ventas/csv?dias=30', '_blank')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Descargar CSV (30 días)
            </button>
            <button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/reportes/ventas?dias=30')
                  const data = await res.json()
                  if (data.success) {
                    alert(`📊 REPORTE DE VENTAS (30 días)\n\n` +
                      `Total Pedidos: ${data.resumen.total_pedidos}\n` +
                      `Total Ventas: ${formatCurrency(data.resumen.total_ventas)}\n` +
                      `Ticket Promedio: ${formatCurrency(data.resumen.ticket_promedio)}\n` +
                      `Clientes Únicos: ${data.resumen.clientes_unicos}\n\n` +
                      `Top Productos:\n${data.productos_top.slice(0, 5).map((p: any) => `• ${p.nombre}: ${p.unidades} unidades`).join('\n') || 'Sin datos'}`)
                  }
                } catch (e) {
                  alert('Error cargando reporte')
                }
              }}
              className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              Ver Resumen
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reporte de Inventario</h3>
            <Package className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-gray-600 mb-4">Stock actual, productos con stock bajo y movimientos de inventario.</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.open('/api/admin/reportes/inventario/csv', '_blank')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Descargar CSV Completo
            </button>
            <button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/reportes/inventario')
                  const data = await res.json()
                  if (data.success) {
                    alert(`📦 REPORTE DE INVENTARIO\n\n` +
                      `Total Productos: ${data.resumen.total_productos}\n` +
                      `Con Stock: ${data.resumen.con_stock}\n` +
                      `Sin Stock: ${data.resumen.sin_stock}\n` +
                      `Stock Bajo (≤10): ${data.resumen.stock_bajo}\n` +
                      `Valor Inventario: ${formatCurrency(data.resumen.valor_inventario)}\n\n` +
                      `⚠️ Alertas Stock Bajo:\n${data.alertas_stock_bajo.slice(0, 5).map((p: any) => `• ${p.nombre}: ${p.stock} ${p.unidad}`).join('\n') || 'Sin alertas'}`)
                  }
                } catch (e) {
                  alert('Error cargando reporte')
                }
              }}
              className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              Ver Resumen
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reporte de Usuarios</h3>
            <Users className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-gray-600 mb-4">Actividad de usuarios, registros nuevos y comportamiento de compra.</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.open('/api/admin/reportes/usuarios/csv', '_blank')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Descargar CSV Completo
            </button>
            <button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/reportes/usuarios')
                  const data = await res.json()
                  if (data.success) {
                    alert(`👥 REPORTE DE USUARIOS\n\n` +
                      `Total Usuarios: ${data.resumen.total_usuarios}\n` +
                      `Activos: ${data.resumen.activos}\n` +
                      `Invitados: ${data.resumen.invitados}\n` +
                      `Nuevos (mes): ${data.resumen.nuevos_mes}\n` +
                      `Nuevos (semana): ${data.resumen.nuevos_semana}\n` +
                      `Nuevos (hoy): ${data.resumen.nuevos_hoy}\n\n` +
                      `🏆 Top Compradores:\n${data.top_compradores.slice(0, 5).map((u: any) => `• ${u.nombre}: ${u.pedidos} pedidos - ${formatCurrency(u.total_gastado)}`).join('\n') || 'Sin datos'}`)
                  }
                } catch (e) {
                  alert('Error cargando reporte')
                }
              }}
              className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              Ver Resumen
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reporte de Suscripciones</h3>
            <Repeat className="h-6 w-6 text-orange-500" />
          </div>
          <p className="text-gray-600 mb-4">Canastas recurrentes, estados de pago MP y entregas programadas.</p>
          <div className="space-y-2">
            <button
              onClick={() => window.open('/api/admin/reportes/suscripciones/csv', '_blank')}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Descargar CSV Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
