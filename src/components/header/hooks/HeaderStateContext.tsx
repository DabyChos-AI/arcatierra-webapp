'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { shouldHaveTransparentHeader } from '../../layout/HeaderDetector';

// Hook para detectar el tamaño de la ventana
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    isMounted: false
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMounted: true
      });
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}

// Hook para detectar scroll
function useScrollDetection() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
}

// Función helper para calcular breakpoints
function getBreakpointFromWidth(width: number | undefined, isMounted: boolean) {
  if (!isMounted || !width) return 'desktop';
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet'; 
  if (width < 1400) return 'desktop-small';
  return 'desktop';
}

interface HeaderStateContextType {
  isTransparent: boolean;
  isScrolled: boolean;
  windowSize: { width: number | undefined; height: number | undefined; isMounted: boolean };
  breakpoint: string;
  pathname: string;
  mobileMenuOpen: boolean;
  userDropdownOpen: boolean;
  activeSubmenu: string | null;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleUserDropdown: (e: React.MouseEvent) => void;
  toggleSubmenu: (e: React.MouseEvent, name: string) => void;
}

const HeaderStateContext = createContext<HeaderStateContextType | undefined>(undefined);

export function HeaderStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isScrolled = useScrollDetection();
  const windowSize = useWindowSize();
  const breakpoint = getBreakpointFromWidth(windowSize.width, windowSize.isMounted);
  
  const isTransparent = shouldHaveTransparentHeader(pathname);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setUserDropdownOpen(false);
      setActiveSubmenu(null);
    };

    if (userDropdownOpen || activeSubmenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userDropdownOpen, activeSubmenu]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    console.log('🔥 toggleMobileMenu called, current state:', mobileMenuOpen);
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => setMobileMenuOpen(false);
  
  const toggleUserDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserDropdownOpen(!userDropdownOpen);
  };
  
  const toggleSubmenu = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  const value = {
    isTransparent,
    isScrolled,
    windowSize,
    breakpoint,
    pathname,
    mobileMenuOpen,
    userDropdownOpen,
    activeSubmenu,
    toggleMobileMenu,
    closeMobileMenu,
    toggleUserDropdown,
    toggleSubmenu,
  };

  return (
    <HeaderStateContext.Provider value={value}>
      {children}
    </HeaderStateContext.Provider>
  );
}

export function useHeaderState() {
  const context = useContext(HeaderStateContext);
  if (context === undefined) {
    throw new Error('useHeaderState must be used within a HeaderStateProvider');
  }
  return context;
}

// Export useBreakpoint for components that only need breakpoint
export function useBreakpoint() {
  const { breakpoint } = useHeaderState();
  return breakpoint;
}
