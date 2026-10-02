'use client'

import { useState } from 'react'
import { X, Star, ShoppingCart, Heart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import type { Product } from '@/data/productos'
import { precioLegible, esGratuito } from '@/lib/precio'
import { TEXTO_AGOTADO } from '@/types/tienda'

/** Producto de la tienda con su estado de venta (= `ProductoTienda` de `app/tienda/page.tsx`). */
export type ProductoConVenta = Product & { enVenta: boolean }

interface ProductQuickViewProps {
  isOpen: boolean
  onClose: () => void
  /** El producto de la tarjeta (nombre, foto, descripción, favorito y «Más detalles»). */
  product: ProductoConVenta
  /**
   * FIC1 (R7): lo que se agrega al carrito y el precio que se muestra. En una canasta es la de COMPRA
   * ÚNICA (itemcode con U, su precio, su stock y su en_venta), igual que la tarjeta; null = no se vende hoy.
   */
  productoCompra: ProductoConVenta | null
  onAddToCart: (producto: ProductoConVenta, cantidad: number) => void
  isFavorite: boolean
  onToggleFavorite: (productId: string, event: React.MouseEvent) => void
}

export default function ProductQuickView({
  isOpen,
  onClose,
  product,
  productoCompra,
  onAddToCart,
  isFavorite,
  onToggleFavorite
}: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !product) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-start justify-center z-[950] pt-36 px-4 pb-8 overflow-y-auto">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quickview-titulo"
          data-testid="quickview"
        >
          <div className="flex flex-col md:flex-row">
            {/* Imagen del producto */}
            <div className="w-full md:w-2/5 relative h-48 md:h-auto">
              <OptimizedImage
                src={product.imagen || '/placeholder-product.jpg'}
                alt={product.nombre}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.badges.map((badge: string, index: number) => (
                  <span 
                    key={index} 
                    className={`${getBadgeClass(badge)} text-white font-medium px-3 py-1 rounded-full shadow-sm`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <span className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md">
                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(product.id, e)}
                  aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} 
                  />
                </button>
              </span>
            </div>
            
            {/* Información del producto */}
            <div className="w-full md:w-3/5 p-6 flex flex-col relative">
              {/* Botón de cerrar */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              
              {/* 
              ========================================
              TRAZABILIDAD COMENTADA - Ubicación del productor
              ========================================
              PARA REACTIVAR: Descomentar el bloque de código abajo
              
              <div className="flex items-center gap-2 text-[#33503E] mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">{product.productor}, {product.ubicacion}</span>
              </div>
              ========================================
              */}
              
              {/* Nombre del producto */}
              <h2 id="quickview-titulo" className="text-2xl font-bold text-gray-900 mb-2">{product.nombre}</h2>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-gray-500 text-sm">({product.reviews} reseñas)</span>
              </div>
              
              {/* Descripción */}
              <p className="text-gray-600 mb-6">
                {product.descripcion}
              </p>
              
              {/* Storytelling del productor */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-[#33503E] italic text-sm">
                  "{product.storytelling}"
                </p>
                <p className="text-gray-500 text-xs mt-1">- {product.productor}</p>
              </div>
              
              {/* 
              ========================================
              TRAZABILIDAD COMENTADA - Componente ProductTraceability
              ========================================
              PARA REACTIVAR:
              1. Descomentar el bloque de código abajo
              2. Asegurarse de que el producto tenga datos en 'trazabilidad'
              3. El componente ProductTraceability ya está importado
              
              {product.trazabilidad && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Trazabilidad:</h3>
                  <ProductTraceability product={product} compact={true} />
                </div>
              )}
              ========================================
              */}
              
              {/* Características */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Características</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Sin pesticidas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Producción local</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Comercio justo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Empaque eco-friendly</span>
                  </div>
                </div>
              </div>
              
              {/* 
              ========================================
              TRAZABILIDAD COMENTADA - Métricas ambientales
              ========================================
              PARA REACTIVAR: Descomentar el bloque de código abajo
              
              <div className="flex items-center justify-between mb-6 bg-[#F5F2E8] rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <span className="text-green-600">🌱</span>
                  <span className="text-sm">{product.metricas.co2}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">💧</span>
                  <span className="text-sm">{product.metricas.agua}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-600">♻️</span>
                  <span className="text-sm">{product.metricas.plastico}</span>
                </div>
              </div>
              ========================================
              */}
              
              {/* Precio y botones */}
              <div className="mt-auto">
                {productoCompra && productoCompra.enVenta ? (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-[#B15543]" data-testid="quickview-precio">
                      {precioLegible(productoCompra.precio)}
                      {!esGratuito(productoCompra.precio) && productoCompra.unidad && (
                        <span className="text-sm font-normal"> / {productoCompra.unidad}</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        aria-label="Quitar uno"
                        data-testid="quickview-menos"
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium" data-testid="quickview-cantidad" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        aria-label="Agregar uno"
                        data-testid="quickview-mas"
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <p data-testid="quickview-agotado" className="mb-4 text-sm font-semibold text-red-700">
                    {TEXTO_AGOTADO}
                  </p>
                )}
                
                <div className="flex gap-3">
                  {product.ctaType === 'subscription' ? (
                    <Button
                      onClick={() => {
                        window.location.href = '/suscripciones'
                        onClose()
                      }}
                      className="flex-1 bg-[#B15543] hover:bg-[#9d4a39] text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Suscribirse
                    </Button>
                  ) : productoCompra && productoCompra.enVenta ? (
                    <Button
                      data-testid="quickview-agregar"
                      onClick={() => {
                        onAddToCart(productoCompra, quantity)
                        onClose()
                      }}
                      className="flex-1 bg-[#B15543] hover:bg-[#9d4a39] text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Agregar al carrito
                    </Button>
                  ) : null}
                  <Link href={`/producto/${product.id}`}>
                    <Button
                      variant="outline"
                      className="border-[#33503E] text-[#33503E] hover:bg-[#33503E] hover:text-white"
                    >
                      Más detalles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

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

