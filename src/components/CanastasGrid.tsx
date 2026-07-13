'use client'

import { useState, useEffect } from 'react'
import ProductCard, { Product } from '@/components/ProductCard'
import { useFavoritos } from '@/hooks/useFavoritos'
import { API_URL } from '@/lib/api'

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
}

// Helper: imagen de canastas por nombre
function getCanastaImage(nombre: string): string {
  const n = nombre.toLowerCase()
  if (n.includes('canasta individual')) return '/images/canastas/canastaindividual.jpg'
  if (n.includes('canasta media')) return '/images/canastas/canastamedia.jpg'
  if (n.includes('canasta completa')) return '/images/canastas/canastacompleta.jpg'
  if (n.includes('canasta familiar')) return '/images/canastas/canastafamiliar.jpg'
  return '/placeholder-product.jpg'
}

// Helper: convertir API product a Product
function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  // Convertir nombre a Title Case (altas y bajas)
  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }
  
  return {
    id: apiProduct.itemcode,
    nombre: toTitleCase(apiProduct.nombre),
    descripcion: apiProduct.descripcion || '',
    precio: parseFloat(apiProduct.precio_unitario),
    stock: apiProduct.stock_actual,
    unidad: apiProduct.unidad_medida || 'unidad',
    imagen: getCanastaImage(apiProduct.nombre),
    // Datos ocultos - comentados por solicitud
    productor: '', // Ocultar ubicación
    ubicacion: '', // Ocultar ubicación
    rating: 0, // Ocultar rating
    reviews: 0, // Ocultar reviews
    badges: [], // Ocultar badge Agroecológico
    metricas: { co2: '', agua: '', plastico: '' }, // Ocultar trazabilidad
    storytelling: '' // Ocultar frescura directo del campo
  }
}

export default function CanastasGrid() {
  const [canastas, setCanastas] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { favoritos, toggleFavorito } = useFavoritos()

  // Fetch canastas desde API
  useEffect(() => {
    const fetchCanastas = async () => {
      try {
        // Itemcodes de las 4 canastas con U (compra única)
        const itemcodes = ['1885U', '1886U', '1887U', '1888U']
        const promises = itemcodes.map(code =>
          fetch(`${API_URL}/api/products/${code}`)
            .then(res => res.ok ? res.json() : null)
        )
        
        const results = await Promise.all(promises)
        const validProducts = results
          .filter(Boolean)
          .map(mapApiProductToProduct)
        
        setCanastas(validProducts)
      } catch (error) {
        console.error('Error fetching canastas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCanastas()
  }, [])

  // Función para agregar al carrito
  const addToCart = (product: Product) => {
    try {
      const cartItem = {
        id: product.id,
        itemcode: product.id,
        name: product.nombre,
        price: product.precio,
        quantity: 1,
        image: product.imagen,
        unit: product.unidad,
        tipo: 'producto'
      }
      
      const existingCart = JSON.parse(localStorage.getItem('arcaTierraCart') || '[]')
      const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id)
      
      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity += 1
      } else {
        existingCart.push(cartItem)
      }
      
      localStorage.setItem('arcaTierraCart', JSON.stringify(existingCart))
      window.dispatchEvent(new Event('cartUpdated'))
      
      console.log('Canasta agregada al carrito:', product.nombre)
    } catch (error) {
      console.error('Error al agregar al carrito:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (canastas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se pudieron cargar las canastas. Por favor intenta más tarde.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {canastas.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={addToCart}
          onToggleFavorite={toggleFavorito}
          isFavorite={favoritos.includes(product.id)}
          showDualPricing={true}
        />
      ))}
    </div>
  )
}
