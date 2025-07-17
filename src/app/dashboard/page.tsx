'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, Calendar, 
  DollarSign, Package, Leaf, Droplets, Recycle, Star,
  ArrowUpRight, ArrowDownRight, MoreVertical, Download,
  Bell, Settings, Search, Filter, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FormattedNumber } from '@/components/ui/formatted-number'

// Mock data para el dashboard
const monthlyRevenue = [
  { month: 'Ene', revenue: 18500, orders: 145, customers: 89 },
  { month: 'Feb', revenue: 22300, orders: 178, customers: 112 },
  { month: 'Mar', revenue: 25100, orders: 201, customers: 134 },
  { month: 'Abr', revenue: 28670, orders: 234, customers: 156 },
  { month: 'May', revenue: 31200, orders: 267, customers: 178 },
  { month: 'Jun', revenue: 28900, orders: 245, customers: 165 }
]

const productSales = [
  { name: 'Verduras Orgánicas', value: 35, color: '#33503E' },
  { name: 'Frutas Frescas', value: 25, color: '#B15543' },
  { name: 'Lácteos Artesanales', value: 20, color: '#DCB584' },
  { name: 'Productos de Despensa', value: 15, color: '#CCBB9A' },
  { name: 'Otros', value: 5, color: '#E3DBCB' }
]

const environmentalImpact = [
  { metric: 'CO₂ Ahorrado', value: 3.1, unit: 'toneladas', trend: 'up', percentage: 12 },
  { metric: 'Agua Conservada', value: 15.2, unit: 'mil litros', trend: 'up', percentage: 8 },
  { metric: 'Plástico Evitado', value: 245, unit: 'kg', trend: 'up', percentage: 15 },
  { metric: 'Familias Beneficiadas', value: 1920, unit: 'familias', trend: 'up', percentage: 22 }
]

const recentOrders = [
  { id: '#ORD-001', customer: 'María González', amount: 450, status: 'Entregado', time: '2 min' },
  { id: '#ORD-002', customer: 'Carlos Ruiz', amount: 320, status: 'En camino', time: '5 min' },
  { id: '#ORD-003', customer: 'Ana Martínez', amount: 680, status: 'Preparando', time: '8 min' },
  { id: '#ORD-004', customer: 'Luis Hernández', amount: 290, status: 'Confirmado', time: '12 min' },
  { id: '#ORD-005', customer: 'Sofia López', amount: 520, status: 'Entregado', time: '15 min' }
]

const topProducts = [
  { name: 'Espinacas Baby Orgánicas', sales: 234, revenue: 9360, trend: 'up' },
  { name: 'Jitomate Cherry', sales: 189, revenue: 8505, trend: 'up' },
  { name: 'Aguacate Hass', sales: 156, revenue: 10140, trend: 'down' },
  { name: 'Lechuga Romana', sales: 145, revenue: 5075, trend: 'up' },
  { name: 'Miel de Abeja', sales: 89, revenue: 10680, trend: 'up' }
]

const upcomingEvents = [
  { title: 'Taller de Huerto Urbano', date: '2025-07-05', participants: 12, revenue: 5400 },
  { title: 'Tour Chinampas', date: '2025-07-06', participants: 20, revenue: 13000 },
  { title: 'Cocina Sustentable', date: '2025-07-07', participants: 16, revenue: 13600 },
  { title: 'Mercado Orgánico', date: '2025-07-08', participants: 15, revenue: 5250 }
]

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Este mes')
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({})

  const toggleDetails = (section: string) => {
    setShowDetails(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregado': return 'bg-green-100 text-green-800'
      case 'En camino': return 'bg-blue-100 text-blue-800'
      case 'Preparando': return 'bg-yellow-100 text-yellow-800'
      case 'Confirmado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header del Dashboard */}
      <div className="bg-verde-dark text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Arca Tierra</h1>
              <p className="text-neutral-light">Panel de control y métricas de negocio</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 bg-white text-gray-900 w-64"
                />
              </div>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-verde-medium">
                <Bell className="w-5 h-5" />
              </Button>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-verde-medium">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-verde-medium text-white rounded-lg border border-verde-light focus:ring-2 focus:ring-white focus:border-transparent"
            >
              <option value="Hoy">Hoy</option>
              <option value="Esta semana">Esta semana</option>
              <option value="Este mes">Este mes</option>
              <option value="Este año">Este año</option>
            </select>
            
            <Button variant="ghost" size="sm" className="text-white hover:bg-verde-medium">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            
            <Button variant="ghost" size="sm" className="text-white hover:bg-verde-medium">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Ingresos mensuales */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-terracota-light rounded-lg">
                <DollarSign className="w-6 h-6 text-terracota-primary" />
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                <FormattedNumber value={28670} prefix="$" />
              </h3>
              <p className="text-sm text-gray-600">Ingresos del mes</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+12.5%</span>
              </div>
              <span className="text-sm text-gray-500">vs mes anterior</span>
            </div>
          </div>

          {/* Suscripciones activas */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-verde-light rounded-lg">
                <Users className="w-6 h-6 text-verde-dark" />
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                <FormattedNumber value={1920} />
              </h3>
              <p className="text-sm text-gray-600">Suscripciones activas</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+8.2%</span>
              </div>
              <span className="text-sm text-gray-500">nuevas este mes</span>
            </div>
          </div>

          {/* Impacto CO₂ */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                <FormattedNumber value={3.1} decimals={1} suffix="t" />
              </h3>
              <p className="text-sm text-gray-600">CO₂ ahorrado</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+15.3%</span>
              </div>
              <span className="text-sm text-gray-500">impacto positivo</span>
            </div>
          </div>

          {/* Productos vendidos */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                <FormattedNumber value={2847} />
              </h3>
              <p className="text-sm text-gray-600">Productos vendidos</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+22.1%</span>
              </div>
              <span className="text-sm text-gray-500">vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Gráfico de ingresos */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ingresos Mensuales</h3>
                <p className="text-sm text-gray-600">Evolución de ventas en los últimos 6 meses</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleDetails('revenue')}
              >
                {showDetails.revenue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B15543" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#B15543" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Ingresos' : name === 'orders' ? 'Órdenes' : 'Clientes'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#B15543" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución de productos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ventas por Categoría</h3>
                <p className="text-sm text-gray-600">Distribución de productos</p>
              </div>
            </div>
            
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productSales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productSales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentaje']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              {productSales.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impacto ambiental */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Impacto Ambiental</h3>
              <p className="text-sm text-gray-600">Métricas de sustentabilidad del mes</p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Impacto Positivo
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {environmentalImpact.map((metric, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  {metric.metric === 'CO₂ Ahorrado' && <Leaf className="w-8 h-8 text-green-600 mx-auto" />}
                  {metric.metric === 'Agua Conservada' && <Droplets className="w-8 h-8 text-blue-600 mx-auto" />}
                  {metric.metric === 'Plástico Evitado' && <Recycle className="w-8 h-8 text-terracota-primary mx-auto" />}
                  {metric.metric === 'Familias Beneficiadas' && <Users className="w-8 h-8 text-verde-dark mx-auto" />}
                </div>
                
                <div className="mb-2">
                  <h4 className="text-2xl font-bold text-gray-900">{metric.value}</h4>
                  <p className="text-sm text-gray-600">{metric.unit}</p>
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    +{metric.percentage}%
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mt-1">{metric.metric}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Órdenes recientes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Órdenes Recientes</h3>
                <p className="text-sm text-gray-600">Últimas transacciones</p>
              </div>
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terracota-light rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-terracota-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-600">{order.id}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      <FormattedNumber value={order.amount} prefix="$" />
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{order.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos eventos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Próximos Eventos</h3>
                <p className="text-sm text-gray-600">Experiencias programadas</p>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Ver calendario
              </Button>
            </div>
            
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-verde-light rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-verde-dark" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      <FormattedNumber value={event.revenue} prefix="$" />
                    </p>
                    <p className="text-sm text-gray-600">{event.participants} participantes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Productos Más Vendidos</h3>
              <p className="text-sm text-gray-600">Top 5 productos del mes</p>
            </div>
            <Button variant="outline" size="sm">
              Ver reporte completo
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Producto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ventas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ingresos</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tendencia</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-verde-light rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-verde-dark">#{index + 1}</span>
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.sales} unidades</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <FormattedNumber value={product.revenue} prefix="$" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {product.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${
                          product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.trend === 'up' ? 'Subiendo' : 'Bajando'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

