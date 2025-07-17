'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart, Heart, Star, Leaf, Droplet, Recycle, Truck, Calendar, Shield, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import CartSidebar from '@/components/CartSidebar'

// Datos de productos (en un proyecto real, esto vendría de una API o base de datos)
const productos = [
  {
    id: 'espinacas-baby',
    nombre: 'Espinacas Baby Orgánicas',
    precio: 40.00,
    unidad: 'manojo',
    imagen: '/products/espinacas-baby.jpg',
    productor: 'Cooperativa Las Flores',
    ubicacion: 'Tlalpan, CDMX',
    categoria: 'verduras',
    rating: 4.8,
    reviews: 24,
    stock: 15,
    badges: ['NUEVO', '100% Orgánico'],
    metricas: {
      co2: '2 kg CO₂',
      agua: '35L agua',
      plastico: '50g plástico evitado'
    },
    descripcion: 'Espinacas baby orgánicas cultivadas sin pesticidas ni químicos. Cosechadas a mano por familias campesinas de Tlalpan. Perfectas para ensaladas, smoothies o salteadas como guarnición.',
    beneficios: [
      'Alto contenido en hierro y vitaminas',
      'Cultivadas sin pesticidas ni químicos',
      'Apoya a familias campesinas locales',
      'Reduce la huella de carbono por transporte'
    ],
    disponibilidad: 'Entrega en 24-48 horas',
    relacionados: ['jitomate-cherry', 'lechuga-romana', 'zanahorias-baby']
  },
  {
    id: 'jitomate-cherry',
    nombre: 'Jitomate Cherry Orgánico',
    precio: 45.00,
    unidad: 'kg',
    imagen: '/products/jitomate-cherry.jpg',
    productor: 'Don Roberto Hernández',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'verduras',
    rating: 4.9,
    reviews: 18,
    stock: 8,
    badges: ['Destacado', '100% Orgánico'],
    metricas: {
      co2: '2.5 kg CO₂',
      agua: '50L agua',
      plastico: '30g plástico evitado'
    },
    descripcion: 'Jitomates cherry orgánicos cultivados en las chinampas de Xochimilco. Dulces, jugosos y llenos de sabor. Perfectos para ensaladas, aperitivos o para cocinar salsas caseras.',
    beneficios: [
      'Cultivados en chinampas tradicionales',
      'Rico en licopeno y antioxidantes',
      'Cosechados en su punto óptimo de madurez',
      'Apoya la preservación de técnicas agrícolas ancestrales'
    ],
    disponibilidad: 'Entrega en 24-48 horas',
    relacionados: ['espinacas-baby', 'lechuga-romana', 'zanahorias-baby']
  },
  {
    id: 'lechuga-romana',
    nombre: 'Lechuga Romana Hidropónica',
    precio: 35.00,
    unidad: 'pieza',
    imagen: '/products/lechuga-romana.jpg',
    productor: 'Familia García',
    ubicacion: 'Milpa Alta, CDMX',
    categoria: 'verduras',
    rating: 4.7,
    reviews: 31,
    stock: 12,
    badges: ['100% Orgánico'],
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '30L agua',
      plastico: '40g plástico evitado'
    },
    descripcion: 'Lechuga romana hidropónica cultivada por la Familia García en Milpa Alta. Crujiente, fresca y llena de nutrientes. Cultivada sin pesticidas en un sistema que optimiza el uso del agua.',
    beneficios: [
      'Cultivo hidropónico que ahorra 90% de agua',
      'Sin pesticidas ni químicos',
      'Mayor vida útil que la lechuga convencional',
      'Apoya a familias productoras locales'
    ],
    disponibilidad: 'Entrega en 24-48 horas',
    relacionados: ['espinacas-baby', 'jitomate-cherry', 'zanahorias-baby']
  },
  {
    id: 'zanahorias-baby',
    nombre: 'Zanahorias Baby',
    precio: 38.00,
    unidad: 'kg',
    imagen: '/products/zanahorias-baby.jpg',
    productor: 'Granja Sustentable CDMX',
    ubicacion: 'Tláhuac, CDMX',
    categoria: 'verduras',
    rating: 4.6,
    reviews: 15,
    stock: 20,
    badges: ['100% Orgánico'],
    metricas: {
      co2: '2.2 kg CO₂',
      agua: '40L agua',
      plastico: '35g plástico evitado'
    },
    descripcion: 'Zanahorias baby orgánicas cultivadas por Granja Sustentable CDMX en Tláhuac. Dulces, tiernas y perfectas para snacks, ensaladas o como guarnición. Cosechadas a mano en su punto óptimo.',
    beneficios: [
      'Ricas en betacarotenos y vitamina A',
      'Cultivadas sin pesticidas ni químicos',
      'Tamaño perfecto para consumo sin desperdicios',
      'Apoya proyectos de agricultura urbana sostenible'
    ],
    disponibilidad: 'Entrega en 24-48 horas',
    relacionados: ['espinacas-baby', 'jitomate-cherry', 'lechuga-romana']
  },
  {
    id: 'manzanas-rojas',
    nombre: 'Manzanas Rojas',
    precio: 55.00,
    unidad: 'kg',
    imagen: '/products/manzanas-rojas.jpg',
    productor: 'Huerto Urbano Verde',
    ubicacion: 'Cuajimalpa, CDMX',
    categoria: 'frutas',
    rating: 4.8,
    reviews: 22,
    stock: 10,
    badges: ['100% Orgánico'],
    metricas: {
      co2: '3.1 kg CO₂',
      agua: '60L agua',
      plastico: '45g plástico evitado'
    },
    descripcion: 'Manzanas rojas orgánicas cultivadas en Cuajimalpa por Huerto Urbano Verde. Dulces, crujientes y jugosas. Perfectas para consumo directo, postres o jugos naturales.',
    beneficios: [
      'Ricas en fibra y antioxidantes',
      'Cultivadas sin pesticidas ni químicos',
      'Cosechadas en su punto óptimo de madurez',
      'Apoya la agricultura urbana sostenible'
    ],
    disponibilidad: 'Entrega en 24-48 horas',
    relacionados: ['frijoles-negros', 'queso-fresco', 'miel-abeja']
  },
  {
    id: 'frijoles-negros',
    nombre: 'Frijoles Negros',
    precio: 42.00,
    unidad: 'kg',
    imagen: '/products/frijoles-negros.jpg',
    productor: 'Cooperativa Las Flores',
    ubicacion: 'Tlalpan, CDMX',
    categoria: 'despensa',
    rating: 4.5,
    reviews: 19,
    stock: 25,
    badges: ['100% Orgánico'],
    metricas: {
      co2: '1.5 kg CO₂',
      agua: '25L agua',
      plastico: '60g plástico evitado'
    },
    descripcion: 'Frijoles negros orgánicos cultivados por la Cooperativa Las Flores en Tlalpan. Ricos en proteínas y fibra, son un elemento básico de la dieta mexicana. Cultivados sin pesticidas ni químicos.',
    beneficios: [
      'Altos en proteína vegetal y fibra',
      'Cultivados sin pesticidas ni químicos',
      'Cosecha sostenible que preserva la tierra',
      'Apoya a cooperativas de agricultores locales'
    ],
    disponibilidad: 'Entrega en 24-48 horas',
    relacionados: ['manzanas-rojas', 'queso-fresco', 'miel-abeja']
  },
  {
    id: 'queso-fresco',
    nombre: 'Queso Fresco Artesanal',
    precio: 85.00,
    unidad: 'pieza',
    imagen: '/products/queso-fresco.jpg',
    productor: 'Familia García',
    ubicacion: 'Milpa Alta, CDMX',
    categoria: 'lacteos',
    rating: 4.9,
    reviews: 12,
    stock: 6,
    badges: ['Artesanal'],
    metricas: {
      co2: '4.2 kg CO₂',
      agua: '80L agua',
      plastico: '20g plástico evitado'
    },
    descripcion: 'Queso fresco artesanal elaborado por la Familia García en Milpa Alta. Hecho con leche de vacas alimentadas con pasto orgánico. Suave, cremoso y con el auténtico sabor tradicional.',
    beneficios: [
      'Elaborado con leche de vacas alimentadas con pasto',
      'Sin conservadores ni aditivos artificiales',
      'Proceso artesanal que preserva tradiciones',
      'Apoya a productores locales de lácteos'
    ],
    disponibilidad: 'Entrega en 24-48 horas',
    relacionados: ['manzanas-rojas', 'frijoles-negros', 'miel-abeja']
  },
  {
    id: 'miel-abeja',
    nombre: 'Miel de Abeja Pura',
    precio: 120.00,
    unidad: '500g',
    imagen: '/products/miel-abeja.jpg',
    productor: 'Apiario Las Abejas Felices',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'dulces',
    rating: 5.0,
    reviews: 8,
    stock: 4,
    badges: ['NUEVO', 'Artesanal'],
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '15L agua',
      plastico: '80g plástico evitado'
    },
    descripcion: 'Miel de abeja pura producida por Apiario Las Abejas Felices en Xochimilco. 100% natural, sin aditivos ni procesos industriales. Recolectada de manera ética respetando a las abejas y su ecosistema.',
    beneficios: [
      'Propiedades antibacterianas y antioxidantes',
      'Sin procesos industriales ni aditivos',
      'Apoya la conservación de abejas y polinizadores',
      'Producción ética que respeta el ecosistema'
    ],
    disponibilidad: 'Entrega en 24-48 horas',
    relacionados: ['manzanas-rojas', 'frijoles-negros', 'queso-fresco']
  }
]

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

export default function ProductoPage({ params }: { params: { id: string } }) {
  // Usar React.use() para desenvolver params.id en Next.js 15
  const { id } = React.use(params);
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    // En un proyecto real, esto sería una llamada a API
    const foundProduct = productos.find(p => p.id === id)
    
    if (foundProduct) {
      setProduct(foundProduct)
      
      // Obtener productos relacionados
      if (foundProduct.relacionados && foundProduct.relacionados.length > 0) {
        const related = productos.filter(p => 
          foundProduct.relacionados.includes(p.id)
        )
        setRelatedProducts(related)
      }
      
      // Verificar si el producto está en favoritos
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setIsFavorite(savedFavorites.includes(foundProduct.id))
    }
    
    setLoading(false)
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    
    // En un proyecto real, esto se conectaría con un estado global o API
    const cartItem = {
      id: product.id,
      name: product.nombre,
      price: product.precio,
      quantity: quantity,
      image: product.imagen,
      unit: product.unidad
    }
    
    // Guardar en localStorage como ejemplo
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id)
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity
    } else {
      existingCart.push(cartItem)
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart))
    
    // Mostrar feedback
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
      setIsCartOpen(true)
    }, 1000)
  }

  const toggleFavorite = () => {
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    
    // En un proyecto real, esto se guardaría en un estado global o API
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter((id: string) => id !== product.id)
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    } else {
      favorites.push(product.id)
      localStorage.setItem('favorites', JSON.stringify(favorites))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B15543]"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
        <p className="text-gray-600 mb-6">Lo sentimos, el producto que buscas no está disponible.</p>
        <Link href="/tienda">
          <Button className="bg-[#B15543] hover:bg-[#9d4a39] text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F2E8] pb-16">
      {/* Header verde */}
      <div className="bg-[#33503E] text-white px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Tienda Arca Tierra</h1>
            <Button
              onClick={() => setIsCartOpen(true)}
              variant="outline"
              className="relative border-white text-white hover:bg-white hover:text-[#33503E] transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-[#B15543] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {JSON.parse(localStorage.getItem('cart') || '[]').reduce((total: number, item: any) => total + item.quantity, 0)}
              </span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E3DBCB] px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-[#33503E]">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/tienda" className="hover:text-[#33503E]">Tienda</Link>
            <span className="mx-2">/</span>
            <Link href={`/tienda?categoria=${product.categoria}`} className="hover:text-[#33503E] capitalize">
              {product.categoria}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#B15543] font-medium">{product.nombre}</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Imagen del producto */}
            <div className="relative">
              <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F2E8] flex items-center justify-center">
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badges.map((badge: string, index: number) => (
                  <span 
                    key={index} 
                    className={`${getBadgeClass(badge)} text-white font-medium px-3 py-1 rounded-full shadow-sm`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Información del producto */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nombre}</h1>
              
              {/* Productor y ubicación */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#33503E] font-medium">{product.productor}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{product.ubicacion}</span>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-amber-600 font-medium">{product.rating}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{product.reviews} reseñas</span>
              </div>
              
              {/* Precio */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#B15543]">
                    ${product.precio.toFixed(2)}
                  </span>
                  <span className="text-gray-500">/ {product.unidad}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Incluye IVA. Envío calculado al finalizar la compra.
                </p>
              </div>
              
              {/* Descripción */}
              <p className="text-gray-700 mb-6">
                {product.descripcion}
              </p>
              
              {/* Métricas ambientales */}
              <div className="flex items-center justify-between p-4 bg-[#F5F2E8] rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">{product.metricas.co2} evitado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">{product.metricas.agua} ahorrada</span>
                </div>
                <div className="flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">{product.metricas.plastico}</span>
                </div>
              </div>
              
              {/* Cantidad y botones */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 ${
                    addedToCart 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-[#B15543] hover:bg-[#9d4a39]'
                  } text-white font-semibold py-6 transition-all`}
                  disabled={addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <span className="mr-2">✓</span>
                      Agregado
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Agregar al Carrito
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={toggleFavorite}
                  variant="outline"
                  className={`p-3 ${
                    isFavorite
                      ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  } transition-all`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                </Button>
                
                <Button
                  variant="outline"
                  className="p-3 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Disponibilidad */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#33503E]" />
                  <span>{product.disponibilidad}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#33503E]" />
                  <span>Cosechado hace 1-2 días</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#33503E]" />
                  <span>Garantía de frescura</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Beneficios */}
          <div className="border-t border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Beneficios</h2>
            <ul className="grid md:grid-cols-2 gap-3">
              {product.beneficios.map((beneficio: string, index: number) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#B15543] flex items-center justify-center text-white">
                    ✓
                  </div>
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">También te puede interesar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link href={`/producto/${relatedProduct.id}`} key={relatedProduct.id}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className="aspect-square relative">
                      <img
                        src={relatedProduct.imagen}
                        alt={relatedProduct.nombre}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      {relatedProduct.badges && relatedProduct.badges.length > 0 && (
                        <div className="absolute top-3 left-3">
                          <span 
                            className={`${getBadgeClass(relatedProduct.badges[0])} text-white font-medium px-3 py-1 rounded-full shadow-sm`}
                          >
                            {relatedProduct.badges[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 hover:text-[#B15543] transition-colors">{relatedProduct.nombre}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#B15543] font-semibold">
                          ${relatedProduct.precio.toFixed(2)} / {relatedProduct.unidad}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm">{relatedProduct.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Carrito lateral */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

