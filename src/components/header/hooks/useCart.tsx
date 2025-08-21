'use client';

import { useState, useEffect } from 'react';

// Hook para manejar el carrito de compras
export function useCart() {
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Función para actualizar el contador del carrito desde localStorage
  const updateCartCount = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('arcaTierraCart');
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          const count = cartItems.reduce((sum: number, item: any) => {
            const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
            return sum + quantity;
          }, 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        setCartCount(0);
      }
    }
  };

  // Función para alternar el carrito
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  
  // Función para cerrar el carrito
  const closeCart = () => setIsCartOpen(false);

  // Función para abrir el carrito
  const openCart = () => setIsCartOpen(true);

  // Función para manejar el evento del botón del carrito
  const handleCartButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new Event('toggleCartSidebar'));
  };

  // Hook principal de efectos
  useEffect(() => {
    // Actualizar contador al cargar
    updateCartCount();
    
    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Escuchar eventos para abrir/cerrar el carrito lateral
    const handleToggleCartSidebar = () => setIsCartOpen(prev => !prev);
    window.addEventListener('toggleCartSidebar', handleToggleCartSidebar);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('toggleCartSidebar', handleToggleCartSidebar);
    };
  }, []);

  // API pública del hook
  return {
    // Estados
    cartCount,
    isCartOpen,
    
    // Funciones
    toggleCart,
    closeCart,
    openCart,
    updateCartCount,
    handleCartButtonClick,
  };
}

// Hook auxiliar para integración con lógica existente de carrito
export function useCartIntegration() {
  const updateCartCount = (count: number) => {
    localStorage.setItem('cartCount', count.toString());
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const getCartCount = () => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  };

  const addToCart = (item: any) => {
    try {
      const savedCart = localStorage.getItem('arcaTierraCart');
      const cartItems = savedCart ? JSON.parse(savedCart) : [];
      
      // Buscar si el item ya existe
      const existingItemIndex = cartItems.findIndex((cartItem: any) => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Incrementar cantidad
        cartItems[existingItemIndex].quantity += item.quantity || 1;
      } else {
        // Agregar nuevo item
        cartItems.push({ ...item, quantity: item.quantity || 1 });
      }
      
      localStorage.setItem('arcaTierraCart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const removeFromCart = (itemId: string) => {
    try {
      const savedCart = localStorage.getItem('arcaTierraCart');
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const filteredItems = cartItems.filter((item: any) => item.id !== itemId);
        localStorage.setItem('arcaTierraCart', JSON.stringify(filteredItems));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const clearCart = () => {
    localStorage.removeItem('arcaTierraCart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return { 
    updateCartCount, 
    getCartCount, 
    addToCart, 
    removeFromCart, 
    clearCart 
  };
}
