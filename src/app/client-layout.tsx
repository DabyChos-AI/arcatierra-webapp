'use client';

import { useState, useEffect } from 'react';
import CartSidebar from '@/components/CartSidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { SessionProvider } from 'next-auth/react';
import CartProvider from '@/context/CartContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Escuchar eventos de activación del carrito
  useEffect(() => {
    const handleToggleCart = () => {
      setIsCartOpen((prevState: boolean) => !prevState);
    };
    
    window.addEventListener('toggleCartSidebar', handleToggleCart);
    
    return () => {
      window.removeEventListener('toggleCartSidebar', handleToggleCart);
    };
  }, []);
  
  return (
    <ToastProvider>
      {children}
      {/* Carrito lateral - Global */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </ToastProvider>
  );
}
