'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Award, Trophy, Star, Target, TrendingUp, Crown } from 'lucide-react'

interface EmpleadoRanking {
  empleado_id: string;
  nombre: string;
  email: string;
  departamento: string;
  cargo: string;
  puntos_totales: number;
  puntos_mes_actual: number;
  nivel: number;
  titulo_actual: string;
}

export default function GamificacionPage() {
  const { data: session } = useSession()
  const [ranking, setRanking] = useState<EmpleadoRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [isFundador, setIsFundador] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      const fundadores = ['pablo@arcatierra.com', 'luh@arcatierra.com']
      const superAdmin = ['ing.davidabraham@gmail.com']
      // Super admin también ve vistas de fundadores
      setIsFundador(fundadores.includes(session.user.email) || superAdmin.includes(session.user.email))
    }
  }, [session])

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/admin/gamificacion/ranking')
        if (response.ok) {
          const data = await response.json()
          setRanking(data.ranking || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Award className="h-8 w-8 text-yellow-500 mr-3" />
              Sistema de Gamificación
            </h1>
            {isFundador && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-semibold">Vista Fundador</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {isFundador ? 'Ranking empleados competitivos (fundadores excluidos)' : 'Puntos, niveles y ranking de empleados'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Jugador</p>
              <p className="text-lg font-bold text-gray-900">
                {ranking.length > 0 ? ranking[0].nombre || 'N/A' : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Puntos Totales</p>
              <p className="text-lg font-bold text-gray-900">
                {ranking.reduce((sum, emp) => sum + emp.puntos_totales, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participantes</p>
              <p className="text-lg font-bold text-gray-900">{ranking.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nivel Promedio</p>
              <p className="text-lg font-bold text-gray-900">
                {ranking.length > 0 ? 
                  Math.round(ranking.reduce((sum, emp) => sum + emp.nivel, 0) / ranking.length) : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">🏆 Ranking de Empleados</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando ranking...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {ranking
              .filter(emp => !emp.titulo_actual.includes('FUNDADOR'))
              .map((empleado, index) => (
              <div key={empleado.empleado_id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'}
                    `}>
                      #{index + 1}
                    </div>
                    
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                        {empleado.nombre?.charAt(0) || 'N'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">{empleado.nombre || 'Sin nombre'}</p>
                        {index < 3 && (
                          <Trophy className={`h-4 w-4 ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-500' :
                            'text-orange-500'
                          }`} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{empleado.departamento} • {empleado.cargo}</p>
                      <p className="text-sm text-purple-600 font-medium">{empleado.titulo_actual}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Este mes</p>
                        <p className="font-bold text-green-600">{empleado.puntos_mes_actual.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-blue-600">{empleado.puntos_totales.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nivel</p>
                        <p className="font-bold text-purple-600">{empleado.nivel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
