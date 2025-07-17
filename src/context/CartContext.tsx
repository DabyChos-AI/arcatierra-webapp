'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Definir la interfaz para el contexto
interface CartContextType {
  isCartOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
}

// Crear el contexto con valores predeterminados
const CartContext = createContext<CartContextType>({
  isCartOpen: false,
  toggleCart: () => {},
  openCart: () => {},
  closeCart: () => {},
  cartCount: 0,
});

// Hook personalizado para usar el contexto
export const useCart = () => useContext(CartContext);

// Proveedor del contexto
export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Estado para controlar si el carrito está abierto
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Estado para el contador de items en el carrito
  const [cartCount, setCartCount] = useState(0);

  // Función para abrir el carrito
  const openCart = () => setIsCartOpen(true);
  
  // Función para cerrar el carrito
  const closeCart = () => setIsCartOpen(false);
  
  // Función para alternar el estado del carrito
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // Efecto para calcular el total de items en el carrito
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('arcaTierraCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartCount(parsedCart.reduce((sum: number, item: any) => sum + item.quantity, 0));
      } else {
        setCartCount(0);
      }
    };

    // Actualizar contador al montar y cuando cambie el carrito
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Proveer los valores del contexto
  return (
    <CartContext.Provider value={{ isCartOpen, toggleCart, openCart, closeCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
