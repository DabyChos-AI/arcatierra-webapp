'use client'

import { useState } from 'react'
import { Heart, ShoppingCart, Star, MapPin, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  unidad: string
  imagen: string
  productor: string
  ubicacion: string
  rating: number
  reviews: number
  badges: string[]
  metricas: {
    co2: string
    agua: string
    plastico: string
  }
  storytelling: string
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onToggleFavorite?: (productId: string) => void
  isFavorite?: boolean
  showDualPricing?: boolean
  precioSuscripcion?: number
}

// Helper: detectar si un producto es canasta
function esCanasta(itemcode: string): boolean {
  return /^188[5-9]U?$/.test(itemcode) || /^189[0-1]U?$/.test(itemcode)
}

// Helper: obtener itemcode de compra única (con U)
function obtenerItemcodeCompraUnica(itemcode: string): string {
  return itemcode.endsWith('U') ? itemcode : itemcode + 'U'
}

// Helper: clase de badge
function getBadgeClass(badge: string): string {
  if (badge.includes('Agroecológico') || badge.includes('Regenerativo')) return 'bg-verde'
  if (badge.includes('Popular')) return 'bg-terracota'
  if (badge.includes('Nuevo')) return 'bg-blue-500'
  return 'bg-gray-500'
}

export default function ProductCard({ 
  product, 
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  showDualPricing = true,
  precioSuscripcion
}: ProductCardProps) {
  const [hoveredProduct, setHoveredProduct] = useState(false)
  const isCanasta = esCanasta(product.id)
  const precioSub = precioSuscripcion || (product.precio * 0.95)

  const goToProductDetail = () => {
    window.location.href = `/producto/${product.id}`
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-[#E3DBCB] overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={goToProductDetail}
      onMouseEnter={() => setHoveredProduct(true)}
      onMouseLeave={() => setHoveredProduct(false)}
    >
      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.imagen}
          alt={product.nombre}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(product.id)
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Vista rápida en hover */}
        {hoveredProduct && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                goToProductDetail()
              }}
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
      <div className="p-3 sm:p-4">
        {/* Ubicación del productor - Solo si tiene datos */}
        {product.productor && product.ubicacion && (
          <div className="flex items-center gap-1 text-[#33503E] mb-2">
            <MapPin className="w-3 h-3" />
            <span className="text-xs font-medium">
              {product.productor}, {product.ubicacion}
            </span>
          </div>
        )}

        {/* Nombre del producto */}
        <h3 className="text-sm sm:text-base font-medium text-[#33503E] mb-1 line-clamp-2">
          {product.nombre.replace(/SUSCRIPCIÓN|SUSCRIPCION|COMPRA ÚNICA/gi, '').trim()}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.descripcion}
        </p>

        {/* Rating - Solo si tiene datos */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-gray-500 text-sm">({product.reviews})</span>
          </div>
        )}

        {/* Métricas ambientales - Solo si tiene datos */}
        {product.metricas.co2 && (
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
        )}

        {/* Precio y botones - DUAL PRICING para canastas */}
        {isCanasta && showDualPricing ? (
          /* CANASTA: Mostrar dos opciones (Compra Única + Suscripción) */
          <div className="space-y-3 border-t border-gray-200 pt-3">
            {/* Opción 1: Compra Única */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs text-gray-600 font-medium">Compra Única</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-[#B15543]">
                      ${product.precio.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">/ {product.unidad}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToCart(product)
                }}
                className="w-full bg-[#B15543] hover:bg-[#9d4a39] text-white min-h-[44px]"
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
                      ${precioSub.toFixed(2)}
                    </span>
                    <span className="text-xs text-green-600">/ semana</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  window.location.href = '/suscripciones'
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
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart(product)
              }}
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

        {/* Storytelling al final con línea - Solo si tiene datos */}
        {product.storytelling && (
          <div className="border-t border-gray-200 pt-3">
            <p className="text-[#33503E] italic text-xs">
              "{product.storytelling}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
