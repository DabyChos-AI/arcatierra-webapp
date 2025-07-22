'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ShoppingCart, Check, Leaf, Droplets, PackageOpen, Star, MapPin, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { productos, Product } from '@/data/productos'
import { useToast } from '@/components/ui/Toast'
import ProductTraceability from '@/components/ProductTraceability'

type ClientProductoPageProps = {
  id: string;
};

export default function ClientProductoPage({ id }: ClientProductoPageProps) {
  const router = useRouter()
  const [producto, setProducto] = useState<Product | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [favoritos, setFavoritos] = useState<string[]>([])
  const [carrito, setCarrito] = useState<any[]>([])
  const toast = useToast() // Usar el sistema global de toast
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0)

  useEffect(() => {
    // Buscar el producto por ID
    const foundProduct = productos.find((p: Product) => p.id === id)
    if (foundProduct) {
      setProducto(foundProduct)
    } else {
      // Redirigir a 404 o tienda si no se encuentra el producto
      router.push('/tienda')
    }

    // Cargar favoritos y carrito desde localStorage
    try {
      const savedFavoritos = localStorage.getItem('arcaTierraFavoritos')
      if (savedFavoritos) {
        setFavoritos(JSON.parse(savedFavoritos))
      }

      const savedCarrito = localStorage.getItem('carrito')
      if (savedCarrito) {
        setCarrito(JSON.parse(savedCarrito))
      }
    } catch (error) {
      console.error('Error al cargar datos del localStorage:', error)
    }
  }, [id, router])

  // Función para alternar favorito
  const toggleFavorito = () => {
    if (!producto) return

    const newFavoritos = favoritos.includes(producto.id)
      ? favoritos.filter((favId: string) => favId !== producto.id)
      : [...favoritos, producto.id]

    setFavoritos(newFavoritos)

    // Guardar en localStorage
    try {
      localStorage.setItem('arcaTierraFavoritos', JSON.stringify(newFavoritos))
    } catch (error) {
      console.error('Error al guardar favoritos:', error)
    }

    toast.show({
      title: favoritos.includes(producto.id) ? 'Eliminado de favoritos' : 'Añadido a favoritos',
      message: producto.nombre,
      type: favoritos.includes(producto.id) ? 'error' : 'favorite',
    })
  }

  // Función para añadir al carrito
  const addToCart = () => {
    if (!producto) return

    const cartItem = {
      id: producto.id,
      name: producto.nombre,
      price: producto.precio,
      quantity: cantidad,
      image: producto.imagen,
      unit: producto.unidad
    }

    // Usar la misma clave de localStorage que la página principal
    const existingCart = JSON.parse(localStorage.getItem('arcaTierraCart') || '[]')
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id)

    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      existingCart[existingItemIndex].quantity += cantidad
    } else {
      // Agregar nuevo item
      existingCart.push(cartItem)
    }

    // Guardar en localStorage con la clave correcta
    try {
      localStorage.setItem('arcaTierraCart', JSON.stringify(existingCart))
      setCarrito(existingCart)

      // Disparar evento para notificar al header que actualice el contador
      window.dispatchEvent(new Event('cartUpdated'))

      // Usar el sistema global de toast igual que la página principal
      toast.cart(`${cantidad} x ${producto.nombre} agregado al carrito`, {
        title: '¡Excelente elección!',
        action: {
          label: 'Ver carrito',
          onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
        }
      })
    } catch (error) {
      console.error('Error al guardar carrito:', error)
    }
  }

  // Si no hay producto, mostrar cargando o redireccionar
  if (!producto) {
    return (
      <div className="container mx-auto px-4 py-10 min-h-screen flex items-center justify-center">
        <p className="text-xl font-medium text-gray-600">Cargando producto...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      {/* Navegación superior y botón volver - CORREGIDO PARA EVITAR CONFLICTO CON HEADER */}
      <div className="mb-6 pt-20 relative z-[1001]">
        <button
          onClick={() => router.back()}
          className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:text-[#B15543] hover:border-[#B15543] transition-all duration-200 relative z-[1002]"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Miniaturas */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[0, 1, 2].map((index: number) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-green-500" onClick={() => setImagenSeleccionada(index)}>
                <img
                  src={producto.imagen}
                  alt={`${producto.nombre} - imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          {/* Nombre y valoración */}
          <div>
            <h1 className="text-3xl font-bold">{producto.nombre}</h1>
            <div className="flex items-center mt-2 space-x-2">
              <div className="flex">
                {Array(5).fill(0).map((_: number, i: number) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < (producto.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">{producto.reviews || 0} valoraciones</span>
            </div>
          </div>

          {/* Precio y stock */}
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">${producto.precio.toFixed(2)}</span>
              {productos.filter((p: Product) => p.categoria === producto.categoria && p.id !== producto.id).slice(0, 1).map((productoRelacionado: Product) => (
                <span key={productoRelacionado.id} className="ml-2 text-lg text-gray-400 line-through">${(productoRelacionado.precio * 1.2).toFixed(2)}</span>
              ))}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
              producto.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <span className={`h-2 w-2 rounded-full mr-1 ${producto.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {producto.stock > 0 ? `En stock (${producto.stock} disponibles)` : 'Agotado'}
            </span>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="font-medium mb-2">Descripción</h2>
            <p className="text-gray-600">{producto.descripcion}</p>
          </div>

          {/* Trazabilidad (FASE 3) - Solo si el producto tiene datos de trazabilidad */}
          {producto.trazabilidad && (
            <div>
              <h2 className="font-medium mb-4">Trazabilidad del Producto</h2>
              <ProductTraceability product={producto} compact={false} />
            </div>
          )}

          {/* Características destacadas */}
          <div>
            <h2 className="font-medium mb-2">Características destacadas</h2>
            <ul className="space-y-2">
              {(producto.descripcion || '').split('. ').filter(s => s.length > 0).map((caracteristica: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">{caracteristica}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Etiquetas */}
          <div className="flex flex-wrap gap-2">
            {producto.badges && producto.badges.map((badge: string, index: number) => (
              <Badge key={index} variant="outline">{badge}</Badge>
            ))}
          </div>

          {/* Selector de cantidad */}
          <div>
            <h3 className="text-sm font-medium mb-2">Cantidad</h3>
            <div className="flex items-center border border-gray-200 rounded w-32">
              <button 
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                disabled={cantidad <= 1}
              >
                -
              </button>
              <span className="flex-1 text-center py-1">{cantidad}</span>
              <button 
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                onClick={() => setCantidad(prev => Math.min(producto.stock, prev + 1))}
                disabled={cantidad >= producto.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={addToCart}
              disabled={producto.stock <= 0}
              className="flex-1 gap-2"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4" />
              Añadir al carrito
            </Button>
            <Button 
              variant="outline"
              onClick={toggleFavorito}
              className="gap-2"
              size="lg"
            >
              <Heart 
                className={`h-4 w-4 ${favoritos.includes(producto.id) ? 'fill-red-500 text-red-500' : ''}`} 
              />
              {favoritos.includes(producto.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            </Button>
          </div>

          {/* Información adicional */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Leaf className="h-4 w-4 mr-2 text-green-600" />
              Producto ecológico y sostenible
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Droplets className="h-4 w-4 mr-2 text-blue-600" />
              Sin químicos dañinos
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <PackageOpen className="h-4 w-4 mr-2 text-amber-600" />
              Envío gratuito para pedidos superiores a $50
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-red-600" />
              Envío desde México
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
