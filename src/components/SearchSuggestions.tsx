'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Clock, TrendingUp } from 'lucide-react'
import { Product } from '@/lib/mockData'

interface SearchSuggestionsProps {
  // Aceptar ambos nombres para compatibilidad
  products?: Product[]
  productos?: Product[]
  // Aceptar ambos nombres para el término de búsqueda
  searchTerm?: string
  busqueda?: string
  // Aceptar ambos nombres para las funciones
  onProductSelect?: (product: Product) => void
  onSeleccionar?: (term: string) => void
  onSearchChange?: (term: string) => void
}

export default function SearchSuggestions({ 
  products,
  productos,
  searchTerm,
  busqueda,
  onProductSelect,
  onSeleccionar,
  onSearchChange
}: SearchSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches] = useState(['espinacas', 'jitomate', 'aguacate'])
  const [popularSearches] = useState(['orgánico', 'verduras frescas', 'frutas de temporada'])
  const searchRef = useRef<HTMLDivElement>(null)

  // Usar productos o products, lo que esté disponible
  const productList = productos || products || []
  
  // Usar busqueda o searchTerm, lo que esté disponible
  const currentSearchTerm = busqueda || searchTerm || ''

  // Filtrar productos basado en el término de búsqueda - con verificación de seguridad
  const filteredProducts = Array.isArray(productList) ? productList.filter(product =>
    product?.name?.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
    product?.category?.toLowerCase().includes(currentSearchTerm.toLowerCase())
  ).slice(0, 5) : []

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product)
    }
    if (onSeleccionar) {
      onSeleccionar(product.name)
    }
    setIsOpen(false)
  }

  const handleSearchTermClick = (term: string) => {
    if (onSearchChange) {
      onSearchChange(term)
    }
    if (onSeleccionar) {
      onSeleccionar(term)
    }
    setIsOpen(false)
  }

  // Solo mostrar si hay término de búsqueda
  if (!currentSearchTerm) {
    return null
  }

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Panel de sugerencias */}
      {currentSearchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[840] max-h-96 overflow-y-auto">
          {/* Productos encontrados */}
          {filteredProducts.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Productos encontrados
              </h4>
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.images?.[0]?.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${product.price?.toFixed(2)} / {product.unit}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Búsquedas populares */}
          {filteredProducts.length === 0 && (
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Búsquedas populares
              </h4>
              <div className="space-y-1">
                {popularSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchTermClick(term)}
                    className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-sm text-gray-600 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {currentSearchTerm && filteredProducts.length === 0 && (
            <div className="p-6 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-1">
                No se encontraron productos
              </h4>
              <p className="text-sm text-gray-500">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

