'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search, MapPin, Bike, Heart, Store } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface ZonaEntrega {
  id: number
  codigo_postal: string
  colonia: string
  municipio: string
  lunes: boolean
  martes: boolean
  miercoles: boolean
  jueves: boolean
  viernes: boolean
  sabado: boolean
  domingo: boolean
  tiempo_minimo_dias: number
}

interface PostalCodeSelectorProps {
  value: string
  onChange: (cp: string, zona: ZonaEntrega | null) => void
  onRecogerEnMatriz?: () => void
}

// Dirección de la matriz de Arca Tierra
const DIRECCION_MATRIZ = {
  calle: 'Calle Anatole France 307',
  colonia: 'Polanco Reforma',
  municipio: 'Miguel Hidalgo',
  cp: '11550',
  ciudad: 'CDMX',
  completa: 'Calle Anatole France 307, Polanco Reforma, Miguel Hidalgo, CDMX, CP 11550'
}

export default function PostalCodeSelector({ value, onChange, onRecogerEnMatriz }: PostalCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonas, setZonas] = useState<ZonaEntrega[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedZona, setSelectedZona] = useState<ZonaEntrega | null>(null)
  const [noCobertura, setNoCobertura] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar todas las zonas al inicio
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        // Cargar zonas populares (por ahora todas, después ordenadas por ventas)
        const response = await fetch(`${API_URL}/api/zonas-entrega/todas`)
        if (response.ok) {
          const data = await response.json()
          setZonas(data.zonas || [])
        }
      } catch (err) {
        console.error('Error cargando zonas:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchZonas()
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrar zonas basado en búsqueda
  const filteredZonas = useMemo(() => {
    if (!search) return zonas.slice(0, 10) // Mostrar top 10 populares
    
    const searchLower = search.toLowerCase()
    return zonas.filter(zona => 
      zona.codigo_postal.includes(search) ||
      zona.colonia.toLowerCase().includes(searchLower) ||
      zona.municipio.toLowerCase().includes(searchLower)
    ).slice(0, 15)
  }, [zonas, search])

  // Verificar si el CP buscado no tiene cobertura
  useEffect(() => {
    if (search.length === 5 && filteredZonas.length === 0) {
      setNoCobertura(true)
    } else {
      setNoCobertura(false)
    }
  }, [search, filteredZonas])

  const handleSelect = (zona: ZonaEntrega) => {
    setSelectedZona(zona)
    setSearch('')
    setIsOpen(false)
    onChange(zona.codigo_postal, zona)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 5)
    setSearch(val)
    
    // Si borra todo, limpiar selección
    if (!val) {
      setSelectedZona(null)
      onChange('', null)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Obtener días de entrega como texto
  const getDiasEntrega = (zona: ZonaEntrega): string => {
    const dias = []
    if (zona.lunes) dias.push('L')
    if (zona.martes) dias.push('M')
    if (zona.miercoles) dias.push('Mi')
    if (zona.jueves) dias.push('J')
    if (zona.viernes) dias.push('V')
    if (zona.sabado) dias.push('S')
    if (zona.domingo) dias.push('D')
    return dias.join(', ')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector principal */}
      <button
        type="button"
        onClick={handleOpen}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3
          bg-white border-2 rounded-xl transition-all duration-200
          ${isOpen ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'}
          ${selectedZona ? 'bg-green-50' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${selectedZona ? 'bg-green-600' : 'bg-gray-100'}
          `}>
            <MapPin className={`w-5 h-5 ${selectedZona ? 'text-white' : 'text-gray-400'}`} />
          </div>
          
          {selectedZona ? (
            <div className="text-left">
              <p className="font-semibold text-gray-900">{selectedZona.codigo_postal}</p>
              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                {selectedZona.colonia}, {selectedZona.municipio}
              </p>
            </div>
          ) : (
            <span className="text-gray-500">Selecciona tu código postal</span>
          )}
        </div>
        
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Buscador */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar por CP o colonia..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Lista de zonas */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Cargando zonas...
              </div>
            ) : noCobertura ? (
              /* Mensaje divertido de no cobertura */
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bike className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  ¡Ups! Todavía no llegamos ahí 🚴‍♂️
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Nuestros repartidores están pedaleando fuerte para expandirse, 
                  pero aún no alcanzan tu zona. <span className="font-medium">¡No te desanimes!</span>
                </p>
                
                <div className="bg-green-50 rounded-xl p-4 text-left mb-4">
                  <div className="flex items-start gap-3">
                    <Store className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Puedes recoger en nuestra matriz
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        De paso conoces a la familia Arca Tierra y te llevas 
                        tus productos súper frescos 🌱
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        📍 {DIRECCION_MATRIZ.calle}, {DIRECCION_MATRIZ.colonia}
                      </p>
                      {onRecogerEnMatriz && (
                        <button
                          type="button"
                          onClick={() => {
                            onRecogerEnMatriz()
                            setIsOpen(false)
                          }}
                          className="mt-3 w-full py-2 px-4 bg-verde-principal text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Recoger en matriz →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>
                    Entre más nos recomiendes, más rápido llegamos a tu colonia
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-3 italic">
                  Tu compra sigue ayudando al campo, a la naturaleza y a tu salud 💚
                </p>
              </div>
            ) : filteredZonas.length > 0 ? (
              <>
                {!search && (
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Zonas populares
                    </p>
                  </div>
                )}
                {filteredZonas.map((zona) => (
                  <button
                    key={zona.id}
                    type="button"
                    onClick={() => handleSelect(zona)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors
                      ${selectedZona?.id === zona.id ? 'bg-green-50' : ''}
                    `}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-700">{zona.codigo_postal.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{zona.codigo_postal}</span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          {getDiasEntrega(zona)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {zona.colonia}
                      </p>
                      <p className="text-xs text-gray-400">
                        {zona.municipio}
                      </p>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Escribe tu código postal</p>
                <p className="text-xs text-gray-400 mt-1">o busca por nombre de colonia</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
