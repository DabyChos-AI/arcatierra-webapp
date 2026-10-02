'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ShoppingCart, Check, Leaf, Droplets, PackageOpen, Star, MapPin, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/data/productos'
import { useToast } from '@/components/ui/Toast'
import ProductTraceability from '@/components/ProductTraceability'
import { API_URL } from '@/lib/api'
import { leerCarrito, guardarCarrito } from '@/lib/carrito'
import { aNumero, TEXTO_AGOTADO } from '@/types/tienda'
import OptimizedImage from '@/components/ui/OptimizedImage'

/**
 * R2 (STK3-ficha): la ficha de un agotado responde 200 con `en_venta=false` → «Agotado por ahora», sin selector ni
 * botón (DR7, C2 de David). `stock` = unidades enteras disponibles (`disponible`; si el back viejo no lo manda,
 * `stock_actual`, que podía llegar como texto «90.0000»).
 */
type ProductoFicha = Product & {
  enVenta: boolean
  /** Itemcode que entra al carrito: en una canasta, el de COMPRA ÚNICA (con U), como la tarjeta de la tienda (FIC1). */
  itemcodeCarrito: string
  /** false = no hay precio de compra única que mostrar (la canasta U no existe): solo «Agotado por ahora». */
  conPrecio: boolean
}

/** Canastas 1885–1891, con o sin U (igual que `esCanasta` de `app/tienda/page.tsx`). */
function esCanasta(itemcode: string): boolean {
  return /^188[5-9]U?$/.test(itemcode) || /^189[0-1]U?$/.test(itemcode)
}

/** Datos de venta de una fila de `/api/products/{itemcode}`: precio, unidades enteras y en_venta. */
function ventaDe(api: { precio_unitario?: unknown; en_venta?: unknown; disponible?: unknown; stock_actual?: unknown }) {
  const disponible = disponibleDe(api)
  const enVenta = typeof api.en_venta === 'boolean' ? api.en_venta : disponible >= 1
  return { precio: parseFloat(String(api.precio_unitario)), stock: enVenta ? disponible : 0, enVenta }
}

function disponibleDe(api: { disponible?: unknown; stock_actual?: unknown }): number {
  const crudo = api.disponible !== undefined && api.disponible !== null ? api.disponible : api.stock_actual
  return Math.max(0, Math.floor(aNumero(crudo)))
}

// Helper: imagen de canastas por nombre
function getCanastaImage(nombre: string, original?: string): string {
  const n = nombre.toLowerCase()
  if (n.includes('canasta individual')) return '/images/canastas/canastaindividual.jpg'
  if (n.includes('canasta media')) return '/images/canastas/canastamedia.jpg'
  if (n.includes('canasta completa')) return '/images/canastas/canastacompleta.jpg'
  if (n.includes('canasta familiar')) return '/images/canastas/canastafamiliar.jpg'
  return original && original.trim() !== '' ? original : '/placeholder-product.jpg'
}

type ClientProductoPageProps = {
  id: string;
};

export default function ClientProductoPage({ id }: ClientProductoPageProps) {
  const router = useRouter()
  const [producto, setProducto] = useState<ProductoFicha | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [favoritos, setFavoritos] = useState<string[]>([])
  const toast = useToast() // Usar el sistema global de toast
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar producto desde la API usando el itemcode
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const apiUrl = API_URL
        const response = await fetch(`${apiUrl}/api/products/${id}`)
        
        if (response.ok) {
          const apiProduct = await response.json()
          
          // Mapear producto de la API al formato local.
          // FIC1 (R7): una canasta base (sin U) se vende como COMPRA ÚNICA, igual que la tarjeta de la tienda:
          // precio, stock y en_venta de la canasta U; si no existe, «Agotado por ahora» (nunca el precio de la suscripción).
          let venta = ventaDe(apiProduct)
          let itemcodeCarrito: string = apiProduct.itemcode
          let conPrecio = true
          if (esCanasta(apiProduct.itemcode) && !apiProduct.itemcode.endsWith('U')) {
            itemcodeCarrito = `${apiProduct.itemcode}U`
            const resCu = await fetch(`${apiUrl}/api/products/${encodeURIComponent(itemcodeCarrito)}`)
            if (resCu.ok) {
              venta = ventaDe(await resCu.json())
            } else {
              venta = { precio: 0, stock: 0, enVenta: false }
              conPrecio = false
            }
          }
          const mappedProduct: ProductoFicha = {
            id: apiProduct.itemcode,
            itemcodeCarrito,
            conPrecio,
            nombre: apiProduct.nombre,
            categoria: apiProduct.categoria || 'sin-categoria',
            precio: venta.precio,
            imagen: apiProduct.imagen_url || '',
            descripcion: apiProduct.descripcion || '',
            stock: venta.stock,
            enVenta: venta.enVenta,
            unidad: apiProduct.unidad_medida || '',
            productor: apiProduct.productor || 'Agricultor Local',
            ubicacion: apiProduct.ubicacion || 'México',
            // El estado de venta ya se pinta junto al precio (ficha-estado); sin insignia duplicada
            badges: [],
            rating: apiProduct.rating || 4.5,
            reviews: apiProduct.reviews || 0,
            metricas: {
              co2: '0kg CO2',
              agua: '0L',
              plastico: '0% plástico'
            },
            storytelling: apiProduct.descripcion || 'Producto fresco y local',
            ctaType: 'add' as const
          }
          
          setProducto(mappedProduct)
          console.log(`Producto ${id} cargado desde la API`)
        } else {
          console.error(`Producto ${id} no encontrado en la API`)
          router.push('/tienda')
        }
      } catch (error) {
        console.error('Error cargando producto desde la API:', error)
        router.push('/tienda')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()

    // Cargar favoritos desde localStorage
    try {
      const savedFavoritos = localStorage.getItem('arcaTierraFavoritos')
      if (savedFavoritos) {
        setFavoritos(JSON.parse(savedFavoritos))
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

  // Función para añadir al carrito.
  // R2 (STK3-ficha): ya NO llama a /api/cart/add (descontaba stock al agregar y el sync lo volvía a descontar).
  // Agrega al carrito local como la tienda; el stock se aparta en el checkout (sync-and-validate) y baja al pagar.
  const addToCart = () => {
    if (!producto || !producto.enVenta) return

    const cartItem = {
      id: producto.itemcodeCarrito,
      itemcode: producto.itemcodeCarrito, // en una canasta, la de compra única (FIC1)
      name: producto.nombre,
      price: producto.precio,
      quantity: cantidad,
      image: producto.imagen,
      unit: producto.unidad,
      tipo: 'producto'
    }

    try {
      const items = leerCarrito()
      const existente = items.find((item) => item.id === cartItem.id)
      if (existente) {
        existente.quantity = aNumero(existente.quantity) + cantidad
      } else {
        items.push(cartItem)
      }
      guardarCarrito(items) // escribe arcaTierraCart y dispara 'cartUpdated'

      // Toast deshabilitado - era molesto al agregar múltiples productos
      // toast.cart(`${cantidad} x ${producto.nombre} agregado al carrito`, {
      //   title: '¡Excelente elección!',
      //   action: {
      //     label: 'Ver carrito',
      //     onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
      //   }
      // })
    } catch (error) {
      console.error('Error al guardar carrito:', error)
      toast.error('No pudimos agregarlo al carrito. Intenta de nuevo.', { title: 'Carrito' })
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
            <OptimizedImage
              src={getCanastaImage(producto.nombre, producto.imagen)}
              alt={producto.nombre}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>

          {/* Miniaturas */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[0, 1, 2].map((index: number) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-green-500" onClick={() => setImagenSeleccionada(index)}>
                <OptimizedImage
                  src={getCanastaImage(producto.nombre, producto.imagen)}
                  alt={`${producto.nombre} ${index + 1}`}
                  width={160}
                  height={160}
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
            {producto.conPrecio && (
              <div className="flex items-baseline">
                <span className="text-3xl font-bold" data-testid="ficha-precio">${producto.precio.toFixed(2)}</span>
                <span className="ml-2 text-sm text-gray-500">/ {producto.unidad}</span>
              </div>
            )}
            <span
              data-testid="ficha-estado"
              data-en-venta={producto.enVenta ? 'true' : 'false'}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                producto.enVenta ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              <span className={`h-2 w-2 rounded-full mr-1 ${producto.enVenta ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true"></span>
              {producto.enVenta ? `En stock (${producto.stock} disponibles)` : TEXTO_AGOTADO}
            </span>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Descripción</h2>
            <div className="space-y-3">
              {/* Información básica */}
              <p className="text-gray-700 leading-relaxed">
                {producto.descripcion.split('CARACTERÍSTICAS:')[0]?.trim()}
              </p>
              
              {/* Lista de características con palomitas */}
              {producto.descripcion.includes('CARACTERÍSTICAS:') && (
                <div>
                  <ul className="space-y-2 mt-3">
                    {producto.descripcion
                      .split('CARACTERÍSTICAS:')[1]
                      ?.split('✅')
                      .filter(item => item.trim().length > 0)
                      .map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">{item.trim()}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Características destacadas */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Características destacadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Sin pesticidas',
                'Producción local', 
                'Comercio justo',
                'Empaque eco-friendly'
              ].map((caracteristica: string, index: number) => (
                <div key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{caracteristica}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 
          ========================================
          TRAZABILIDAD COMENTADA - Sección completa
          ========================================
          PARA REACTIVAR:
          1. Descomentar el bloque de código abajo
          2. Asegurarse de que ProductTraceability esté importado
          3. Asegurarse de que el producto tenga datos de trazabilidad
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Trazabilidad del Producto</h2>
            <ProductTraceability product={producto} compact={false} />
          </div>
          ========================================
          */}

          {/* Etiquetas */}
          <div className="flex flex-wrap gap-2">
            {producto.badges && producto.badges.map((badge: string, index: number) => (
              <Badge key={index} variant="outline">{badge}</Badge>
            ))}
          </div>

          {/* Selector de cantidad: solo si está en venta (R2: un agotado no se ofrece) */}
          {producto.enVenta ? (
            <div data-testid="ficha-cantidad">
              <h3 className="text-sm font-medium mb-2">Cantidad</h3>
              <div className="flex items-center border border-gray-200 rounded w-32">
                <button
                  type="button"
                  data-testid="ficha-cantidad-menos"
                  aria-label="Quitar uno"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                  disabled={cantidad <= 1}
                >
                  -
                </button>
                <span data-testid="ficha-cantidad-valor" className="flex-1 text-center py-1">{cantidad}</span>
                <button
                  type="button"
                  data-testid="ficha-cantidad-mas"
                  aria-label="Agregar uno"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCantidad(prev => Math.min(producto.stock, prev + 1))}
                  disabled={cantidad >= producto.stock}
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <p
              data-testid="ficha-agotado"
              role="status"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {TEXTO_AGOTADO}
            </p>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {producto.enVenta && (
              <Button
                data-testid="ficha-agregar"
                onClick={addToCart}
                className="flex-1 gap-2"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4" />
                Añadir al carrito
              </Button>
            )}
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
              Costo de envío: $100 | GRATIS en compras mayores a $1,000
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
