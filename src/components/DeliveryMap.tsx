'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface DeliveryMapProps {
  address: string
  postalCode: string
  onValidAddress?: (isValid: boolean, details?: any) => void
}

export default function DeliveryMap({ address, postalCode, onValidAddress }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry']
        })

        const google = await loader.load()
        
        if (!mapRef.current) return

        // Configuración inicial del mapa centrado en CDMX
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 19.4326, lng: -99.1332 }, // CDMX
          zoom: 11,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        setMap(mapInstance)
        setIsLoading(false)

        // Crear servicio de geocoding
        const geocoder = new google.maps.Geocoder()
        
        // Geocodificar la dirección cuando cambie
        if (address && postalCode) {
          geocodeAddress(geocoder, mapInstance, `${address}, ${postalCode}, CDMX, México`)
        }

      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError('Error cargando el mapa')
        setIsLoading(false)
      }
    }

    initMap()
  }, [])

  useEffect(() => {
    if (map && address && postalCode) {
      const geocoder = new google.maps.Geocoder()
      geocodeAddress(geocoder, map, `${address}, ${postalCode}, CDMX, México`)
    }
  }, [address, postalCode, map])

  const geocodeAddress = (geocoder: google.maps.Geocoder, map: google.maps.Map, fullAddress: string) => {
    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location
        const addressComponents = results[0].address_components
        
        // Validar que esté en CDMX
        const isInCDMX = addressComponents.some(component => 
          component.types.includes('administrative_area_level_1') && 
          (component.long_name.includes('Ciudad de México') || component.long_name.includes('CDMX'))
        )

        // Validar código postal
        const foundPostalCode = addressComponents.find(component => 
          component.types.includes('postal_code')
        )?.long_name

        const isValidPostalCode = foundPostalCode && 
          parseInt(foundPostalCode) >= 1000 && 
          parseInt(foundPostalCode) <= 16999

        const isValidAddress = isInCDMX && isValidPostalCode

        // Actualizar mapa
        map.setCenter(location)
        map.setZoom(16)

        // Remover marcador anterior
        if (marker) {
          marker.setMap(null)
        }

        // Crear nuevo marcador
        const newMarker = new google.maps.Marker({
          position: location,
          map: map,
          title: 'Dirección de entrega',
          icon: {
            url: isValidAddress ? 
              'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#22c55e"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              `) :
              'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          }
        })

        setMarker(newMarker)

        // Crear ventana de información
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-sm mb-1">Dirección de entrega</h3>
              <p class="text-xs text-gray-600 mb-2">${results[0].formatted_address}</p>
              <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full ${isValidAddress ? 'bg-green-500' : 'bg-red-500'}"></span>
                <span class="text-xs ${isValidAddress ? 'text-green-700' : 'text-red-700'}">
                  ${isValidAddress ? 'Zona de entrega válida' : 'Fuera de zona de entrega'}
                </span>
              </div>
            </div>
          `
        })

        newMarker.addListener('click', () => {
          infoWindow.open(map, newMarker)
        })

        // Notificar al componente padre
        if (onValidAddress) {
          onValidAddress(isValidAddress, {
            formatted_address: results[0].formatted_address,
            location: {
              lat: location.lat(),
              lng: location.lng()
            },
            postal_code: foundPostalCode,
            is_in_cdmx: isInCDMX
          })
        }

      } else {
        console.error('Geocoding failed:', status)
        if (onValidAddress) {
          onValidAddress(false)
        }
      }
    })
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error cargando el mapa</p>
          <p className="text-sm text-gray-500">Verifica tu conexión a internet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#B15543] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {!isLoading && (
        <div className="absolute bottom-2 left-2 bg-white rounded-lg shadow-lg p-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Zona de entrega válida</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Fuera de zona de entrega</span>
          </div>
        </div>
      )}
    </div>
  )
}

