/**
 * Hook personalizado para manejar datos del dashboard usuario
 * 
 * PATRÓN VERIFICADO: Basado en useFavoritos.ts (líneas 22-40)
 * - Carga datos de APIs dashboard
 * - Manejo de estado loading/error
 * - Cache básico con localStorage
 * - Refresco automático
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { API_URL } from '@/lib/api'

const API_BASE = `${API_URL}/api`

export interface DashboardData {
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
  timestamp_consulta: string
}

export interface ImpactoData {
  co2_ahorrado_kg: number
  agua_conservada_litros: number
  plastico_evitado_kg: number
  categorias_compradas: number
  timestamp_calculo: string
}

export interface DireccionData {
  id: string
  nombre_direccion: string
  calle: string
  numero_exterior: string
  numero_interior?: string
  colonia: string
  codigo_postal: string
  ciudad: string
  estado: string
  referencias?: string
  es_principal: boolean
  activa: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export const useDashboard = () => {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [impactoData, setImpactoData] = useState<ImpactoData | null>(null)
  const [direcciones, setDirecciones] = useState<DireccionData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos desde cache local primero
  const loadFromCache = useCallback(() => {
    try {
      const cachedDashboard = localStorage.getItem('arcatierra_dashboard_cache')
      if (cachedDashboard) {
        const parsed = JSON.parse(cachedDashboard)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) { // 5 minutos cache
          setDashboardData(parsed.dashboard)
          setImpactoData(parsed.impacto)
          setDirecciones(parsed.direcciones || [])
          return true
        }
      }
    } catch (error) {
      console.warn('Error cargando cache dashboard:', error)
      localStorage.removeItem('arcatierra_dashboard_cache')
    }
    return false
  }, [])

  // Cargar datos desde APIs - patrón verificado (useFavoritos.ts línea 41-80)
  const cargarDashboard = useCallback(async (forceRefresh = false) => {
    if (!session?.user && !forceRefresh) return

    // Si no es force refresh, intentar cache primero
    if (!forceRefresh && loadFromCache()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Headers con auth (patrón verificado en múltiples archivos)
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.accessToken || 'demo'}`
      }

      // Llamadas paralelas - patrón verificado
      const [resumenRes, impactoRes, direccionesRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/usuario/resumen`, { headers }),
        fetch(`${API_BASE}/dashboard/usuario/impacto`, { headers }),
        fetch(`${API_BASE}/direcciones/`, { headers })
      ])

      let dashboardResult: DashboardData | null = null
      let impactoResult: ImpactoData | null = null
      let direccionesResult: DireccionData[] = []

      // Procesar respuestas - patrón error handling verificado
      if (resumenRes.ok) {
        dashboardResult = await resumenRes.json()
        setDashboardData(dashboardResult)
      } else if (resumenRes.status !== 401) {
        console.warn('Error cargando resumen dashboard:', resumenRes.status)
      }

      if (impactoRes.ok) {
        impactoResult = await impactoRes.json()
        setImpactoData(impactoResult)
      } else if (impactoRes.status !== 401) {
        console.warn('Error cargando impacto:', impactoRes.status)
      }

      if (direccionesRes.ok) {
        direccionesResult = await direccionesRes.json()
        setDirecciones(direccionesResult)
      } else if (direccionesRes.status !== 401) {
        console.warn('Error cargando direcciones:', direccionesRes.status)
        setDirecciones([]) // Array vacío como fallback
      }

      // Guardar en cache si tenemos datos
      if (dashboardResult || impactoResult || direccionesResult.length > 0) {
        try {
          localStorage.setItem('arcatierra_dashboard_cache', JSON.stringify({
            dashboard: dashboardResult,
            impacto: impactoResult,
            direcciones: direccionesResult,
            timestamp: Date.now()
          }))
        } catch (error) {
          console.warn('Error guardando cache:', error)
        }
      }

    } catch (err) {
      console.error('Error cargando dashboard:', err)
      setError('Error cargando datos del dashboard')
    } finally {
      setLoading(false)
    }
  }, [session, loadFromCache])

  // Función para crear nueva dirección
  const crearDireccion = useCallback(async (nuevaDireccion: Omit<DireccionData, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'activa'>) => {
    if (!session?.user) return false

    try {
      const response = await fetch(`${API_BASE}/direcciones/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken || 'demo'}`
        },
        body: JSON.stringify(nuevaDireccion)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Recargar direcciones
          await cargarDashboard(true)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error creando dirección:', error)
      return false
    }
  }, [session, cargarDashboard])

  // Función para eliminar dirección
  const eliminarDireccion = useCallback(async (direccionId: string) => {
    if (!session?.user) return false

    try {
      const response = await fetch(`${API_BASE}/direcciones/${direccionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken || 'demo'}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Actualizar estado local inmediatamente
          setDirecciones(prev => prev.filter(d => d.id !== direccionId))
          // Limpiar cache
          localStorage.removeItem('arcatierra_dashboard_cache')
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error eliminando dirección:', error)
      return false
    }
  }, [session])

  // Función para marcar dirección como principal
  const marcarComoPrincipal = useCallback(async (direccionId: string) => {
    if (!session?.user) return false

    try {
      const response = await fetch(`${API_BASE}/direcciones/${direccionId}/principal`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken || 'demo'}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Actualizar estado local
          setDirecciones(prev => prev.map(d => ({
            ...d,
            es_principal: d.id === direccionId
          })))
          // Limpiar cache
          localStorage.removeItem('arcatierra_dashboard_cache')
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error marcando dirección como principal:', error)
      return false
    }
  }, [session])

  // Auto-carga inicial - patrón verificado (useFavoritos.ts línea 146-148)
  useEffect(() => {
    if (session?.user) {
      cargarDashboard()
    }
  }, [session, cargarDashboard])

  return {
    // Datos
    dashboardData,
    impactoData,
    direcciones,
    
    // Estado
    loading,
    error,
    
    // Acciones
    recargar: () => cargarDashboard(true),
    crearDireccion,
    eliminarDireccion,
    marcarComoPrincipal,
    
    // Helpers
    tieneDatos: !!(dashboardData || impactoData || direcciones.length > 0),
    direccionPrincipal: direcciones.find(d => d.es_principal)
  }
}
