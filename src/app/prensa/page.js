'use client'

import { useState, useMemo } from 'react'
import Hero from '@/components/prensa/Hero'
import FilterSection from '@/components/prensa/FilterSection'
import ArticleGrid from '@/components/prensa/ArticleGrid'
import { pressData } from '@/data/prensa/pressData'

export default function PressPage() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [activeTypeFilter, setActiveTypeFilter] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar artículos basado en filtros activos y búsqueda
  const filteredArticles = useMemo(() => {
    let filtered = pressData

    // Filtrar por categoría
    if (activeFilter !== 'todos') {
      filtered = filtered.filter(article => article.category === activeFilter)
    }

    // Filtrar por tipo de contenido
    if (activeTypeFilter !== 'todos') {
      filtered = filtered.filter(article => article.type === activeTypeFilter.slice(0, -1)) // Convertir 'articulos' a 'articulo', etc.
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.publication.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower)
      )
    }

    // Ordenar por fecha (más recientes primero) y luego por destacados
    return filtered.sort((a, b) => {
      // Primero ordenar por destacados
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      
      // Luego por fecha
      return new Date(b.date) - new Date(a.date)
    })
  }, [activeFilter, activeTypeFilter, searchTerm])

  // Crear lista de filtros activos para mostrar
  const activeFilters = useMemo(() => {
    const filters = []
    
    if (searchTerm) {
      filters.push(searchTerm)
    }
    
    if (activeFilter !== 'todos') {
      filters.push(activeFilter)
    }

    if (activeTypeFilter !== 'todos') {
      // Convertir ID a nombre legible
      const typeNames = {
        'articulos': 'Artículos',
        'videos': 'Videos',
        'podcasts': 'Podcasts'
      }
      filters.push(typeNames[activeTypeFilter])
    }
    
    return filters
  }, [activeFilter, activeTypeFilter, searchTerm])

  return (
    <div className="flex flex-col">
      <Hero 
        title="Noticias y Medios"
        subtitle="Descubre las últimas novedades y apariciones en prensa de Arca Tierra"
      />
      
      <FilterSection 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeTypeFilter={activeTypeFilter}
        setActiveTypeFilter={setActiveTypeFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilters={activeFilters}
      />
      
      <ArticleGrid articles={filteredArticles} />
    </div>
  )
}
