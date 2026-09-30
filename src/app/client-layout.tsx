'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import CartSidebar from '@/components/CartSidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { SessionProvider } from 'next-auth/react';
import CartProvider from '@/context/CartContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  // G3/ADM1 (Fase 4): el carrito es de la tienda; en el panel el tirador «Carrito» tapaba la pantalla a 390 px.
  const enAdmin = usePathname()?.startsWith('/admin') ?? false;
  
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
      {/* Carrito lateral - Global, salvo en el panel */}
      {!enAdmin && <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </ToastProvider>
  );
}
