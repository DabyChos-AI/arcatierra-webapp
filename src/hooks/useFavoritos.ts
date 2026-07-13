/**
 * Hook personalizado para manejar favoritos
 * 
 * VERSIÓN ACTUAL: Backend integrado con fallback a localStorage
 * - Usuarios autenticados: Guarda en PostgreSQL + localStorage
 * - Usuarios invitados: Solo localStorage
 * - Sincronización automática
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { API_URL } from '@/lib/api'

const FAVORITOS_URL = `${API_URL}/api/favoritos`

export interface Favorito {
  id: string
  tipo_recurso: 'producto' | 'receta' | 'experiencia'
  recurso_id: string
  created_at: string
}

export const useFavoritos = () => {
  const { data: session } = useSession()
  const [favoritos, setFavoritos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar favoritos desde el backend o localStorage
  const cargarFavoritos = useCallback(async () => {
    // Cargar desde localStorage primero
    const local = localStorage.getItem('arcaTierraFavoritos')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        setFavoritos(Array.isArray(parsed) ? parsed : [])
      } catch {
        setFavoritos([])
      }
    }
    
    // Si hay sesión con JWT, cargar desde backend
    const accessToken = (session as any)?.accessToken
    if (session?.user && accessToken) {
      try {
        const response = await fetch(`${FAVORITOS_URL}?tipo=producto`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const ids = data.favoritos?.map((f: Favorito) => f.recurso_id) || []
          setFavoritos(ids)
          // Sincronizar con localStorage
          localStorage.setItem('arcaTierraFavoritos', JSON.stringify(ids))
        }
      } catch (err) {
        console.error('Error cargando favoritos del backend:', err)
        // Usar localStorage como fallback
      }
    }
  }, [session])

  // Cargar favoritos al montar
  useEffect(() => {
    cargarFavoritos()
  }, [cargarFavoritos])

  // Agregar favorito
  const agregarFavorito = useCallback(async (productoId: string): Promise<boolean> => {
    // Actualización optimista en localStorage
    setFavoritos(prev => {
      if (prev.includes(productoId)) return prev
      const next = [...prev, productoId]
      localStorage.setItem('arcaTierraFavoritos', JSON.stringify(next))
      return next
    })

    // Si hay sesión con JWT, guardar en backend
    const accessToken = (session as any)?.accessToken
    if (session?.user && accessToken) {
      try {
        const response = await fetch(FAVORITOS_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tipo_recurso: 'producto',
            recurso_id: productoId
          })
        })
        
        if (!response.ok && response.status !== 409) {
          throw new Error('Error al agregar favorito')
        }
      } catch (err) {
        console.error('Error agregando favorito al backend:', err)
        // Revertir cambio optimista
        setFavoritos(prev => {
          const next = prev.filter(id => id !== productoId)
          localStorage.setItem('arcaTierraFavoritos', JSON.stringify(next))
          return next
        })
        return false
      }
    }
    
    return true
  }, [session])

  // Eliminar favorito
  const eliminarFavorito = useCallback(async (productoId: string): Promise<boolean> => {
    // Actualización optimista en localStorage
    setFavoritos(prev => {
      const next = prev.filter(id => id !== productoId)
      localStorage.setItem('arcaTierraFavoritos', JSON.stringify(next))
      return next
    })

    // Si hay sesión con JWT, eliminar del backend
    const accessToken = (session as any)?.accessToken
    if (session?.user && accessToken) {
      try {
        const response = await fetch(`${FAVORITOS_URL}/recurso/producto/${productoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        if (!response.ok && response.status !== 404) {
          throw new Error('Error al eliminar favorito')
        }
      } catch (err) {
        console.error('Error eliminando favorito del backend:', err)
        // Revertir cambio optimista
        setFavoritos(prev => {
          const next = [...prev, productoId]
          localStorage.setItem('arcaTierraFavoritos', JSON.stringify(next))
          return next
        })
        return false
      }
    }
    
    return true
  }, [session])

  // Toggle favorito (agregar o eliminar)
  const toggleFavorito = useCallback(async (productoId: string): Promise<{ agregado: boolean; exito: boolean }> => {
    const existe = favoritos.includes(productoId)
    
    if (existe) {
      const exito = await eliminarFavorito(productoId)
      return { agregado: false, exito }
    } else {
      const exito = await agregarFavorito(productoId)
      return { agregado: true, exito }
    }
  }, [favoritos, agregarFavorito, eliminarFavorito])

  // Verificar si es favorito
  const esFavorito = useCallback((productoId: string): boolean => {
    return favoritos.includes(productoId)
  }, [favoritos])

  return {
    favoritos,
    loading,
    error,
    agregarFavorito,
    eliminarFavorito,
    toggleFavorito,
    esFavorito,
    recargar: cargarFavoritos,
    count: favoritos.length
  }
}
