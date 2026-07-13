'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, X, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

interface MapPickerProps {
  value: string
  onChange: (coords: string) => void
  label?: string
  className?: string
  zIndex?: number
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletType = any

const MapPickerContent = ({ value, onChange, label, className, zIndex = 50 }: MapPickerProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const mapRef = useRef<LeafletType>(null)
  const markerRef = useRef<LeafletType>(null)

  // Importar Leaflet solo en cliente
  const [L, setL] = useState<LeafletType>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        setL(leaflet.default)
      })
    }
  }, [])

  // Parsear coordenadas existentes
  useEffect(() => {
    if (value) {
      const coords = value.split(',').map(c => parseFloat(c.trim()))
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        setPosition([coords[0], coords[1]])
      }
    }
  }, [value])

  // Inicializar mapa cuando se abre
  useEffect(() => {
    if (!isMapOpen || !L) return

    // Cleanup previo
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Cargar CSS de Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Esperar a que el contenedor esté disponible
    setTimeout(() => {
      const container = document.getElementById('map-container')
      if (!container) return

      // Coordenadas default: Xochimilco, CDMX
      const defaultPos: [number, number] = position || [19.2663, -99.0959]

      const map = L.map('map-container').setView(defaultPos, 14)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Icono personalizado
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #16a34a; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })

      // Agregar marcador si hay posición
      if (position) {
        markerRef.current = L.marker(position, { icon: customIcon }).addTo(map)
      }

      // Click en mapa para seleccionar ubicación
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        setPosition([lat, lng])

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map)
        }
      })
    }, 100)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isMapOpen, L])

  // Búsqueda de ubicaciones con Nominatim (OpenStreetMap)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error buscando ubicación:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setPosition([lat, lng])
    setSearchResults([])
    setSearchQuery(result.display_name.split(',')[0])

    if (mapRef.current && L) {
      mapRef.current.setView([lat, lng], 16)

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #16a34a; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current)
      }
    }
  }

  const handleConfirm = () => {
    if (position) {
      onChange(`${position[0].toFixed(6)}, ${position[1].toFixed(6)}`)
    }
    setIsMapOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setPosition(null)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 {label}
        </label>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="19.2663, -99.0959"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Mapa
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {value && (
        <a
          href={`https://www.google.com/maps?q=${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-600 hover:underline mt-1 inline-block"
        >
          Ver en Google Maps ↗
        </a>
      )}

      {/* Modal del mapa */}
      {isMapOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" style={{ zIndex }}>
          <div className="bg-white rounded-xl w-full max-w-3xl my-4 flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Seleccionar Ubicación</h3>
              <button
                onClick={() => setIsMapOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Búsqueda */}
            <div className="p-4 border-b">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar ubicación... (ej: Xochimilco, CDMX)"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </button>
              </div>

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-lg overflow-hidden">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSearchResult(result)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 text-sm"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mapa */}
            <div id="map-container" className="h-64 md:h-80 w-full flex-shrink-0" />

            {/* Coordenadas seleccionadas y botón confirmar */}
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {position ? (
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {position[0].toFixed(6)}, {position[1].toFixed(6)}
                  </span>
                ) : (
                  <span className="text-gray-400">Haz clic en el mapa para seleccionar</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!position}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Confirmar Ubicación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Exportar con dynamic import para evitar SSR
const MapPicker = dynamic(() => Promise.resolve(MapPickerContent), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  )
})

export default MapPicker
