'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import Image from 'next/image'

interface Country {
  code: string
  name: string
  dialCode: string
}

const countries: Country[] = [
  { code: 'MX', name: 'México', dialCode: '+52' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1' },
  { code: 'ES', name: 'España', dialCode: '+34' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'PE', name: 'Perú', dialCode: '+51' },
  { code: 'BR', name: 'Brasil', dialCode: '+55' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502' },
  { code: 'CU', name: 'Cuba', dialCode: '+53' },
  { code: 'DO', name: 'Rep. Dominicana', dialCode: '+1809' },
  { code: 'HN', name: 'Honduras', dialCode: '+504' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { code: 'PA', name: 'Panamá', dialCode: '+507' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591' },
  { code: 'CA', name: 'Canadá', dialCode: '+1' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44' },
  { code: 'FR', name: 'Francia', dialCode: '+33' },
  { code: 'DE', name: 'Alemania', dialCode: '+49' },
  { code: 'IT', name: 'Italia', dialCode: '+39' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'JP', name: 'Japón', dialCode: '+81' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
]

// Función para obtener URL de bandera
const getFlagUrl = (countryCode: string) => 
  `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`

interface CountryCodeSelectorProps {
  value: string
  onChange: (dialCode: string) => void
  className?: string
}

export default function CountryCodeSelector({ value, onChange, className = '' }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Encontrar país seleccionado por dialCode (null si no hay valor)
  const selectedCountry = value ? countries.find(c => c.dialCode === value) : null

  // Filtrar países por búsqueda
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.dialCode.includes(search)
  )

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus en búsqueda al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (country: Country) => {
    onChange(country.dialCode)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#f5f0e8] border border-gray-200 rounded-lg hover:bg-[#ebe5db] transition-colors"
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2">
            <img 
              src={getFlagUrl(selectedCountry.code)} 
              alt={selectedCountry.name}
              className="w-6 h-4 object-cover rounded-sm"
            />
            <span className="font-medium">{selectedCountry.dialCode}</span>
          </span>
        ) : (
          <span className="text-gray-400">Seleccionar</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 min-w-[280px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Búsqueda */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-principal"
              />
            </div>
          </div>

          {/* Lista de países */}
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No se encontraron países
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                    country.dialCode === value ? 'bg-green-50' : ''
                  }`}
                >
                  <img 
                    src={getFlagUrl(country.code)} 
                    alt={country.name}
                    className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                  />
                  <span className="flex-1 text-left text-sm">{country.name}</span>
                  <span className="text-sm text-gray-500 font-medium">{country.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
