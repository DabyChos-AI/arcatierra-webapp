'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { announcementMessages, AnnouncementMessage } from '@/data/announcementMessages';

export default function AnnouncementBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  // MOV1 (R1): el banner es de la tienda. En el panel (/admin), sticky y en z-[999], tapaba a 390 px la
  // franja de arriba del cajón del menú (z-50) y su botón «Cerrar menu». Mismo criterio que el menú
  // público (HD1) y el tirador «Carrito» (ADM1): en /admin no se pinta.
  const enAdmin = usePathname()?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (enAdmin) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcementMessages.length);
        setIsVisible(true);
      }, 500); // Tiempo para fade out
      
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [enAdmin]);

  // Después de todos los hooks
  if (enAdmin) return null;

  const currentMessage: AnnouncementMessage = announcementMessages[currentIndex];

  return (
    <div
      data-testid="announcement-banner"
      className="sticky top-0 z-[999] h-[28px]"
      style={{ background: '#F97316' }}
    >
      <div className="max-w-7xl mx-auto px-4 relative flex items-center h-full">
        {/* Flecha izquierda */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              setCurrentIndex((prev) => (prev - 1 + announcementMessages.length) % announcementMessages.length);
              setIsVisible(true);
            }, 300);
          }}
          className="absolute left-2 z-10 p-1 hover:bg-white/30 rounded-full transition-colors"
          aria-label="Mensaje anterior"
        >
          <ChevronRight className="h-4 w-4 rotate-180 text-white" />
        </button>

        {/* Contenido del mensaje */}
        <div 
          className={`
            flex-1
            flex items-center justify-center gap-2 
            text-xs text-white font-medium
            transition-opacity duration-500
            ${isVisible ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <span className="text-center">
            {currentMessage.text}
          </span>
          <Link 
            href={currentMessage.linkUrl}
            className="
              flex items-center gap-1 
              text-white hover:text-white/80 
              font-bold underline decoration-white/50
              hover:decoration-white
              transition-colors whitespace-nowrap
            "
          >
            {currentMessage.linkText}
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>
        </div>

        {/* Flecha derecha */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              setCurrentIndex((prev) => (prev + 1) % announcementMessages.length);
              setIsVisible(true);
            }, 300);
          }}
          className="absolute right-2 z-10 p-1 hover:bg-white/30 rounded-full transition-colors"
          aria-label="Siguiente mensaje"
        >
          <ChevronRight className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
