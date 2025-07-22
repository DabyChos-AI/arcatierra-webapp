'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Search, Heart, ShoppingCart, Grid3X3, LayoutGrid, Star, Filter, Eye, MapPin, ChevronDown } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import ProductQuickView from '@/components/ProductQuickView'
import { productos, Product, cargarProductosDesdeCSV } from '@/data/productos'

// TIPOS DEFINIDOS

interface SearchSuggestionsProps {
  searchTerm: string
  onSelectProduct: (product: { nombre: string }) => void
}

// Componente para las sugerencias de búsqueda
const SearchSuggestions = ({ searchTerm, onSelectProduct }: SearchSuggestionsProps) => {
  // Productos filtrados basados en el término de búsqueda
  const filteredProducts = productos.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  const recentSearches = ['espinacas', 'jitomate', 'aguacate']
  const popularSearches = ['orgánico', 'verduras frescas', 'frutas de temporada']

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
      {/* Productos encontrados */}
      {searchTerm && filteredProducts.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Productos encontrados
          </h4>
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {product.nombre}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${product.precio.toFixed(2)} / {product.unidad}
                  </p>
                </div>
              </button>
            ))}
          </div>
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

const categories = [
  { id: 'all', name: 'Todas las categorías', emoji: '🌱', active: false },
  { id: 'verduras', name: 'Verduras', emoji: '🥬', active: true },
  { id: 'frutas', name: 'Frutas', emoji: '🍎', active: false },
  { id: 'canastas', name: 'Canastas de Temporada', emoji: '🧺', active: false },
  { id: 'aceites', name: 'Aceites Naturales', emoji: '🫒', active: false },
  { id: 'granos', name: 'Granos y Cereales', emoji: '🌾', active: false },
  { id: 'cafe', name: 'Café y Cacao', emoji: '☕', active: false },
  { id: 'endulzantes', name: 'Endulzantes Naturales', emoji: '🍯', active: false },
  { id: 'especias', name: 'Especias y Condimentos', emoji: '🌶️', active: false },
  { id: 'proteinas', name: 'Proteínas Regenerativas', emoji: '🥩', active: false },
  { id: 'lacteos', name: 'Lácteos Artesanales', emoji: '🧀', active: false },
  { id: 'harinas', name: 'Harinas y Pan', emoji: '🥖', active: false },
  { id: 'infusiones', name: 'Infusiones y Tés', emoji: '🍵', active: false },
  { id: 'mermeladas', name: 'Mermeladas y Untables', emoji: '🍓', active: false },
  { id: 'condimentos', name: 'Condimentos Artesanales', emoji: '🧂', active: false },
  { id: 'tortillas', name: 'Tortillas y Maíz', emoji: '🌽', active: false },
  { id: 'despensa', name: 'Despensa General', emoji: '📦', active: false },
  { id: 'bebidas', name: 'Bebidas Naturales', emoji: '🥤', active: false },
  { id: 'otros', name: 'Otros Productos', emoji: '🌿', active: false }
]

const productores = [
  'Cooperativa Las Flores',
  'Don Roberto Hernández',
  'Familia García',
  'Apiario Las Abejas Felices',
  'Granja Sustentable CDMX',
  'Huerto Urbano Verde'
]

const certificaciones = [
  'Orgánico Certificado',
  'Comercio Justo',
  'Sin Pesticidas',
  'Hidropónico',
  'Biodinámico'
]

// Los productos se cargan desde el layout de servidor

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

export default function TiendaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('verduras')
  const [priceRange, setPriceRange] = useState([0, 200])
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [selectedProductores, setSelectedProductores] = useState<string[]>([])
  const [selectedCertificaciones, setSelectedCertificaciones] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'1' | '2' | '3'>('2')
  const [favorites, setFavorites] = useState<string[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [productoQuickView, setProductoQuickView] = useState<Product | null>(null)
  const toast = useToast()
  const [sortBy, setSortBy] = useState('mas-recientes')
  const [showFavorites, setShowFavorites] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Cargar favoritos y carrito desde localStorage al iniciar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('arcaTierraFavoritos')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

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

  // Filtros funcionales
  const filteredProducts = productos.filter(product => {
    // Si estamos mostrando favoritos, solo mostrar productos favoritos
    if (showFavorites) {
      return favorites.includes(product.id);
    }
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory
    
    // Filtro de precio funcional
    const minPrice = precioMin ? parseFloat(precioMin) : 0
    const maxPrice = precioMax ? parseFloat(precioMax) : 999999
    const matchesPrice = product.precio >= minPrice && product.precio <= maxPrice
    
    const matchesProductor = selectedProductores.length === 0 || selectedProductores.includes(product.productor)
    const matchesCertificaciones = selectedCertificaciones.length === 0 || 
      selectedCertificaciones.some(cert => product.badges.includes(cert) || 
        (cert === 'Orgánico Certificado' && product.badges.includes('100% Orgánico')))
    
    return matchesSearch && matchesCategory && matchesPrice && matchesProductor && matchesCertificaciones
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
      case 'mas-recientes':
      default:
        return 0
    }
  })

  const toggleFavorite = (productId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const product = productos.find(p => p.id === productId)
    if (!product) return
    
    const isFavorite = favorites.includes(productId)
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId]
    
    setFavorites(newFavorites)
    localStorage.setItem('arcaTierraFavoritos', JSON.stringify(newFavorites))
    
    // Mostrar toast
    if (isFavorite) {
      toast.favorite(`${product.nombre} eliminado de favoritos`, {
        title: 'Producto eliminado de favoritos',
        action: {
          label: 'Deshacer',
          onClick: () => {
            const restored = [...favorites.filter(id => id !== productId), productId]
            setFavorites(restored)
            localStorage.setItem('arcaTierraFavoritos', JSON.stringify(restored))
            toast.success(`${product.nombre} restaurado a favoritos`)
          }
        }
      })
    } else {
      toast.favorite(`${product.nombre} añadido a favoritos`, {
        title: 'Producto añadido a favoritos'
      })
    }
  }

  const addToCart = (product: Product, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const cartItem = {
      id: product.id,
      name: product.nombre,
      price: product.precio,
      quantity: 1,
      image: product.imagen,
      unit: product.unidad
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
    
    // Usar el sistema global de toast
    toast.cart(`${product.nombre} agregado al carrito`, {
      title: '¡Excelente elección!',
      action: {
        label: 'Ver carrito',
        onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
      }
    })
    
    // Ya no abrimos el carrito automáticamente para no tapar los toasts y mejorar UX
    // window.dispatchEvent(new Event('toggleCartSidebar'))
  }

  const openQuickView = (product: Product, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setProductoQuickView(product)
  }

  const goToProductDetail = (productId: string) => {
    window.location.href = `/producto/${productId}`
  }

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const activeCategory = categories.find(cat => cat.id === selectedCategory)

  // Función para obtener la clase de badge según el tipo
  const getBadgeClass = (badge: string) => {
    switch (badge) {
      case 'NUEVO':
        return 'bg-[#B15543] hover:bg-[#9d4a39]'
      case '100% Orgánico':
        return 'bg-[#33503E] hover:bg-[#2a4234]'
      case 'Destacado':
        return 'bg-amber-500 hover:bg-amber-600'
      case 'Artesanal':
        return 'bg-purple-600 hover:bg-purple-700'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

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
            <h1 className="text-4xl font-bold text-white mb-4">Tienda de alimentos</h1>
            <p className="text-white text-lg mb-8 max-w-3xl mx-auto">
              Alimentos agroecológicos 100% mexicanos — compra directa o por suscripción
            </p>
            
            {/* CTA para Canastas Agroecológicas */}
            <div className="mb-8">
              <Link href="/suscripciones">
                <Button 
                  size="lg" 
                  className="bg-terracota hover:bg-terracota-dark text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🌱 Canastas Agroecológicas
                </Button>
              </Link>
            </div>
            
            {/* Buscador - alineado con el ancho de los cards de productos */}
            <div className="relative max-w-7xl mx-auto">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Busca productos frescos, productores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className="pl-12 pr-4 py-4 text-lg bg-white border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
              </div>
              {showSearchSuggestions && (
                <SearchSuggestions 
                  searchTerm={searchTerm}
                  onSelectProduct={(product: { nombre: string }) => {
                    setSearchTerm(product.nombre)
                    setShowSearchSuggestions(false)
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 sm:gap-4 lg:gap-8 max-w-7xl mx-auto">
          {/* Sidebar de filtros - Siempre visible, lateral en móvil */}
          <div className="w-44 sm:w-52 lg:w-80 bg-[#33503E] rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 h-fit max-h-[calc(100vh-8rem)] lg:max-h-none overflow-y-auto lg:sticky lg:top-6 shadow-lg flex-shrink-0">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Título */}
              <div className="text-center">
                <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-white mb-1 lg:mb-2">Filtros</h2>
                <p className="text-white/70 text-xs sm:text-sm hidden sm:block">Encuentra productos perfectos</p>
              </div>

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

              {/* Rango de precios */}
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

              {/* Productores */}
              <div>
                <h3 className="text-white font-semibold mb-2 lg:mb-3 text-sm sm:text-base">Productores</h3>
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

              {/* Certificaciones */}
              <div>
                <h3 className="text-white font-semibold mb-2 lg:mb-3 text-sm sm:text-base">Certificaciones</h3>
                <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {certificaciones.map((cert) => (
                    <label key={cert} className="flex items-center space-x-2 text-white/90 hover:text-white cursor-pointer">
                      <Checkbox
                        checked={selectedCertificaciones.includes(cert)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedCertificaciones([...selectedCertificaciones, cert])
                          } else {
                            setSelectedCertificaciones(selectedCertificaciones.filter(c => c !== cert))
                          }
                        }}
                        className="border-white/30 data-[state=checked]:bg-[#B15543] data-[state=checked]:border-[#B15543]"
                      />
                      <span className="text-xs sm:text-sm text-white/90 truncate">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
                <h2 className="text-xl sm:text-2xl font-bold text-[#33503E] mb-1">
                  {showFavorites ? 'Mis Favoritos' : activeCategory?.name || 'Productos'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {sortedProducts.length} productos encontrados
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 order-3">
                {/* Filtros de ordenamiento */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B15543]"
                  >
                    <option value="mas-recientes">Más recientes</option>
                    <option value="precio-menor">Precio: menor a mayor</option>
                    <option value="precio-mayor">Precio: mayor a menor</option>
                    <option value="nombre-az">Nombre A-Z</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
                </div>
                
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

            {/* Mensaje cuando no hay favoritos */}
            {showFavorites && sortedProducts.length === 0 && (
              <div className="w-full p-8 text-center bg-white rounded-xl shadow-md">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Heart size={64} className="text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-700">No tienes productos favoritos</h3>
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
            {(!showFavorites || (showFavorites && sortedProducts.length > 0)) && (
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
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    {/* Ubicación del productor */}
                    <div className="flex items-center gap-1 text-[#33503E] mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {product.productor}, {product.ubicacion}
                      </span>
                    </div>

                    {/* Nombre del producto */}
                    <h3 className="font-semibold text-[#33503E] mb-1 line-clamp-2">
                      {product.nombre}
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

                    {/* Métricas ambientales */}
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

                    {/* Precio y botón agregar - Botón terracota */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-[#B15543]">
                          ${product.precio.toFixed(2)}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">/ {product.unidad}</span>
                      </div>
                      <Button
                        onClick={(e) => addToCart(product, e)}
                        className="bg-[#B15543] hover:bg-[#9d4a39] text-white px-4 py-2"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                    </div>

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
              name: product.nombre,
              price: product.precio,
              quantity: 1,
              image: product.imagen,
              unit: product.unidad
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
            
            // Usar el sistema global de toast
            toast.cart(`${product.nombre} agregado al carrito`, {
              title: '¡Excelente elección!',
              action: {
                label: 'Ver carrito',
                onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
              }
            })
            
            // Ya no abrimos el carrito automáticamente para no tapar los toasts y mejorar UX
            // window.dispatchEvent(new Event('toggleCartSidebar'))
          }}
          isFavorite={favorites.includes(productoQuickView.id)}
          onToggleFavorite={(productId: string, event: React.MouseEvent) => toggleFavorite(productId, event)}
        />
      )}

      {/* Los toasts ahora se muestran a través del sistema global */}

      {/* SECCIONES CRÍTICAS - Contenido del dueño + Trazabilidad */}
      
      {/* 1. DESTACADOS DE LA SEMANA */}
      <section className="py-16 bg-gradient-to-br from-[#F5F2E8] to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#33503E] mb-4">
              Destacados de la semana
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Productos frescos seleccionados por nuestros agricultores de Huasca de Ocampo, Amanalco y Xochimilco
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-[#B15543]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#33503E]">Apio fresco</h3>
              <p className="text-gray-600 text-sm mb-3">
                Cultivado por Juan Pérez en Huasca de Ocampo, Hidalgo
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[#B15543] font-bold">$25/kg</span>
                <button className="bg-[#B15543] text-white px-4 py-2 rounded-lg hover:bg-[#9d4a39] transition-colors">
                  Ver producto
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-[#B15543]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🥕</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#33503E]">Zanahoria de colores</h3>
              <p className="text-gray-600 text-sm mb-3">
                Directa de las chinampas de Xochimilco
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[#B15543] font-bold">$30/kg</span>
                <button className="bg-[#B15543] text-white px-4 py-2 rounded-lg hover:bg-[#9d4a39] transition-colors">
                  Ver producto
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-[#B15543]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🍅</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#33503E]">Tomate verde</h3>
              <p className="text-gray-600 text-sm mb-3">
                Cosechado en Amanalco, Estado de México
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[#B15543] font-bold">$35/kg</span>
                <button className="bg-[#B15543] text-white px-4 py-2 rounded-lg hover:bg-[#9d4a39] transition-colors">
                  Ver producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ¿POR QUÉ COMPRAR EN ARCATIERRA.COM? */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#33503E] mb-4">
              ¿Por qué comprar en arcatierra.com?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Conectamos directamente con agricultores de México para llevarte la mejor calidad a tu mesa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B15543] to-[#9d4a39] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-[#33503E] mb-4">Frescura que se nota</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestras hortalizas llegan desde Xochimilco en menos de 24 horas. 
                Frutas y vegetales 100% agroecológicas que se cosechan cada semana directamente en el campo mexicano.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B15543] to-[#9d4a39] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">📋</span>
              </div>
              <h3 className="text-xl font-bold text-[#33503E] mb-4">Curaduría pensada para ti</h3>
              <p className="text-gray-600 leading-relaxed">
                Elegimos alimentos de temporada, nutritivos y versátiles,
                para que cocinar en casa sea más fácil y disfrutable.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B15543] to-[#9d4a39] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">💰</span>
              </div>
              <h3 className="text-xl font-bold text-[#33503E] mb-4">Ahorro inteligente</h3>
              <p className="text-gray-600 leading-relaxed">
                Invertir en calidad desde el origen te rinde más:
                mejores ingredientes, menos desperdicio, más sabor.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B15543] to-[#9d4a39] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🌿</span>
              </div>
              <h3 className="text-xl font-bold text-[#33503E] mb-4">Salud que se cultiva</h3>
              <p className="text-gray-600 leading-relaxed">
                Alimentos agroecológicos, diversos y llenos de vida.
                Variedad, colores y texturas que nutren tu cuerpo cada semana.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B15543] to-[#9d4a39] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🚚</span>
              </div>
              <h3 className="text-xl font-bold text-[#33503E] mb-4">Logística responsable, impacto real</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestros viajes suman menos de 500 km semanales
                y conectan directamente con productores de Amanalco, Puebla, Huasca y Xochimilco.
                Hablamos de hiperlocalidad regenerativa.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B15543] to-[#9d4a39] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-[#33503E] mb-4">Cada compra siembra futuro</h3>
              <p className="text-gray-600 leading-relaxed">
                Con tu compra apoyas a más de 60 familias campesinas
                y formas parte de una red que cuida la tierra y el alimento desde la raíz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INFORMACIÓN DE ENTREGA / LOGÍSTICA */}
      <section className="py-16 bg-[#F5F2E8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#33503E] mb-4">
              Información de entrega
            </h2>
            <p className="text-gray-600">
              Conectamos directamente con nuestras regiones productoras
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
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

            <div className="bg-white rounded-xl p-8 shadow-lg">
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

            <div className="md:col-span-2 bg-white rounded-xl p-8 shadow-lg">
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

          {/* Regiones de origen */}
          <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-[#33503E] mb-6 text-center">
              Nuestras regiones productoras
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌾</span>
                </div>
                <h4 className="font-semibold text-[#33503E] mb-1">Huasca de Ocampo</h4>
                <p className="text-sm text-gray-600">Hidalgo - Verduras</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🥬</span>
                </div>
                <h4 className="font-semibold text-[#33503E] mb-1">Xochimilco</h4>
                <p className="text-sm text-gray-600">CDMX - Hortalizas</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🍎</span>
                </div>
                <h4 className="font-semibold text-[#33503E] mb-1">Amanalco</h4>
                <p className="text-sm text-gray-600">Edo. Méx. - Frutas</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">☕</span>
                </div>
                <h4 className="font-semibold text-[#33503E] mb-1">Puebla</h4>
                <p className="text-sm text-gray-600">Café y Cacao</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA SUSCRIPCIÓN */}
      <section className="py-20 bg-gradient-to-br from-[#B15543] to-[#9d4a39] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Suscríbete y simplifica tu alimentación
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Ahorra tiempo y dinero con una suscripción a tu canasta:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">5% de descuento siempre</h3>
              <p className="opacity-90">Precio preferencial en todas tus canastas</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">Recibe automáticamente</h3>
              <p className="opacity-90">Cada semana o quincena, sin preocuparte por pedir</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-3xl mb-4">➕</div>
              <h3 className="text-xl font-bold mb-2">Agrega fácilmente</h3>
              <p className="opacity-90">Productos adicionales desde la tienda</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-3xl mb-4">❤️</div>
              <h3 className="text-xl font-bold mb-2">Dona si sales</h3>
              <p className="opacity-90">¿Vacaciones? Dona tu canasta a Gastromotiva</p>
            </div>
          </div>
          
          <p className="text-lg mb-8 opacity-90">
            Tus alimentos llegan sin que tengas que pensar demasiado —y con mucho sentido.
          </p>
          
          <button className="bg-white text-[#B15543] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Comenzar suscripción
          </button>
        </div>
      </section>

      {/* 5. TESTIMONIOS */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#33503E] mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-gray-600">
              Experiencias reales de familias que forman parte de nuestra red
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F5F2E8] rounded-xl p-8">
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

            <div className="bg-[#F5F2E8] rounded-xl p-8">
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

            <div className="bg-[#F5F2E8] rounded-xl p-8">
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

      {/* 6. FAQs ESPECÍFICOS */}
      <section className="py-16 bg-[#F5F2E8]">
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
    </div>
  )
}

