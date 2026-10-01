'use client'

import { useState, useEffect } from 'react'
import ExperienceCard from '@/components/ExperienceCard'
import { Experiencia } from '@/data/experiencias'
import { API_URL } from '@/lib/api'
import { textoGrupoPrivada } from '@/app/experiencias/[slug]/precio-privada'

/**
 * Lo que la portada lee de un item de GET /api/experiencias (ExperienciaResponse del backend).
 * WEB2 (R1 · sesión 41): antes leía un arreglo plano y campos que la API no manda (`experiencia_id`, `precio_base`,
 * `capacidad_min/max`): el `.filter` sobre el sobre `{items, …}` fallaba y la sección quedaba en «No hay
 * experiencias»; de haber cargado, inventaba «4-30 personas» y un precio de $990. Hoy (1-oct) la sección de
 * experiencias de la portada está comentada en `app/page.tsx` («TEMPORALMENTE DESHABILITADO»): esto la deja bien
 * para cuando se vuelva a encender.
 */
interface ApiExperiencia {
  id: string
  nombre: string
  descripcion: string
  slug: string
  tipo: string
  duracion_horas: number
  precio: number
  precio_persona_adicional: number
  personas_incluidas: number | null
  imagen_principal: string
}

/** Cuántas experiencias públicas muestra la portada. */
const EXPERIENCIAS_PORTADA = 3

// Helper: mapear API a formato Experiencia
function mapApiExperiencia(api: ApiExperiencia): Experiencia {
  const tipo: 'publica' | 'privada' = api.tipo === 'publica' ? 'publica' : 'privada'
  return {
    id: api.id,
    nombre: api.nombre,
    slug: api.slug,
    tipo,
    descripcionCorta: api.descripcion || '',
    descripcionCompleta: api.descripcion || '',
    duracion: `${api.duracion_horas} horas`,
    precio: {
      base: api.precio,
      adicional: api.precio_persona_adicional || 0,
      // Pública: por persona. Privada (WEB2, DR4): por grupo con las personas que dice la API.
      capacidad: tipo === 'publica' ? 'por persona' : textoGrupoPrivada(api.personas_incluidas)
    },
    seo: {
      title: api.nombre,
      description: api.descripcion || ''
    },
    imagen: api.imagen_principal || '/images/home/chinampas_xochimilco.png',
    badges: [
      tipo === 'publica' 
        ? { type: 'publica' as const, label: 'Pública', color: 'text-white', bgColor: 'bg-verde-principal', icon: '👥' }
        : { type: 'privada' as const, label: 'Privada', color: 'text-white', bgColor: 'bg-terracota', icon: '🔒' }
    ],
    incluye: [],
    informacion_importante: [],
    categoria: 'gastronomica' as const
  }
}

export default function ExperienciasGrid() {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchExperiencias = async () => {
      try {
        // Las primeras públicas (la API ordena por nombre), como antes: filtrar públicas y tomar 3
        const response = await fetch(`${API_URL}/api/experiencias?tipo=publica&limit=${EXPERIENCIAS_PORTADA}`)
        
        if (response.ok) {
          const data: { items?: ApiExperiencia[] } = await response.json()
          const experienciasPublicas = (Array.isArray(data.items) ? data.items : [])
            .filter(exp => exp.tipo === 'publica')
            .slice(0, EXPERIENCIAS_PORTADA)
            .map(mapApiExperiencia)
          
          setExperiencias(experienciasPublicas)
        } else {
          console.error('API experiencias respondió con error:', response.status)
          throw new Error(`API error: ${response.status}`)
        }
      } catch (error) {
        console.error('Error fetching experiencias:', error)
        setExperiencias([])
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchExperiencias()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (experiencias.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600" data-testid={error ? 'grid-error' : 'grid-vacio'} role={error ? 'alert' : undefined}>
          {error
            ? 'No pudimos cargar las experiencias. Recarga la página en un momento.'
            : 'No hay experiencias disponibles en este momento.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {experiencias.map((exp, index) => (
        <div 
          key={exp.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${(index + 1) * 100}ms` }}
        >
          <ExperienceCard experiencia={exp} index={index} />
        </div>
      ))}
    </div>
  )
}
