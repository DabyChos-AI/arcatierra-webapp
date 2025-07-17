'use client';

import { useState, useEffect } from 'react';
import { QuoteCartProvider } from './context/QuoteCartContext';
import QuoteSidebar from './components/QuoteSidebar';

export default function CateringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuoteCartOpen, setIsQuoteCartOpen] = useState(false);
  
  useEffect(() => {
    // Manejar el evento para mostrar/ocultar el carrito de cotización
    const toggleQuoteCart = () => setIsQuoteCartOpen(prevState => !prevState);
    window.addEventListener('toggleQuoteCart', toggleQuoteCart);
    
    return () => {
      window.removeEventListener('toggleQuoteCart', toggleQuoteCart);
    };
  }, []);

  return (
    <QuoteCartProvider>
      <main>
        {children}
        
        {/* Sidebar de cotización */}
        <QuoteSidebar 
          isOpen={isQuoteCartOpen}
          onClose={() => setIsQuoteCartOpen(false)}
        />
      </main>
    </QuoteCartProvider>
  );
}
