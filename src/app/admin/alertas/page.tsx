'use client'

import { AlertTriangle, CheckCircle, Clock, Bell, Package, Users, TrendingDown, Lightbulb, TrendingUp, Calendar } from 'lucide-react'

export default function AlertasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            Centro de Alertas
          </h1>
          <p className="text-gray-600 mt-1">Monitoreo y notificaciones del sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Críticas</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resueltas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Alertas Críticas (0)
          </h3>
          
          <div className="text-center py-8">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600">¡Excelente! No hay alertas críticas</p>
            <p className="text-sm text-gray-500 mt-1">El sistema está funcionando correctamente</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            Alertas Pendientes (3)
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="p-1 bg-yellow-100 rounded">
                <Package className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Stock Bajo - Aguacate Hass</h4>
                <p className="text-sm text-gray-600">Solo quedan 8 unidades en inventario</p>
                <button 
                  onClick={() => alert('📦 Recomendación Stock Bajo:\n\nProducto: Aguacate Hass\nStock actual: 8 unidades\nStock mínimo: 10 unidades\n\n🔧 Acciones recomendadas:\n• Reabastecer inmediatamente\n• Contactar proveedor\n• Revisar demanda histórica\n\n✅ Generar orden de compra')}
                  className="text-xs text-yellow-700 hover:text-yellow-900 underline mt-1"
                >
                  Ver recomendaciones
                </button>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="p-1 bg-blue-100 rounded">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Evento con Pocos Participantes</h4>
                <p className="text-sm text-gray-600">Tour Gastronómico - Solo 8 de 15 plazas ocupadas</p>
                <button 
                  onClick={() => alert('👥 Recomendación Evento:\n\nEvento: Tour Gastronómico\nFecha: Sábado 11:00 AM\nOcupación: 8/15 (53%)\n\n🔧 Acciones recomendadas:\n• Enviar promoción especial\n• Descuento para grupos\n• Contactar clientes frecuentes\n• Promoción en redes sociales\n\n✅ Activar campaña de marketing')}
                  className="text-xs text-blue-700 hover:text-blue-900 underline mt-1"
                >
                  Ver recomendaciones
                </button>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="p-1 bg-purple-100 rounded">
                <TrendingDown className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Ventas Bajo Promedio</h4>
                <p className="text-sm text-gray-600">Esta semana: -12% vs semana anterior</p>
                <button 
                  onClick={() => alert('📈 Recomendación Ventas:\n\nSituación: Ventas 12% bajo promedio\nPeriodo: Esta semana\nPrincipales productos afectados: Lácteos, Vegetales\n\n🔧 Acciones recomendadas:\n• Revisar precios competencia\n• Promociones flash\n• Análizar productos con mejor margen\n• Enviar newsletter a clientes\n• Revisar calidad productos\n\n✅ Activar plan de recuperación')}
                  className="text-xs text-purple-700 hover:text-purple-900 underline mt-1"
                >
                  Ver recomendaciones
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recomendaciones Inteligentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
          Recomendaciones Inteligentes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Oportunidad de Crecimiento</h4>
            </div>
            <p className="text-sm text-green-700 mb-3">Los productos orgánicos tienen +25% más demanda los fines de semana</p>
            <button 
              onClick={() => alert('🌱 Oportunidad de Crecimiento:\n\nInsight: Productos orgánicos +25% demanda fines de semana\n\n🔧 Acciones sugeridas:\n• Aumentar stock orgánicos viernes\n• Promociones especiales sábados\n• Bundle ofertas familias\n• Resaltar certificaciones orgánicas\n\n💰 Impacto estimado: +$3,200 mensuales')}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Implementar
            </button>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Retención de Clientes</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">15 clientes no han comprado en 30+ días. Enviar oferta personalizada</p>
            <button 
              onClick={() => alert('💌 Retención de Clientes:\n\nSituación: 15 clientes inactivos 30+ días\nValor promedio histórico: $1,845 por cliente\n\n🔧 Acciones sugeridas:\n• Email personalizado con descuento 15%\n• Recordar productos favoritos\n• Invitación experiencia gratuita\n• Survey feedback y mejoras\n\n💰 Recuperación estimada: $2,768')}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Enviar Campaña
            </button>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-purple-900">Optimización Eventos</h4>
            </div>
            <p className="text-sm text-purple-700 mb-3">Las experiencias matutinas tienen 89% de satisfacción vs 67% vespertinas</p>
            <button 
              onClick={() => alert('🌅 Optimización Eventos:\n\nInsight: Experiencias matutinas 89% satisfacción vs 67% vespertinas\n\n🔧 Acciones sugeridas:\n• Priorizar horarios 9:00-12:00\n• Reducir eventos vespertinos\n• Ofrecer desayunos incluidos\n• Marketing enfocado mañanas\n\n📈 Impacto: +22% satisfacción cliente')}
              className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >
              Aplicar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
