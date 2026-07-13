'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Search, Heart, ShoppingCart, Grid3X3, LayoutGrid, Star, Filter, Eye, MapPin, ChevronDown, ChevronRight, ChevronLeft, X, Mic, MicOff } from 'lucide-react'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import Image from 'next/image'
import ProductQuickView from '@/components/ProductQuickView'
import { VoiceSearchIndicator } from '@/components/VoiceSearchIndicator'
import { productos as productosLocal, Product } from '@/data/productos'
import { categoriasSEO, getSEODataByName } from '@/data/categorias'
import { destacadosSemana } from '@/data/destacados'
import { useFavoritos } from '@/hooks/useFavoritos'
import { API_URL } from '@/lib/api'

// TIPOS DEFINIDOS
interface ApiProduct {
  itemcode: string
  nombre: string
  descripcion: string
  categoria?: string
  precio_unitario: string
  stock_actual: number
  unidad_medida?: string
  imagen_url?: string
  productor?: string
  ubicacion?: string
  rating?: number
  reviews?: number
}

interface SearchSuggestionsProps {
  searchTerm: string
  onSelectProduct: (product: { nombre: string }) => void
  productos: Product[]
}

// Helper: imagen de canastas por nombre
function getCanastaImage(nombre: string, original?: string): string {
  // Si tiene imagen en BD, usarla primero
  if (original && original.trim() !== '') return original
  
  // Fallback para canastas sin imagen en BD
  const n = nombre.toLowerCase()
  if (n.includes('canasta basica individual')) return '/images/tienda/CANASTA_BASICA_INDIVIDUAL.jpg'
  if (n.includes('canasta basica media')) return '/images/tienda/CANASTA_BASICA_MEDIA.png'
  if (n.includes('canasta basica familiar')) return '/images/tienda/CANASTA_BASICA_FAMILIAR.png'
  if (n.includes('canasta individual')) return '/images/tienda/canasta-individual-tienda-arca-tierra.jpg'
  if (n.includes('canasta media')) return '/images/tienda/canasta-media-tienda-arca-tierra.jpg'
  if (n.includes('canasta completa')) return '/images/tienda/canasta-completa-tienda-arca-tierra.jpg'
  if (n.includes('canasta familiar')) return '/images/tienda/canasta-familiar-tienda-arca-tierra.jpg'
  
  return '/placeholder-product.jpg'
}

// MAPEO: Itemcodes de BD a IDs de suscripción
const CANASTA_MAP: Record<string, string> = {
  // Canastas normales
  '1885': 'individual',
  '1886': 'media',
  '1887': 'completa',
  '1888': 'familiar',
  // Canastas básicas
  '1889': 'basica-individual',
  '1890': 'basica-media',
  '1891': 'basica-familiar'
}

// Helper: detectar si un producto es canasta
function esCanasta(itemcode: string): boolean {
  // Detecta: 1885, 1886, 1887, 1888, 1889, 1890, 1891 (con o sin U)
  return /^188[5-9]U?$/.test(itemcode) || /^189[0-1]U?$/.test(itemcode)
}

// Helper: obtener itemcode de suscripción (sin U)
function obtenerItemcodeSuscripcion(itemcode: string): string {
  return itemcode.replace('U', '')
}

// Helper: obtener itemcode de compra única (con U)
function obtenerItemcodeCompraUnica(itemcode: string): string {
  return itemcode.endsWith('U') ? itemcode : itemcode + 'U'
}

// Helper: convertir nombres de mayúsculas a sentence case
function toSentenceCase(text: string): string {
  if (!text) return text
  
  // Convertir a minúsculas y luego capitalizar primera letra de cada palabra importante
  return text.toLowerCase()
    .split(' ')
    .map(word => {
      // Palabras que deben permanecer en minúsculas (preposiciones, artículos)
      const lowercaseWords = ['de', 'del', 'la', 'el', 'y', 'en', 'con', 'para', 'por', 'a', 'al']
      if (lowercaseWords.includes(word)) {
        return word
      }
      // Capitalizar primera letra
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
    // Asegurar que la primera palabra siempre esté capitalizada
    .replace(/^\w/, c => c.toUpperCase())
}

// Componente para las sugerencias de búsqueda
const SearchSuggestions = ({ searchTerm, onSelectProduct, productos }: SearchSuggestionsProps) => {
  const [apiSuggestions, setApiSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // 🎯 MEJORA: Cargar sugerencias inteligentes desde API
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 2) {
        setLoadingSuggestions(true)
        try {
          const response = await fetch(`${API_URL}/api/products/search/suggestions?q=${encodeURIComponent(searchTerm)}`)
          if (response.ok) {
            const suggestions = await response.json()
            setApiSuggestions(suggestions)
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        } finally {
          setLoadingSuggestions(false)
        }
      } else {
        setApiSuggestions([])
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300) // Debounce 300ms
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Fallback: productos locales si API no disponible
  const filteredProducts = productos.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  const recentSearches = ['jitomate', 'aguacate', 'espinacas', 'chía', 'quinoa']
  const popularSearches = ['orgánico', 'verduras frescas', 'frutas de temporada', 'granos integrales', 'aceites naturales']

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
      {/* Sugerencias inteligentes desde API */}
      {searchTerm && (
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            {loadingSuggestions ? 'Buscando...' : 'Sugerencias inteligentes'}
          </h4>
          
          {loadingSuggestions && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#33503E]"></div>
            </div>
          )}
          
          {!loadingSuggestions && apiSuggestions.length > 0 && (
            <div className="space-y-2">
              {apiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSelectProduct({ nombre: suggestion.texto })}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {suggestion.tipo === 'producto' ? '🥬' : '📂'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {suggestion.texto}
                    </p>
                    <p className="text-sm text-gray-500">
                      {suggestion.tipo === 'producto' && suggestion.precio > 0 ? 
                        `$${suggestion.precio.toFixed(2)} • ${suggestion.categoria}` : 
                        suggestion.categoria
                      }
                    </p>
                  </div>
                  {suggestion.tipo === 'categoria' && (
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Categoría
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {!loadingSuggestions && searchTerm.length >= 2 && apiSuggestions.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                No se encontraron sugerencias para "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Búsquedas recientes */}
      {!searchTerm && recentSearches.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Búsquedas recientes
          </h4>
          <div className="space-y-1">
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => onSelectProduct({ nombre: term })}
                className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-sm text-gray-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Búsquedas populares */}
      {!searchTerm && popularSearches.length > 0 && (
        <div className="p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Búsquedas populares
          </h4>
          <div className="space-y-1">
            {popularSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => onSelectProduct({ nombre: term })}
                className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-sm text-gray-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {searchTerm && filteredProducts.length === 0 && (
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
  )
}

// Helper to convert slug to Title Case
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Define a mapping from category name/slug to emoji
const categoryEmojiMap: { [key: string]: string } = {
  // Por nombre completo (como vienen de la BD)
  'Canastas agroecológicas': '🧺',
  'Café, cacao y chocolate': '☕',
  'Especias y Condimentos': '🌶️',
  'Endulzantes naturales': '🍯',
  'Frutas y Verduras': '🥕',
  'Granos y Cereales': '🌾',
  'Huevo y lácteos': '🥚',
  'Infusiones Naturales': '🍵',
  'Maíz': '🌽',
  'Mermeladas y untables naturales': '🍓',
  'Harinas y pastas orgánicas': '🍝',
  'Pan y galletas artesanales': '🥖',
  'Proteínas Regenerativas': '🥩',
  // Por slug (para URLs)
  'canastas-agroecologicas': '🧺',
  'cafe-cacao-chocolate': '☕',
  'especias-condimentos': '🌶️',
  'endulzantes-naturales': '🍯',
  'frutas-verduras': '🥕',
  'granos-cereales': '🌾',
  'huevo-lacteos': '🥚',
  'infusiones-naturales': '🍵',
  'maiz': '🌽',
  'mermeladas-untables': '🍓',
  'harinas-pastas': '🍝',
  'pan-galletas': '🥖',
  'proteinas-regenerativas': '🥩',
  'verduras': '🥬',
  'frutas': '🍎',
  'sin-categoria': '📦'
};

// Productores se generarán dinámicamente de los productos reales

// Schema.org JSON-LD para rich snippets
const storeStructuredData = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Arca Tierra",
  "alternateName": "Tienda Arca Tierra",
  "description": "Tienda de alimentos agroecológicos 100% mexicanos con trazabilidad completa. Productos directos de agricultores de Xochimilco, Huasca de Ocampo y Amanalco.",
  "url": "https://arcatierra.com/tienda",
  "logo": {
    "@type": "ImageObject",
    "url": "https://arcatierra.com/images/logo-arca-tierra.png",
    "width": 400,
    "height": 400
  },
  "image": [
    "https://arcatierra.com/images/tienda-portada.jpg",
    "https://arcatierra.com/images/productores-xochimilco.jpg",
    "https://arcatierra.com/images/canastas-frescas.jpg"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ciudad de México",
    "addressRegion": "CDMX",
    "addressCountry": "MX",
    "postalCode": "03100"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 19.432608,
    "longitude": -99.133209
  },
  "telephone": "+52 55 1234 5678",
  "email": "hola@arcatierra.com",
  "openingHours": "Mo-Fr 07:00-18:00",
  "paymentAccepted": "Cash, Credit Card, Debit Card, Bank Transfer",
  "currenciesAccepted": "MXN",
  "priceRange": "$$",
  "sameAs": [
    "https://www.instagram.com/arcatierra",
    "https://www.facebook.com/arcatierra",
    "https://twitter.com/arcatierra"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Catálogo de Productos Agroecológicos",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Canastas de Temporada",
        "description": "Canastas de frutas y verduras agroecológicas de productores locales"
      },
      {
        "@type": "OfferCatalog", 
        "name": "Productos a Granel",
        "description": "Granos, aceites, especias y productos orgánicos al peso"
      }
    ]
  },
  "makesOffer": {
    "@type": "Offer",
    "name": "Entrega a domicilio CDMX",
    "description": "Entrega gratuita en Ciudad de México de lunes a viernes",
    "areaServed": "Ciudad de México, México",
    "availableDeliveryMethod": "OnSitePickup"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "bestRating": "5",
    "ratingCount": "127"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "María González"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "La calidad es impresionante. Realmente puedes notar la diferencia en sabor y frescura. Saber que viene directamente del agricultor me da mucha confianza."
    }
  ]
};

// Schema.org para organización y red de productores
const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Red Arca Tierra",
  "alternateName": "Arca Tierra",
  "description": "Red de agricultura regenerativa que conecta a más de 60 familias campesinas con consumidores conscientes en Ciudad de México.",
  "url": "https://arcatierra.com",
  "logo": "https://arcatierra.com/images/logo-arca-tierra.png",
  "foundingDate": "2019",
  "founders": {
    "@type": "Person",
    "name": "Equipo Arca Tierra"
  },
  "numberOfEmployees": "10-50",
  "knowsAbout": [
    "Agricultura Agroecológica",
    "Comercio Justo",
    "Sustentabilidad Alimentaria",
    "Hiperlocalidad",
    "Trazabilidad de Alimentos"
  ],
  "memberOf": {
    "@type": "Organization",
    "name": "Red de Agricultura Regenerativa de México"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 19.432608,
      "longitude": -99.133209
    },
    "geoRadius": "500000"
  }
};

function TiendaPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 200])
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [selectedProductores, setSelectedProductores] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'1' | '2' | '3'>('2')
  const [cartItems, setCartItems] = useState<any[]>([])
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [productoQuickView, setProductoQuickView] = useState<Product | null>(null)
  const toast = useToast()
  const [sortBy, setSortBy] = useState('mas-recientes')
  const [showFavorites, setShowFavorites] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isDesktopFiltersCollapsed, setIsDesktopFiltersCollapsed] = useState(false)
  
  // Hook de favoritos conectado al backend
  const { favoritos: favorites, toggleFavorito: toggleFavoritoHook, esFavorito } = useFavoritos()
  
  // 🎤 NUEVO: Hook de búsqueda por voz
  const {
    isListening,
    transcript,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceSearch((voiceText: string) => {
    console.log('🔍 Búsqueda por voz completada:', voiceText)
    setSearchTerm(voiceText)
    setShowSearchSuggestions(true)
    toast.success(`Buscando "${voiceText}"`, {
      title: '🎤 Búsqueda por voz'
    })
  })
  
  // NUEVO: Estado para productos de la API
  const [productos, setProductos] = useState<Product[]>(productosLocal)
  const [isLoading, setIsLoading] = useState(true)
  const [apiCategories, setApiCategories] = useState<any[]>([])
  const [preciosCompraUnica, setPreciosCompraUnica] = useState<Record<string, number>>({})

  // NUEVO: Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const apiUrl = API_URL
        
        // Cargar productos
        const response = await fetch(`${apiUrl}/api/products?limit=200`)
        if (response.ok) {
          const data = await response.json()
          
          // Mapear productos de la API al formato local
          const mappedProducts: Product[] = data.items.map((item: ApiProduct) => ({
            id: item.itemcode,
            nombre: toSentenceCase(item.nombre),
            categoria: item.categoria || 'sin-categoria',
            precio: parseFloat(item.precio_unitario),
            imagen: item.imagen_url || '',
            descripcion: item.descripcion || '',
            stock: item.stock_actual,
            unidad: item.unidad_medida || '',
            productor: item.productor || 'Agricultor Local',
            ubicacion: item.ubicacion || 'México',
            // Solo mostrar badge "Agotado" cuando stock = 0, no mostrar "Disponible"
            badges: item.stock_actual === 0 ? ['Agotado'] : [],
            rating: item.rating || 4.5,
            reviews: item.reviews || 0,
            metricas: {
              co2: '0kg CO2',
              agua: '0L',
              plastico: '0% plástico'
            },
            storytelling: item.descripcion || 'Producto fresco y local',
            ctaType: 'add' as const
          }))
          
          // Separar canastas: crear mapa de precios de compra única
          const preciosCompraUnicaMap: Record<string, number> = {}
          const productosFiltrados: Product[] = []
          
          mappedProducts.forEach(product => {
            if (esCanasta(product.id)) {
              if (product.id.endsWith('U')) {
                // Es versión de compra única - guardar precio
                const itemcodeSusc = product.id.replace('U', '')
                preciosCompraUnicaMap[itemcodeSusc] = product.precio
              } else {
                // Es versión de suscripción - agregar a la lista
                productosFiltrados.push(product)
              }
            } else {
              // No es canasta - agregar directamente
              productosFiltrados.push(product)
            }
          })
          
          setPreciosCompraUnica(preciosCompraUnicaMap)
          setProductos(productosFiltrados)
          console.log(`Cargados ${mappedProducts.length} productos desde la API`)
        } else {
          console.error('Error cargando productos de la API, usando productos locales')
          setProductos(productosLocal)
        }

        // Cargar categorías
        const catResponse = await fetch(`${apiUrl}/api/products/categories`)
        if (catResponse.ok) {
          const catData = await catResponse.json()
          setApiCategories(catData.categories || [])
        }
        
      } catch (error) {
        console.error('Error conectando con la API:', error)
        setProductos(productosLocal)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Leer parámetro 'categoria' de URL y aplicar filtro automáticamente
  useEffect(() => {
    const categoriaParam = searchParams.get('categoria')
    if (categoriaParam) {
      // Aplicar filtro de categoría desde URL
      setSelectedCategory(categoriaParam)
      console.log('✅ Filtro de categoría aplicado desde URL:', categoriaParam)
    }
  }, [searchParams])

  // Generar categorías dinámicamente basado en productos actuales
  const categorySlugs = [...new Set(
    productos
      .map(p => p.categoria)
      .filter(c => {
        // Filtrar nulls, vacíos y cualquier variante de "sin categoría"
        if (!c || c === 'null' || c.trim() === '') return false;
        const lower = c.toLowerCase().trim();
        return lower !== 'sin categoría' && 
               lower !== 'sin categoria' && 
               lower !== 'sin-categoria' &&
               lower !== 'sin categoria';
      })
  )];
  
  const categories = [
    { id: 'all', name: 'Todas las categorías', emoji: '🌱', active: true, seoData: null },
    ...categorySlugs.map(categoryName => {
      // Buscar emoji por nombre completo primero, luego por slug
      const emoji = categoryEmojiMap[categoryName] || categoryEmojiMap[slugToTitle(categoryName)] || '🛒';
      return {
        id: categoryName,
        name: categoryName,
        emoji: emoji,
        active: false,
        seoData: getSEODataByName(categoryName)
      };
    })
  ];

  // Generar productores dinámicamente de los productos reales
  const productores = [...new Set(
    productos
      .map(p => p.productor)
      .filter(p => p && p.trim() !== '')
  )].sort();

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('arcaTierraCart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }

    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('arcaTierraCart')
      if (updatedCart) {
        setCartItems(JSON.parse(updatedCart))
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // Listener global para abrir/cerrar filtros en móvil
  useEffect(() => {
    const handleToggleFilters = () => setShowMobileFilters(prev => !prev)
    window.addEventListener('toggleFiltersSidebar', handleToggleFilters)
    return () => window.removeEventListener('toggleFiltersSidebar', handleToggleFilters)
  }, [])

  // Cerrar drawer con Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMobileFilters(false)
    }
    if (showMobileFilters) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showMobileFilters])

  // Cargar filtros guardados
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arcaTierraFilters')
      if (saved) {
        const f = JSON.parse(saved)
        if (f.selectedCategory) setSelectedCategory(f.selectedCategory)
        if (typeof f.precioMin === 'string') setPrecioMin(f.precioMin)
        if (typeof f.precioMax === 'string') setPrecioMax(f.precioMax)
        if (Array.isArray(f.selectedProductores)) setSelectedProductores(f.selectedProductores)
        if (f.sortBy) setSortBy(f.sortBy)
      }
    } catch {}
  }, [])

  // Guardar filtros
  const saveFilters = (closeAfter?: boolean) => {
    try {
      const data = {
        selectedCategory,
        precioMin,
        precioMax,
        selectedProductores,
        sortBy,
      }
      localStorage.setItem('arcaTierraFilters', JSON.stringify(data))
    } catch {}
    if (closeAfter) setShowMobileFilters(false)
  }

  // Cuerpo reutilizable de filtros
  const FiltersBody = () => (
    <>
      {/* Categorías */}
      <div>
        <h3 className="text-white font-semibold mb-2 lg:mb-3 text-sm sm:text-base">Categorías</h3>
        <div className="space-y-1 sm:space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-left transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#B15543] text-white'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <span className="text-xs sm:text-sm">{category.emoji}</span>
              <span className="text-xs sm:text-sm lg:text-sm truncate">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FILTROS DESHABILITADOS - Ahora usamos filtros horizontales arriba */}
      {/* 
      RANGO DE PRECIO Y AGRICULTORES COMENTADOS
      Estos filtros fueron reemplazados por filtros horizontales tipo pills
      ubicados arriba de los productos para mejor UX.
      
      Si deseas reactivarlos:
      1. Descomentar este bloque completo
      2. Restaurar los estados precioMin, precioMax, selectedProductores en el filtrado
      3. Considerar si quieres tener ambos (horizontal + lateral) o solo uno
      */}
      
      {/*
      <div>
        <h3 className="text-white font-semibold mb-2 lg:mb-3 text-sm sm:text-base">Rango de Precio</h3>
        <div className="space-y-2 sm:space-y-3">
          <Input
            type="number"
            placeholder="Precio mínimo"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder-white/60 text-xs sm:text-sm h-8 sm:h-10"
          />
          <Input
            type="number"
            placeholder="Precio máximo"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder-white/60 text-xs sm:text-sm h-8 sm:h-10"
          />
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-2 lg:mb-3 text-sm sm:text-base">Agricultores</h3>
        <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
          {productores.map((productor) => (
            <label key={productor} className="flex items-center space-x-2 text-white/90 hover:text-white cursor-pointer">
              <Checkbox
                checked={selectedProductores.includes(productor)}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    setSelectedProductores([...selectedProductores, productor])
                  } else {
                    setSelectedProductores(selectedProductores.filter(p => p !== productor))
                  }
                }}
                className="border-white/30 data-[state=checked]:bg-[#B15543] data-[state=checked]:border-[#B15543]"
              />
              <span className="text-xs sm:text-sm text-white/90 truncate">{productor}</span>
            </label>
          ))}
        </div>
      </div>
      */}

    </>
  )

  // Filtros funcionales - AHORA USA productos del estado
  const filteredProducts = productos.filter(product => {
    // Si estamos mostrando favoritos, solo mostrar productos favoritos
    if (showFavorites) {
      return favorites.includes(product.id);
    }
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory
    
    // Filtros de precio y productor DESHABILITADOS (ahora usamos ordenamiento en filtros horizontales)
    // const minPrice = precioMin ? parseFloat(precioMin) : 0
    // const maxPrice = precioMax ? parseFloat(precioMax) : 999999
    // const matchesPrice = product.precio >= minPrice && product.precio <= maxPrice
    // const matchesProductor = selectedProductores.length === 0 || selectedProductores.includes(product.productor)
    
    return matchesSearch && matchesCategory
  })

  // Ordenamiento funcional
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'precio-menor':
        return a.precio - b.precio
      case 'precio-mayor':
        return b.precio - a.precio
      case 'nombre-az':
        return a.nombre.localeCompare(b.nombre)
      case 'nombre-za':
        return b.nombre.localeCompare(a.nombre)
      case 'mas-recientes':
      default:
        return 0
    }
  })

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const activeCategory = categories.find(cat => cat.id === selectedCategory)

  // Función para obtener la clase de badge según el tipo
  const getBadgeClass = (badge: string) => {
    switch (badge) {
      case 'Nuevo':
        return 'bg-[#B15543] hover:bg-[#9d4a39]'
      case 'Orgánico':
        return 'bg-[#33503E] hover:bg-[#2a4234]'
      case 'Destacado':
        return 'bg-amber-500 hover:bg-amber-600'
      case 'Artesanal':
        return 'bg-purple-600 hover:bg-purple-700'
      case 'Disponible':
        return 'bg-green-600 hover:bg-green-700'
      case 'Agotado':
        return 'bg-red-600 hover:bg-red-700'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  // Navegar al detalle del producto
  const goToProductDetail = (productId: string) => {
    router.push(`/producto/${productId}`)
  }

  // Marcar/desmarcar favoritos con backend API y notificaciones
  const toggleFavorite = async (productId: string, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
    
    // Obtener nombre del producto para las notificaciones
    const producto = productos.find(p => p.id === productId)
    const nombreProducto = producto?.nombre || 'Producto'
    
    const { agregado, exito } = await toggleFavoritoHook(productId)
    
    if (exito) {
      if (agregado) {
        // Agregado a favoritos
        toast.success(`${nombreProducto} agregado a favoritos`, {
          title: '¡Agregado!',
          action: {
            label: 'Ver favoritos',
            onClick: () => router.push('/favoritos')
          }
        })
      } else {
        // Eliminado de favoritos
        toast.error(`${nombreProducto} eliminado de favoritos`, {
          title: 'Favorito eliminado'
        })
      }
    } else {
      // Error
      toast.error('No se pudo actualizar favoritos. Inténtalo de nuevo.', {
        title: 'Error'
      })
    }
  }

  // Abrir vista rápida
  const openQuickView = (product: Product, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
    setProductoQuickView({ ...product, imagen: getCanastaImage(product.nombre, product.imagen) })
  }

  // Agregar al carrito y mostrar toast
  const addToCart = (product: Product, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
    
    // CRÍTICO: Usar itemcode real de BD (no UUID)
    const cartItem = {
      id: product.id,        // itemcode de BD (ej: "1887", "MAZ-TOR-BLA-12P")
      itemcode: product.id,  // Mismo valor para compatibilidad
      name: product.nombre,
      price: product.precio,
      quantity: 1,
      image: product.imagen,
      unit: product.unidad,
      tipo: 'producto'       // Si no es experiencia, es producto
    }
    const existingCart = JSON.parse(localStorage.getItem('arcaTierraCart') || '[]')
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id)
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1
    } else {
      existingCart.push(cartItem)
    }
    localStorage.setItem('arcaTierraCart', JSON.stringify(existingCart))
    setCartItems(existingCart)
    window.dispatchEvent(new Event('cartUpdated'))
    // Toast deshabilitado - era molesto al agregar múltiples productos
    // toast.cart(`${product.nombre} agregado al carrito`, {
    //   title: '¡Excelente elección!',
    //   action: {
    //     label: 'Ver carrito',
    //     onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
    //   }
    // })
  }

  // Manejar redirección a suscripciones con pre-carga
  const handleSuscripcion = (product: Product) => {
    const itemcodeSuscripcion = obtenerItemcodeSuscripcion(product.id)
    const canastaId = CANASTA_MAP[itemcodeSuscripcion]
    
    if (canastaId) {
      // Construir URL con parámetros
      const params = new URLSearchParams({
        canasta: canastaId,
        itemcode: itemcodeSuscripcion,
        precarga: 'true'
      })
      
      router.push(`/suscripciones?${params.toString()}`)
    } else {
      // Fallback: redirigir sin parámetros
      router.push('/suscripciones')
    }
  }

  // Productos destacados de la semana - ahora usando productos del estado
  const featuredProducts = destacadosSemana
    .map(id => productos.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p))

  return (
    <div className="min-h-screen bg-[#F5F2E8] pt-20">
      {/* JSON-LD Structured Data para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      {/* Header responsivo y centrado - con fondo sólido forzado (sin transparencia) */}
      <div className="w-full !bg-[#33503E] text-white shadow-md relative z-10" style={{backgroundColor: '#33503E', opacity: 1}}>
        <div className="container mx-auto px-4 py-8">

          <div className="text-center">
            <h1 className="text-3xl font-semibold text-white mb-4">Tienda de alimentos</h1>
            <p className="text-white text-base mb-8 max-w-3xl mx-auto">
              Alimentos agroecológicos 100% mexicanos — compra directa o por suscripción
            </p>
            
            {/* Indicador de carga desde API */}
            {isLoading && (
              <div className="mb-4 text-white/80">
                <span>Cargando productos frescos...</span>
              </div>
            )}
            
            {/* CTAs para Canastas Agroecológicas y Recetas */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/suscripciones">
                <Button 
                  size="lg" 
                  className="bg-terracota hover:bg-terracota-dark text-white px-8 py-4 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🌱 Canastas Agroecológicas
                </Button>
              </Link>
              
              <Link href="/recetas">
                <Button 
                  size="lg" 
                  className="bg-verde-principal hover:bg-verde-dark text-white border-2 border-white px-8 py-4 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  📖 Ver Recetas
                </Button>
              </Link>
            </div>
            
            {/* Buscador - alineado con el ancho de los cards de productos */}
            <div className="relative max-w-7xl mx-auto">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                
                <Input
                  type="text"
                  placeholder={isListening ? "Escuchando... 🎤" : transcript ? transcript : "Busca alimentos frescos, agricultores..."}
                  value={isListening ? transcript : searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className={`pl-12 pr-16 py-4 text-base bg-white border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-white focus:ring-opacity-50 text-black placeholder:text-gray-500 caret-black ${
                    isListening ? 'ring-2 ring-red-400 bg-red-50' : ''
                  }`}
                />

                {/* 🎤 NUEVO: Botón de micrófono */}
                {voiceSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isListening ? 'Detener grabación' : 'Búsqueda por voz'}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* Indicador visual de escucha */}
                {isListening && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-bounce">
                      🔴 Escuchando...
                    </div>
                  </div>
                )}
              </div>
              {showSearchSuggestions && (
                <SearchSuggestions 
                  searchTerm={searchTerm}
                  onSelectProduct={(product: { nombre: string }) => {
                    setSearchTerm(product.nombre)
                    setShowSearchSuggestions(false)
                  }}
                  productos={productos}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Botón flotante móvil para abrir filtros */}
        {!showMobileFilters && (
          <button
            onClick={() => setShowMobileFilters(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 bg-[#33503E] text-white px-2 py-5 rounded-r-lg shadow-lg z-[9990] flex lg:hidden flex-col items-center gap-2"
            aria-label="Abrir filtros"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="font-medium [writing-mode:vertical-lr] rotate-180 my-2">Filtros</span>
          </button>
        )}

        {/* Botón flotante desktop cuando colapsado - para ABRIR filtros */}
        {isDesktopFiltersCollapsed && (
          <button
            onClick={() => setIsDesktopFiltersCollapsed(false)}
            className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 bg-[#33503E] text-white px-2 py-5 rounded-r-lg shadow-lg z-[9990] flex-col items-center gap-2 hover:bg-[#2a4032] transition-colors"
            aria-label="Mostrar filtros"
            title="Abrir filtros"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="font-medium [writing-mode:vertical-lr] rotate-180 my-2">Filtros</span>
          </button>
        )}

        {/* Drawer móvil de filtros */}
        {showMobileFilters && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="fixed left-0 top-0 h-screen w-80 bg-[#33503E] shadow-xl z-[9999] lg:hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-white text-base font-semibold flex items-center gap-2"><Filter className="w-5 h-5"/>Filtros</h2>
                <div className="flex items-center gap-2">
                  <Button onClick={() => saveFilters(true)} size="sm" className="bg-[#B15543] hover:bg-[#9d4a39] text-white px-3 py-1.5">
                    Guardar
                  </Button>
                  <button onClick={() => setShowMobileFilters(false)} className="text-white/80 hover:text-white" aria-label="Cerrar filtros">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-6">
                <FiltersBody />
              </div>
              <div className="p-4 border-t border-white/20">
                <Button onClick={() => saveFilters(true)} className="w-full bg-[#B15543] hover:bg-[#9d4a39] text-white">Aplicar filtros</Button>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 sm:gap-4 lg:gap-6 sm:p-8 max-w-7xl mx-auto">
          {/* Sidebar de filtros - oculto en móvil, colapsable en desktop */}
          {!isDesktopFiltersCollapsed && (
            <div className="hidden lg:block w-44 sm:w-52 lg:w-80 bg-[#33503E] rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto lg:sticky lg:top-6 shadow-lg flex-shrink-0 relative">
              {/* Botón minimizar estilo pestaña vertical */}
              {/* Botón para CERRAR filtros (cuando están abiertos) */}
              <button
                onClick={() => setIsDesktopFiltersCollapsed(true)}
                className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-[#33503E] text-white px-2 py-5 rounded-l-lg shadow-lg z-[10000] flex-col items-center gap-2 border border-white/10 hover:bg-[#2a4032] transition-colors"
                aria-label="Minimizar filtros"
                title="Cerrar filtros"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium [writing-mode:vertical-lr] rotate-180 my-2">Filtros</span>
              </button>

              <div className="absolute right-2 top-2 flex items-center gap-2">
                <Button onClick={() => saveFilters(false)} size="sm" className="bg-[#B15543] hover:bg-[#9d4a39] text-white px-3 py-1.5">Guardar</Button>
              </div>
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="text-center">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1 lg:mb-2">Filtros</h2>
                  <p className="text-white/70 text-xs sm:text-sm hidden sm:block">Encuentra tus alimentos</p>
                </div>
                <FiltersBody />
              </div>
            </div>
          )}

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Header de resultados */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              {/* Tabs para alternar entre Tienda y Favoritos */}
              <div className="flex flex-wrap gap-2 sm:gap-4 order-2 lg:order-1">
                <button 
                  className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base ${!showFavorites ? 'bg-[#33503E] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setShowFavorites(false)}
                >
                  Tienda
                </button>
                <button 
                  className={`px-3 sm:px-4 py-2 rounded-md flex items-center space-x-1 text-sm sm:text-base ${showFavorites ? 'bg-[#B15543] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setShowFavorites(true)}
                >
                  <Heart size={16} className={`sm:w-[18px] sm:h-[18px] ${showFavorites ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">Favoritos {favorites.length > 0 && `(${favorites.length})`}</span>
                  <span className="sm:hidden">❤️ {favorites.length > 0 && `(${favorites.length})`}</span>
                </button>
              </div>
              
              <div className="text-center lg:text-left order-1 lg:order-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#33503E] mb-1">
                  {showFavorites ? 'Mis Favoritos' : activeCategory?.name || 'Productos'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {sortedProducts.length} alimentos encontrados
                  {!isLoading && productos.length > 0 && productos[0].id.startsWith('P') && (
                    <span className="text-xs text-green-600 ml-2">(desde tu base de datos)</span>
                  )}
                </p>
              </div>
              
              {/* FILTROS HORIZONTALES - Nuevo diseño tipo pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3 order-3 w-full lg:w-auto">
                {/* Filtro: Categorías */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B15543] hover:border-[#B15543] transition-colors cursor-pointer"
                  >
                    <option value="all">📂 Todas las categorías</option>
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Filtro: Precio */}
                <div className="relative">
                  <select
                    value={sortBy.startsWith('precio') ? sortBy : ''}
                    onChange={(e) => e.target.value && setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B15543] hover:border-[#B15543] transition-colors cursor-pointer"
                  >
                    <option value="">💵 Precio</option>
                    <option value="precio-menor">Menor a mayor</option>
                    <option value="precio-mayor">Mayor a menor</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Filtro: Nombre */}
                <div className="relative">
                  <select
                    value={sortBy.startsWith('nombre') ? sortBy : ''}
                    onChange={(e) => e.target.value && setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B15543] hover:border-[#B15543] transition-colors cursor-pointer"
                  >
                    <option value="">🔤 Nombre</option>
                    <option value="nombre-az">A-Z</option>
                    <option value="nombre-za">Z-A</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Selector de vista */}
              <div className="flex items-center gap-3 order-4">
                
                <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg p-1 shadow-sm w-full sm:w-auto justify-center">
                  <Button
                    variant={viewMode === '1' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('1')}
                    className={`${viewMode === '1' ? 'bg-[#B15543] text-white' : 'text-gray-600'} px-2 sm:px-3`}
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border border-current rounded" />
                  </Button>
                  <Button
                    variant={viewMode === '2' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('2')}
                    className={`${viewMode === '2' ? 'bg-[#B15543] text-white' : 'text-gray-600'} px-2 sm:px-3`}
                  >
                    <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant={viewMode === '3' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('3')}
                    className={`${viewMode === '3' ? 'bg-[#B15543] text-white' : 'text-gray-600'} px-2 sm:px-3`}
                  >
                    <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Estado de carga */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#B15543]"></div>
                <p className="mt-4 text-gray-600">Cargando productos desde la API...</p>
              </div>
            )}

            {/* Mensaje cuando no hay favoritos */}
            {!isLoading && showFavorites && sortedProducts.length === 0 && (
              <div className="w-full p-6 sm:p-8 text-center bg-white rounded-xl shadow-md">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Heart size={64} className="text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700">No tienes productos favoritos</h3>
                  <p className="text-gray-500">Explora nuestra tienda y marca productos como favoritos para verlos aquí</p>
                  <Button 
                    onClick={() => setShowFavorites(false)} 
                    className="mt-4 bg-[#33503E] hover:bg-[#2a4234] text-white"
                  >
                    Explorar tienda
                  </Button>
                </div>
              </div>
            )}
            
            {/* Grid de productos */}
            {!isLoading && (!showFavorites || (showFavorites && sortedProducts.length > 0)) && (
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === '1' 
                  ? 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-1' 
                  : viewMode === '2'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
                  : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-[#E3DBCB] overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => goToProductDetail(product.id)}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Imagen del producto */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={getCanastaImage(product.nombre, product.imagen) || '/placeholder-product.jpg'}
                      alt={product.nombre}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {product.badges.map((badge, index) => (
                        <Badge
                          key={index}
                          className={`${getBadgeClass(badge)} text-white font-medium px-2 py-1 text-xs shadow-sm`}
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Botón de favorito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(product.id, e)
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
                        favorites.includes(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Solo botón vista rápida en hover */}
                    {hoveredProduct === product.id && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Button
                          onClick={(e) => openQuickView(product, e)}
                          className="bg-[#33503E] hover:bg-[#2a4234] text-white"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Vista rápida
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="p-4">
                    {/* 
                    ========================================
                    TRAZABILIDAD COMENTADA - Ubicación del productor
                    ========================================
                    Esta sección muestra la ubicación del productor.
                    Está comentada temporalmente porque no tenemos toda la información.
                    
                    PARA REACTIVAR:
                    1. Descomentar el bloque de código abajo
                    2. Asegurarse de que los productos tengan datos de 'productor' y 'ubicacion'
                    3. El icono MapPin ya está importado en lucide-react
                    
                    <div className="flex items-center gap-1 text-[#33503E] mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {product.productor}, {product.ubicacion}
                      </span>
                    </div>
                    ========================================
                    */}

                    {/* Nombre del producto */}
                    <h3 className="font-medium text-[#33503E] mb-1 line-clamp-2">
                      {product.nombre.replace(/SUSCRIPCIÓN|SUSCRIPCION|COMPRA ÚNICA/gi, '').trim()}
                    </h3>

                    {/* Descripción */}
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.descripcion}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-gray-500 text-sm">({product.reviews})</span>
                    </div>

                    {/* 
                    ========================================
                    TRAZABILIDAD COMENTADA - Métricas ambientales
                    ========================================
                    Esta sección muestra CO2, agua y plástico ahorrado.
                    Está comentada temporalmente porque no tenemos datos reales.
                    
                    PARA REACTIVAR:
                    1. Descomentar el bloque de código abajo
                    2. Asegurarse de que los productos tengan datos en 'metricas'
                       con las propiedades: co2, agua, plastico
                    3. Los emojis 🌱💧♻️ se usan como iconos
                    
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3 bg-[#F5F2E8] rounded-lg p-2">
                      <div className="flex items-center gap-1">
                        <span>🌱</span>
                        <span>{product.metricas.co2}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💧</span>
                        <span>{product.metricas.agua}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>♻️</span>
                        <span>{product.metricas.plastico}</span>
                      </div>
                    </div>
                    ========================================
                    */}

                    {/* Precio y botones - DUAL PRICING para canastas */}
                    {esCanasta(product.id) ? (
                      /* CANASTA: Mostrar dos opciones (Compra Única + Suscripción) */
                      <div className="space-y-3 border-t border-gray-200 pt-3">
                        {/* Opción 1: Compra Única */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="text-xs text-gray-600 font-medium">Compra Única</div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-[#B15543]">
                                  ${(preciosCompraUnica[product.id] || product.precio).toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500">/ {product.unidad}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Crear producto con itemcode de compra única (con U)
                              const productCompraUnica = {
                                ...product,
                                id: obtenerItemcodeCompraUnica(product.id),
                                precio: preciosCompraUnica[product.id] || product.precio
                              }
                              addToCart(productCompraUnica, e)
                            }}
                            className="w-full bg-[#B15543] hover:bg-[#9d4a39] text-white"
                            size="sm"
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                          </Button>
                        </div>

                        {/* Opción 2: Suscripción */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-green-700 font-medium">Suscripción</span>
                                <Badge className="bg-green-600 text-white text-xs px-2 py-0">Ahorra 5%</Badge>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-green-800">
                                  ${product.precio.toFixed(2)}
                                </span>
                                <span className="text-xs text-green-600">/ semana</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSuscripcion(product)
                            }}
                            variant="outline"
                            className="w-full border-green-600 text-green-700 hover:bg-green-100"
                            size="sm"
                          >
                            📅 Suscribirme
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* PRODUCTO NORMAL: Botón único */
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xl font-semibold text-[#B15543]">
                            ${product.precio.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">/ {product.unidad}</span>
                        </div>
                        <Button
                          onClick={(e) => addToCart(product, e)}
                          className="bg-[#B15543] hover:bg-[#9d4a39] text-white px-4 py-2"
                          size="sm"
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          {product.stock > 0 ? 'Agregar' : 'Agotado'}
                        </Button>
                      </div>
                    )}

                    {/* Stock disponible (si viene de la API) */}
                    {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
                      <p className="text-xs text-orange-600 mb-2">
                        ¡Solo quedan {product.stock} disponibles!
                      </p>
                    )}

                    {/* Storytelling al final con línea */}
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-[#33503E] italic text-xs">
                        "{product.storytelling}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vista rápida modal */}
      {productoQuickView && (
        <ProductQuickView
          isOpen={!!productoQuickView}
          onClose={() => setProductoQuickView(null)}
          product={productoQuickView}
          onAddToCart={(product: Product) => {
            const cartItem = {
              id: product.id,
              itemcode: product.id, // Agregar itemcode
              name: product.nombre,
              price: product.precio,
              quantity: 1,
              image: product.imagen,
              unit: product.unidad,
              tipo: 'producto' // Agregar tipo
            }
            
            const existingCart = JSON.parse(localStorage.getItem('arcaTierraCart') || '[]')
            const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id)
            
            if (existingItemIndex >= 0) {
              existingCart[existingItemIndex].quantity += 1
            } else {
              existingCart.push(cartItem)
            }
            
            localStorage.setItem('arcaTierraCart', JSON.stringify(existingCart))
            setCartItems(existingCart)
            
            // Disparar evento para notificar al header que actualice el contador
            window.dispatchEvent(new Event('cartUpdated'))
            
            // Toast deshabilitado - era molesto al agregar múltiples productos
            // toast.cart(`${product.nombre} agregado al carrito`, {
            //   title: '¡Excelente elección!',
            //   action: {
            //     label: 'Ver carrito',
            //     onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
            //   }
            // })
          }}
          isFavorite={favorites.includes(productoQuickView.id)}
          onToggleFavorite={(productId: string, event: React.MouseEvent) => toggleFavorite(productId, event)}
        />
      )}

      {/* 1. DESTACADOS DE LA SEMANA */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#F5F2E8] to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#33503E] mb-4">
              Destacados de la semana
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Productos frescos seleccionados por nuestros agricultores de Huasca de Ocampo (Hidalgo), Amanalco (Estado de México), Xochimilco (CDMX) y Valles Centrales (Oaxaca)
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 sm:p-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-[#B15543]/10 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                    {product.imagen ? (
                      <Image src={product.imagen} alt={product.nombre} width={64} height={64} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-2xl">🌱</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-[#33503E]">{product.nombre}</h3>
                  {(product.productor || product.ubicacion) ? (
                    <p className="text-gray-600 text-sm mb-3">
                      {[product.productor, product.ubicacion].filter(Boolean).join(' · ')}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm mb-3">{product.categoria.replaceAll('-', ' ')}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#B15543] font-semibold">
                      {product.precio > 0 ? `$${product.precio}${product.unidad ? `/${product.unidad}` : ''}` : '—'}
                    </span>
                    <button onClick={() => goToProductDetail(product.id)} className="bg-[#B15543] text-white px-4 py-2 rounded-lg hover:bg-[#9d4a39] transition-colors">
                      Ver producto
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-600">Pronto publicaremos los destacados.</div>
            )}
          </div>
        </div>
      </section>

      {/* 2. ¿POR QUÉ COMPRAR EN ARCATIERRA.COM? */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#33503E] mb-4">
              ¿Por qué comprar en Arca Tierra?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Cada compra alimenta tu salud, apoya al campo y ayuda a regenerar la tierra. Comer bien también puede cambiar el futuro.
            </p>
          </div>

          {/* SECCIÓN COMENTADA - 6 cards de beneficios
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:p-8">
            ...Frescura, Curaduría, Ahorro, Salud, Logística, Cada compra...
          </div>
          */}
        </div>
      </section>

      {/* 3. INFORMACIÓN DE ENTREGA / LOGÍSTICA */}
      <section className="py-12 md:py-16 bg-[#F5F2E8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#33503E] mb-4">
              Información de entrega
            </h2>
            <p className="text-gray-600">
              Conectamos directamente con nuestras regiones productoras
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:p-8">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#B15543] rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📅</span>
                </div>
                <h3 className="text-xl font-bold text-[#33503E]">Entregas de lunes a viernes</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Nuestro horario de entrega es de 7:00 am a 6:00 pm.
                No contamos con hora exacta, por lo que te pedimos que haya alguien disponible para recibir el pedido.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#B15543] rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">⏰</span>
                </div>
                <h3 className="text-xl font-bold text-[#33503E]">¿Cuándo me llega mi pedido?</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Si haces tu pedido antes de la 1:00 pm, podemos entregarlo al día siguiente hábil.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Pedidos realizados después de la 1:00 pm, pasan al siguiente ciclo de entrega.
              </p>
              <div className="bg-[#F5F2E8] p-4 rounded-lg">
                <p className="text-sm font-medium text-[#33503E] mb-2">Ejemplo:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pides el miércoles, tu entrega será el viernes</li>
                  <li>• Pides el viernes antes de las 12:00 pm, tu entrega será el lunes</li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#B15543] rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📦</span>
                </div>
                <h3 className="text-xl font-bold text-[#33503E]">¿Tienes suscripción y quieres agregar algo?</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Si recibes tu canasta entre lunes y miércoles, puedes agregar alimentos extra el jueves y viernes previos para que lleguen con tu siguiente entrega.
              </p>
            </div>
          </div>

          {/* SECCIÓN COMENTADA - Regiones de origen
          <div className="mt-12 bg-white rounded-xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-xl font-bold text-[#33503E] mb-6 text-center">
              Nuestras regiones productoras
            </h3>
            ...
          </div>
          */}
        </div>
      </section>

      {/* SECCIÓN COMENTADA - 4. CTA SUSCRIPCIÓN
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#B15543] to-[#9d4a39] text-white">
        ...Suscríbete y simplifica tu alimentación...
      </section>
      */}

      {/* SECCIÓN COMENTADA - 5. TESTIMONIOS
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#33503E] mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-gray-600">
              Experiencias reales de familias que forman parte de nuestra red
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:p-8">
            <div className="bg-[#F5F2E8] rounded-xl p-6 sm:p-8">
              <div className="flex mb-4">
                <div className="text-[#B15543]">★★★★★</div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "La calidad es impresionante. Realmente puedes notar la diferencia en sabor y frescura. Saber que viene directamente del agricultor me da mucha confianza."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#B15543] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-[#33503E]">María González</h4>
                  <p className="text-sm text-gray-600">Cliente desde hace 2 años</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F2E8] rounded-xl p-6 sm:p-8">
              <div className="flex mb-4">
                <div className="text-[#B15543]">★★★★★</div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "Mi familia ha cambiado completamente su manera de comer. Los niños ahora piden más verduras. El servicio de suscripción es súper conveniente."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#B15543] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  C
                </div>
                <div>
                  <h4 className="font-bold text-[#33503E]">Carlos Ramírez</h4>
                  <p className="text-sm text-gray-600">Suscriptor familiar</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F2E8] rounded-xl p-6 sm:p-8">
              <div className="flex mb-4">
                <div className="text-[#B15543]">★★★★★</div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "Como chef, puedo decir que la calidad de estos productos es excepcional. La trazabilidad y el respeto por los productores hace toda la diferencia."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#B15543] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-[#33503E]">Ana Morales</h4>
                  <p className="text-sm text-gray-600">Chef profesional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* SECCIÓN COMENTADA - 6. FAQs ESPECÍFICOS
      <section className="py-12 md:py-16 bg-[#F5F2E8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#33503E] mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-gray-600">
              Resolvemos las dudas más comunes sobre nuestros productos y servicio
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg">
              <button className="w-full p-6 text-left hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#33503E]">
                    ¿Qué incluye cada canasta?
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg">
              <button className="w-full p-6 text-left hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#33503E]">
                    ¿Los productos son realmente orgánicos?
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg">
              <button className="w-full p-6 text-left hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#33503E]">
                    ¿Puedo cambiar mi suscripción?
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg">
              <button className="w-full p-6 text-left hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#33503E]">
                    ¿Entregan en toda la Ciudad de México?
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg">
              <button className="w-full p-6 text-left hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#33503E]">
                    ¿Cómo funciona la trazabilidad de productos?
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ¿No encuentras la respuesta que buscas?
            </p>
            <button className="bg-[#B15543] text-white px-8 py-3 rounded-lg hover:bg-[#9d4a39] transition-colors">
              Contactar soporte
            </button>
          </div>
        </div>
      </section>
      */}

      {/* 🎤 NUEVO: Indicador de búsqueda por voz */}
      <VoiceSearchIndicator 
        isListening={isListening}
        transcript={transcript}
        isSupported={voiceSupported}
      />
    </div>
  )
}

// Wrapper con Suspense para useSearchParams
export default function TiendaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B15543] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    }>
      <TiendaPageContent />
    </Suspense>
  )
}