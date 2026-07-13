'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Minus, ShoppingCart, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/Toast'
import { useCart } from '@/context/CartContext' // Importar el hook de contexto

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter()
  
  // Función para alternar la apertura/cierre del carrito
  const onToggle = () => {
    // Disparamos el evento que será capturado por cualquier componente padre que necesite reaccionar
    const event = new CustomEvent('cartToggled', {
      detail: { isOpen: !isOpen }
    });
    window.dispatchEvent(event);
  };
  
  // También podemos usar el contexto global si está disponible
  const cartContext = useCart();

  // Obtener el toast para notificaciones
  const toast = useToast();
  
  // Obtener el total de items para mostrar en el botón flotante
  const [itemCount, setItemCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([])

  // Cargar carrito desde localStorage (DESHABILITAR BACKEND TEMPORALMENTE PARA DEMO)
  useEffect(() => {
    const loadCartFromLocalStorage = () => {
      try {
        // SOLO usar localStorage - NO leer del backend
        const savedCart = localStorage.getItem('arcaTierraCart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(parsedCart)
          setItemCount(parsedCart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0))
        } else {
          setCartItems([])
          setItemCount(0)
        }
      } catch (error) {
        console.error('Error cargando carrito:', error)
        setCartItems([])
        setItemCount(0)
      }
    }
    
    if (isOpen) {
      loadCartFromLocalStorage()
    }
  }, [isOpen])
  
  // Escuchar eventos de actualización del carrito desde localStorage SOLAMENTE
  useEffect(() => {
    const handleCartUpdate = () => {
      try {
        // SOLO leer de localStorage - NO backend
        const savedCart = localStorage.getItem('arcaTierraCart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(parsedCart)
          setItemCount(parsedCart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0))
        } else {
          setCartItems([])
          setItemCount(0)
        }
      } catch (error) {
        console.error('Error actualizando contador:', error)
        setCartItems([])
        setItemCount(0)
      }
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    // También cargar al inicio
    handleCartUpdate()
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])
  
  // Un efecto separado para escuchar el evento toggleCartSidebar
  useEffect(() => {
    // Esta función se llama cuando se hace clic en el icono de carrito en el header
    const handleToggleCartSidebar = () => {
      // Emitir evento para que se pueda capturar donde sea necesario
      document.dispatchEvent(new Event('cartVisibilityChange'));
    };
    
    // Registrar el controlador global para el clic en el icono de carrito
    window.addEventListener('toggleCartSidebar', handleToggleCartSidebar);
    
    return () => {
      window.removeEventListener('toggleCartSidebar', handleToggleCartSidebar);
    };
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    
    // Encontrar el item para mostrar su nombre en la notificación
    const itemToUpdate = cartItems.find(item => item.id === id);

    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('arcaTierraCart', JSON.stringify(updatedCart))
    
    // Disparar evento para actualizar el header
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Toast deshabilitado - era molesto al modificar múltiples productos
    // if (itemToUpdate) {
    //   toast.cart(`${itemToUpdate.name}`, {
    //     title: 'Cantidad actualizada',
    //     action: {
    //       label: 'Ver carrito',
    //       onClick: () => window.dispatchEvent(new Event('toggleCartSidebar'))
    //     }
    //   });
    // }
  }

  const removeItem = (id: string) => {
    // Encontrar el item para mostrar su nombre en la notificación
    const itemToRemove = cartItems.find(item => item.id === id);
    
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('arcaTierraCart', JSON.stringify(updatedCart))
    
    // Disparar evento para actualizar el header
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Toast deshabilitado - era molesto al eliminar múltiples productos
    // if (itemToRemove) {
    //   toast.error(`${itemToRemove.name} eliminado del carrito`, {
    //     title: 'Producto eliminado',
    //     action: {
    //       label: 'Deshacer',
    //       onClick: () => {
    //         const restoredCart = [...updatedCart, itemToRemove];
    //         setCartItems(restoredCart);
    //         localStorage.setItem('arcaTierraCart', JSON.stringify(restoredCart));
    //         window.dispatchEvent(new Event('cartUpdated'));
    //         toast.success(`${itemToRemove.name} restaurado al carrito`);
    //       }
    //     }
    //   });
    // }
  }

  const clearCart = () => {
    // Guardar una copia del carrito para posible restauración
    const previousCart = [...cartItems];
    
    setCartItems([])
    localStorage.removeItem('arcaTierraCart')
    
    // Disparar evento para actualizar el header
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Toast deshabilitado - era molesto
    // toast.warning('Se ha vaciado el carrito', {
    //   title: 'Carrito vacío',
    //   action: {
    //     label: 'Deshacer',
    //     onClick: () => {
    //       setCartItems(previousCart);
    //       localStorage.setItem('arcaTierraCart', JSON.stringify(previousCart));
    //       window.dispatchEvent(new Event('cartUpdated'));
    //       toast.success('Carrito restaurado');
    //     }
    //   }
    // });
  }

  // Separar productos de experiencias
  // LÓGICA NEGATIVA: Todo lo que NO es experiencia, es producto
  const experiencias = cartItems.filter(item => item.tipo === 'experiencia')
  const productos = cartItems.filter(item => item.tipo !== 'experiencia')
  
  // Productos de prueba (contienen "test" en nombre o descripción, o son Acedera) - no generan costo de envío
  const productosParaEnvio = productos.filter(item => {
    const nombre = item.name?.toLowerCase() || ''
    const descripcion = (item.description || item.descripcion || '')?.toLowerCase()
    const esProductoTest = nombre.includes('test') || descripcion.includes('test') || nombre.includes('acedera')
    return !esProductoTest
  })
  
  // Calcular subtotales
  const subtotalProductos = productos.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
  const subtotalProductosParaEnvio = productosParaEnvio.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
  const subtotalExperiencias = experiencias.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
  const subtotal = subtotalProductos + subtotalExperiencias
  
  // Envío SOLO se basa en productos (excluyendo productos de prueba)
  // Solo cobrar envío si HAY productos Y son menos de $1000
  const shipping = (subtotalProductosParaEnvio > 0 && subtotalProductosParaEnvio < 1000) ? 100 : 0
  const total = subtotal + shipping

  return (
    <>
      {/* Botón flotante vertical - Visible cuando el sidebar está cerrado */}
      {!isOpen && (
        <button 
          onClick={() => window.dispatchEvent(new Event('toggleCartSidebar'))}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-[#33503E] text-white px-2 py-5 rounded-l-lg shadow-lg z-[9998] flex flex-col items-center gap-2"
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
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - OCUPA TODA LA VENTANA - Solo visible cuando isOpen es true */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-[#33503E] shadow-xl z-[9999] transform transition-transform duration-300 flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Carrito ({cartItems.length})
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content con scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {cartItems.length === 0 ? (
              <div className="text-center text-white/70 mt-8">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Tu carrito está vacío</p>
                <p className="text-sm mt-2">Agrega productos para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm line-clamp-2">{item.name}</h3>
                        <p className="text-white/70 text-xs">${(item.price || 0).toFixed(2)} / {item.unit}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="mt-2 text-right">
                          <span className="text-white font-semibold">
                            ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </span>
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
          <div className="p-6 border-t border-white/20 bg-[#33503E] flex-shrink-0">
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
                <div className="text-xs text-green-300 bg-green-900/30 p-2 rounded">
                  🎉 ¡Felicidades! Tu envío es GRATIS
                </div>
              )}
              {subtotalProductos === 0 && subtotalExperiencias > 0 && (
                <div className="text-xs text-green-300 bg-green-900/30 p-2 rounded">
                  ✨ Las experiencias no tienen costo de envío
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mb-4 border-t border-white/20 pt-3">
              <span className="text-white font-medium text-lg">Total:</span>
              <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
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
                onClick={clearCart}
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

