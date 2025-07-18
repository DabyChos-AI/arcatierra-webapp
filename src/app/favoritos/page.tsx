'use client'

import { useState, useEffect } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { productos, Product } from '@/data/productos'
import { useToast } from '@/components/ui/Toast'

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<string[]>([])
  const [productosFavoritos, setProductosFavoritos] = useState<Product[]>([])
  const toast = useToast()

  useEffect(() => {
    // Cargar favoritos desde localStorage
    const cargarFavoritos = () => {
      try {
        const favoritosGuardados = localStorage.getItem('arcaTierraFavoritos')
        const listaFavoritos = favoritosGuardados ? JSON.parse(favoritosGuardados) : []
        setFavoritos(listaFavoritos)
        
        // Filtrar productos que están en favoritos
        const productosFiltrados = productos.filter((p: Product) => listaFavoritos.includes(p.id))
        setProductosFavoritos(productosFiltrados)
      } catch (error) {
        console.error('Error al cargar favoritos:', error)
        setFavoritos([])
        setProductosFavoritos([])
      }
    }
    
    cargarFavoritos()
    
    // Escuchar cambios en localStorage (para actualizar si se modifican favoritos en otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'arcaTierraFavoritos') {
        cargarFavoritos()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const eliminarFavorito = (producto: Product) => {
    const nuevosFavoritos = favoritos.filter(id => id !== producto.id)
    setFavoritos(nuevosFavoritos)
    
    // Actualizar productos mostrados
    setProductosFavoritos(prev => prev.filter(p => p.id !== producto.id))
    
    // Guardar en localStorage
    localStorage.setItem('arcaTierraFavoritos', JSON.stringify(nuevosFavoritos))
    
    // Mostrar toast con opción de deshacer
    toast.error(`${producto.nombre} eliminado de favoritos`, {
      title: 'Favorito eliminado',
      action: {
        label: 'Deshacer',
        onClick: () => {
          const restaurarFavoritos = [...nuevosFavoritos, producto.id]
          setFavoritos(restaurarFavoritos)
          setProductosFavoritos(prev => [...prev, producto])
          localStorage.setItem('arcaTierraFavoritos', JSON.stringify(restaurarFavoritos))
          toast.success(`${producto.nombre} restaurado a favoritos`)
        }
      }
    })
  }

  const agregarAlCarrito = (producto: Product) => {
    try {
      // Cargar carrito actual
      const cartData = localStorage.getItem('arcaTierraCart') || '[]'
      const carrito = JSON.parse(cartData)
      
      // Verificar si el producto ya está en el carrito
      const itemExistente = carrito.find((item: any) => item.id === producto.id)
      
      if (itemExistente) {
        // Si ya existe, aumentar cantidad
        itemExistente.quantity += 1
      } else {
        // Si no existe, agregar con cantidad 1
        carrito.push({
          id: producto.id,
          name: producto.nombre,
          price: producto.precio,
          unit: producto.unidad,
          quantity: 1,
          image: producto.imagen || '/placeholder-product.jpg'
        })
      }
      
      // Guardar carrito actualizado
      localStorage.setItem('arcaTierraCart', JSON.stringify(carrito))
      
      // Notificar actualización del carrito
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      
      // Mostrar notificación
      toast.cart(`${producto.nombre} agregado al carrito`, {
        title: '¡Excelente elección!',
        action: {
          label: 'Ver carrito',
          onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
        }
      })
    } catch (error) {
      console.error('Error al agregar al carrito:', error)
      toast.error('No se pudo agregar el producto al carrito.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-verde-tipografia mb-4">Mis Favoritos</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Aquí puedes encontrar todos los productos que has marcado como favoritos. 
            Añádelos al carrito fácilmente o elimínalos de tu lista.
          </p>
        </div>
        
        {favoritos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-neutro-crema mb-4">
              <Heart className="h-10 w-10 text-terracota stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No tienes favoritos aún</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explora nuestra tienda y agrega productos a tu lista de favoritos para encontrarlos fácilmente después.
            </p>
            <Link href="/tienda">
              <Button className="bg-terracota hover:bg-terracota-oscuro text-white">
                Explorar la tienda
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFavoritos.map((producto) => (
              <div 
                key={producto.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <Link href={`/producto/${producto.id}`}>
                    <div className="aspect-square overflow-hidden">
                      <OptimizedImage                         src={producto.imagen || '/placeholder-product.jpg'}
                        alt={producto.nombre}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <button
                    onClick={() => eliminarFavorito(producto)}
                    className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label={`Eliminar ${producto.nombre} de favoritos`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/producto/${producto.id}`} className="hover:text-terracota transition-colors">
                        <h3 className="font-semibold text-gray-900 mb-1">{producto.nombre}</h3>
                      </Link>
                      <p className="text-sm text-gray-500 mb-2">{producto.productor}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="font-semibold text-terracota">
                      ${producto.precio.toFixed(2)}
                      <span className="text-sm text-gray-500 font-normal ml-1">/ {producto.unidad}</span>
                    </div>
                    
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="flex items-center justify-center p-2 bg-terracota hover:bg-terracota-oscuro text-white rounded-lg transition-colors"
                      aria-label={`Agregar ${producto.nombre} al carrito`}
                      disabled={producto.stock <= 0}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
