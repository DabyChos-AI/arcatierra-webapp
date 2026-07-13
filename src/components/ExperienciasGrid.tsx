'use client'

import { useState, useEffect } from 'react'
import ExperienceCard from '@/components/ExperienceCard'
import { Experiencia } from '@/data/experiencias'
import { API_URL } from '@/lib/api'

interface ApiExperiencia {
  experiencia_id: string
  nombre: string
  descripcion: string
  descripcion_corta?: string
  slug: string
  tipo: string
  duracion: string
  precio_base: number
  precio_ninos?: number
  capacidad_min: number
  capacidad_max: number
  imagen_principal?: string
  ubicacion?: string
  estado?: string
}

// Helper: mapear API a formato Experiencia
function mapApiExperiencia(api: ApiExperiencia): Experiencia {
  return {
    id: api.experiencia_id,
    nombre: api.nombre,
    slug: api.slug,
    tipo: api.tipo as 'publica' | 'privada',
    descripcionCorta: api.descripcion_corta || api.descripcion || '',
    descripcionCompleta: api.descripcion || '',
    duracion: api.duracion || '3-4 horas',
    precio: {
      base: api.precio_base || 990,
      nino: api.precio_ninos || null,
      capacidad: api.capacidad_max ? `${api.capacidad_min}-${api.capacidad_max} personas` : '4-30 personas'
    },
    seo: {
      title: api.nombre,
      description: api.descripcion_corta || api.descripcion || ''
    },
    imagen: api.imagen_principal || '/images/home/chinampas_xochimilco.png',
    badges: [
      api.tipo === 'publica' 
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

  useEffect(() => {
    const fetchExperiencias = async () => {
      try {
        const response = await fetch(`${API_URL}/api/experiencias`)
        
        if (response.ok) {
          const data: ApiExperiencia[] = await response.json()
          
          // Filtrar solo públicas y tomar las primeras 3
          const experienciasPublicas = data
            .filter(exp => exp.tipo === 'publica')
            .slice(0, 3)
            .map(mapApiExperiencia)
          
          setExperiencias(experienciasPublicas)
          console.log(`✅ ${experienciasPublicas.length} experiencias públicas cargadas desde API`, experienciasPublicas)
        } else {
          console.error('API experiencias respondió con error:', response.status)
          throw new Error(`API error: ${response.status}`)
        }
      } catch (error) {
        console.error('Error fetching experiencias:', error)
        // Fallback: sin experiencias en caso de error
        setExperiencias([])
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
        <p className="text-gray-600">No hay experiencias disponibles en este momento.</p>
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
