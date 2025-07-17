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
  { id: 'despensa', name: 'Despensa', emoji: '🌾', active: false },
  { id: 'lacteos', name: 'Lácteos', emoji: '🧀', active: false },
  { id: 'proteinas', name: 'Proteínas', emoji: '🥩', active: false },
  { id: 'bebidas', name: 'Bebidas', emoji: '🥤', active: false },
  { id: 'dulces', name: 'Dulces', emoji: '🍯', active: false },
  { id: 'otros', name: 'Otros', emoji: '📦', active: false }
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

export default function TiendaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('verduras')
  const [priceRange, setPriceRange] = useState([0, 200])
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [selectedProductores, setSelectedProductores] = useState<string[]>([])
  const [selectedCertificaciones, setSelectedCertificaciones] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'2' | '3'>('3')
  const [favorites, setFavorites] = useState<string[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [productoQuickView, setProductoQuickView] = useState<Product | null>(null)
  const toast = useToast()
  const [sortBy, setSortBy] = useState('mas-recientes')
  const [showFavorites, setShowFavorites] = useState(false)

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
      {/* Header responsivo y centrado - con fondo sólido forzado (sin transparencia) */}
      <div className="w-full !bg-[#33503E] text-white shadow-md relative z-10" style={{backgroundColor: '#33503E', opacity: 1}}>
        <div className="container mx-auto px-4 py-8">

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Tienda de Productos Orgánicos</h1>
            <p className="text-white text-lg mb-8 max-w-3xl mx-auto">
              Directo de las chinampas a tu mesa. Productos 100% orgánicos cultivados con amor y respeto por la tierra.
            </p>
            
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
        <div className="flex gap-8">
          {/* Sidebar de filtros */}
          <div className="w-80 bg-[#33503E] rounded-2xl p-6 h-fit sticky top-6 shadow-lg">
            <div className="space-y-6">
              {/* Título */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Filtros</h2>
                <p className="text-white/70 text-sm">Encuentra productos perfectos</p>
              </div>

              {/* Categorías */}
              <div>
                <h3 className="text-white font-semibold mb-3">Categorías</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                        selectedCategory === category.id
                          ? 'bg-[#B15543] text-white'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span>{category.emoji}</span>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rango de precios */}
              <div>
                <h3 className="text-white font-semibold mb-3">Rango de Precio</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Productores */}
              <div>
                <h3 className="text-white font-semibold mb-3">Productores</h3>
                <div className="space-y-2">
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
                      <span className="text-sm">{productor}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Certificaciones */}
              <div>
                <h3 className="text-white font-semibold mb-3">Certificaciones</h3>
                <div className="space-y-2">
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
                      <span className="text-sm">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Header de resultados */}
            <div className="flex items-center justify-between mb-6">
              {/* Tabs para alternar entre Tienda y Favoritos */}
              <div className="flex space-x-4">
                <button 
                  className={`px-4 py-2 rounded-md ${!showFavorites ? 'bg-[#33503E] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setShowFavorites(false)}
                >
                  Tienda
                </button>
                <button 
                  className={`px-4 py-2 rounded-md flex items-center space-x-1 ${showFavorites ? 'bg-[#B15543] text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setShowFavorites(true)}
                >
                  <Heart size={18} className={showFavorites ? 'fill-white' : ''} />
                  <span>Favoritos {favorites.length > 0 && `(${favorites.length})`}</span>
                </button>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-[#33503E] mb-1">
                  {showFavorites ? 'Mis Productos Favoritos' : activeCategory?.name || 'Productos'}
                </h2>
                <p className="text-gray-600">
                  {sortedProducts.length} productos encontrados
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Filtros de ordenamiento */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#B15543]"
                  >
                    <option value="mas-recientes">Más recientes</option>
                    <option value="precio-menor">Precio: menor a mayor</option>
                    <option value="precio-mayor">Precio: mayor a menor</option>
                    <option value="nombre-az">Nombre A-Z</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                  <Button
                    variant={viewMode === '2' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('2')}
                    className={viewMode === '2' ? 'bg-[#B15543] text-white' : 'text-gray-600'}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === '3' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('3')}
                    className={viewMode === '3' ? 'bg-[#B15543] text-white' : 'text-gray-600'}
                  >
                    <LayoutGrid className="w-4 h-4" />
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
              <div className={`grid gap-6 ${viewMode === '2' ? 'grid-cols-2' : 'grid-cols-3'}`}>
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
    </div>
  )
}

