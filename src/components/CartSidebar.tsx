'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { X, Plus, Minus, ShoppingCart, Trash2, ChevronLeft, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { calcularCostoEnvio } from '@/lib/envio'
import { formatFechaMexico } from '@/lib/dates'
import {
  experienciasDelCarrito,
  guardarCarrito,
  leerCarrito,
  limpiarExperienciasViejas,
  quitarDelCarrito,
  vaciarCarrito,
} from '@/lib/carrito'
import {
  esItemExperiencia,
  subtotalExperiencia,
  textoPersonas,
  type ItemCarritoExperiencia,
} from '@/types/compra-experiencias'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

type ItemCarrito = ReturnType<typeof leerCarrito>[number]

/** Un producto del carrito tal como lo escriben la tienda y las recetas (forma de siempre). */
interface ItemProducto {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  unit?: string
}

function comoProducto(item: ItemCarrito): ItemProducto {
  return {
    id: item.id,
    name: String(item.name ?? ''),
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
    image: typeof item.image === 'string' ? item.image : undefined,
    unit: typeof item.unit === 'string' ? item.unit : undefined,
  }
}

/** «sáb 10 de oct · 07:00–10:00» */
function fechaYHora(exp: ItemCarritoExperiencia): string {
  const fecha = formatFechaMexico(exp.fecha, { weekday: 'short', day: 'numeric', month: 'short', year: undefined })
  return `${fecha} · ${exp.hora}${exp.hora_fin ? `–${exp.hora_fin}` : ''}`
}

/** Aviso de F3: renglones de experiencia de antes de la Fase 4 que se quitaron al abrir. */
function textoExperienciasQuitadas(n: number): string {
  return n === 1
    ? 'Quitamos 1 experiencia de tu carrito: vuelve a elegir la fecha'
    : `Quitamos ${n} experiencias de tu carrito: vuelve a elegir la fecha`
}

function Miniatura({ src, alt, experiencia = false }: { src?: string; alt: string; experiencia?: boolean }) {
  if (!src) {
    const Icono = experiencia ? CalendarDays : ShoppingCart
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white/20" aria-hidden="true">
        <Icono className="h-7 w-7 text-white/80" />
      </div>
    )
  }
  return (
    <Image src={src} alt={alt} width={64} height={64} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
  )
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter()
  // En /checkout el carrito ya es la página: sin tirador (que además tapaba la orilla del formulario a 390 px).
  const enCheckout = usePathname()?.startsWith('/checkout') ?? false
  const [cartItems, setCartItems] = useState<ItemCarrito[]>([])
  const [experienciasQuitadas, setExperienciasQuitadas] = useState(0)

  // El carrito vive en localStorage (lib/carrito). Se relee con cada `cartUpdated`, que dispara
  // guardarCarrito() desde cualquier página.
  useEffect(() => {
    const recargar = () => setCartItems(leerCarrito())
    window.addEventListener('cartUpdated', recargar)
    recargar()
    return () => window.removeEventListener('cartUpdated', recargar)
  }, [])

  // Al abrir: fuera los renglones de experiencia sin `evento_id` (el servidor ya no los acepta), con aviso.
  useEffect(() => {
    if (!isOpen) return
    setExperienciasQuitadas(limpiarExperienciasViejas())
    setCartItems(leerCarrito())
  }, [isOpen])

  // Un efecto separado para escuchar el evento toggleCartSidebar
  useEffect(() => {
    const handleToggleCartSidebar = () => {
      document.dispatchEvent(new Event('cartVisibilityChange'))
    }
    window.addEventListener('toggleCartSidebar', handleToggleCartSidebar)
    return () => window.removeEventListener('toggleCartSidebar', handleToggleCartSidebar)
  }, [])

  // Solo productos: las experiencias no tienen +/− (se cambian volviendo a elegir la fecha).
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      quitarDelCarrito(id)
      return
    }
    guardarCarrito(leerCarrito().map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const experiencias = experienciasDelCarrito(cartItems)
  const productos = cartItems.filter((item) => !esItemExperiencia(item)).map(comoProducto)
  const itemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  const subtotalProductos = productos.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const subtotalExperiencias = experiencias.reduce((sum, exp) => sum + subtotalExperiencia(exp), 0)
  const subtotal = subtotalProductos + subtotalExperiencias

  // Misma fórmula que el checkout y que el backend (services/envio.py).
  const shipping = calcularCostoEnvio(subtotalProductos, 'envio_domicilio')
  const total = subtotal + shipping

  return (
    <>
      {/* Botón flotante vertical - Visible cuando el sidebar está cerrado (client-layout no lo monta en /admin).
          z-[900]: debajo del nivel de modales (950) de Z_INDEX_HIERARCHY.md, que antes tapaba (el contador de niños a 390 px). */}
      {!isOpen && !enCheckout && (
        <button
          onClick={() => window.dispatchEvent(new Event('toggleCartSidebar'))}
          aria-label={`Abrir carrito (${itemCount})`}
          data-testid="carrito-tirador"
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-[#33503E] text-white px-2 py-5 rounded-l-lg shadow-lg z-[900] flex flex-col items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <div className="flex flex-col items-center">
            <span className="font-medium [writing-mode:vertical-lr] transform rotate-180 my-2">Carrito</span>
            <span className="bg-[#B15543] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {itemCount}
            </span>
          </div>
        </button>
      )}

      {/* Overlay de fondo oscuro - Solo visible cuando isOpen es true */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />}

      {/* Sidebar - Solo visible cuando isOpen es true */}
      {isOpen && (
        <div
          className="fixed right-0 top-0 h-[100dvh] w-full max-w-sm bg-[#33503E] shadow-xl z-[9999] transform transition-transform duration-300 flex flex-col"
          data-testid="carrito-panel"
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between p-6 border-b border-white/20 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 m-0">
              <ShoppingCart className="w-5 h-5" />
              Carrito ({cartItems.length})
            </h2>
            <button onClick={onClose} aria-label="Cerrar carrito" className="text-white hover:text-gray-300 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content con scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-6">
              {experienciasQuitadas > 0 && (
                <p
                  className="mb-4 rounded-lg bg-amarillo-bg p-3 text-sm text-verde-tipografia"
                  role="status"
                  data-testid="carrito-aviso-viejas"
                >
                  {textoExperienciasQuitadas(experienciasQuitadas)}
                </p>
              )}
              {cartItems.length === 0 ? (
                <div className="text-center text-white/70 mt-8">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Tu carrito está vacío</p>
                  <p className="text-sm mt-2">Agrega productos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {experiencias.map((exp) => (
                    <div key={exp.id} className="bg-white/10 rounded-lg p-4" data-testid={`carrito-exp-${exp.evento_id}`}>
                      <div className="flex items-start gap-3">
                        <Miniatura src={exp.image || undefined} alt={exp.name} experiencia />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm leading-snug line-clamp-2 m-0">{exp.name}</h3>
                          <p className="text-white/80 text-xs mt-1" data-testid="carrito-exp-fecha">
                            {fechaYHora(exp)}
                          </p>
                          <p className="text-white/80 text-xs" data-testid="carrito-exp-personas">
                            {textoPersonas(exp.adultos, exp.ninos)}
                          </p>
                          <div className="flex items-center justify-between mt-3 gap-2">
                            <p className="text-white/60 text-xs">Para cambiar personas, vuelve a elegir la fecha.</p>
                            <button
                              onClick={() => quitarDelCarrito(exp.id)}
                              aria-label={`Quitar ${exp.name} del carrito`}
                              data-testid="carrito-exp-quitar"
                              className="text-red-400 hover:text-red-300 p-1 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-2 text-right">
                            <span className="text-white font-semibold">${subtotalExperiencia(exp).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {productos.map((item) => (
                    <div key={item.id} className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Miniatura src={item.image || undefined} alt={item.name} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm leading-snug line-clamp-2 m-0">{item.name}</h3>
                          <p className="text-white/70 text-xs">
                            ${item.price.toFixed(2)} / {item.unit}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label={`Quitar uno de ${item.name}`}
                                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label={`Agregar uno de ${item.name}`}
                                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => quitarDelCarrito(item.id)}
                              aria-label={`Quitar ${item.name} del carrito`}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-2 text-right">
                            <span className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer fijo */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/20 bg-[#33503E] shrink-0">
              <div className="space-y-2 mb-4 text-white/90 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>{shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {subtotalProductos > 0 && subtotalProductos < 1000 && (
                  <div className="text-xs text-amber-300 bg-amber-900/30 p-2 rounded">
                    💰 Te faltan ${(1000 - subtotalProductos).toFixed(2)} en productos para envío GRATIS
                  </div>
                )}
                {subtotalProductos >= 1000 && (
                  <div className="text-xs text-green-300 bg-green-900/30 p-2 rounded">🎉 ¡Felicidades! Tu envío es GRATIS</div>
                )}
                {subtotalProductos === 0 && subtotalExperiencias > 0 && (
                  <div className="text-xs text-green-300 bg-green-900/30 p-2 rounded">
                    ✨ Las experiencias no tienen costo de envío
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mb-4 border-t border-white/20 pt-3">
                <span className="text-white font-medium text-lg">Total:</span>
                <span className="text-2xl font-bold text-white" data-testid="carrito-total">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    router.push('/checkout')
                    onClose()
                  }}
                  className="w-full bg-[#B15543] hover:bg-[#9d4a39] text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  Proceder al Pago
                </Button>
                <Button
                  onClick={vaciarCarrito}
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 py-2"
                >
                  Vaciar Carrito
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
