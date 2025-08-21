'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { shouldHaveTransparentHeader } from '../../layout/HeaderDetector';

// Hook para detectar el tamaño de la ventana con seguridad SSR/CSR
export function useWindowSize() {
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
export function useScrollDetection() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar estado inicial
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
}

// Hook para detectar breakpoints
export function useBreakpoint() {
  const windowSize = useWindowSize();
  
  const getBreakpoint = () => {
    if (!windowSize.isMounted || !windowSize.width) return 'desktop';
    
    if (windowSize.width < 768) return 'mobile';
    if (windowSize.width < 1200) return 'tablet'; 
    if (windowSize.width < 2000) return 'desktop-small';
    return 'desktop';
  };

  return getBreakpoint();
}

// Hook principal para el estado del header
export function useHeaderState() {
  const pathname = usePathname();
  const isScrolled = useScrollDetection();
  const windowSize = useWindowSize();
  const breakpoint = useBreakpoint();
  
  // Determinar si el header debe ser transparente
  const isTransparent = shouldHaveTransparentHeader(pathname);
  
  // Estados locales del header
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

  // Funciones para manejar estados
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  
  const toggleUserDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserDropdownOpen(!userDropdownOpen);
  };
  
  const toggleSubmenu = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  return {
    // Estados derivados
    isTransparent,
    isScrolled,
    windowSize,
    breakpoint,
    pathname,
    
    // Estados locales
    mobileMenuOpen,
    userDropdownOpen, 
    activeSubmenu,
    
    // Funciones
    toggleMobileMenu,
    closeMobileMenu,
    toggleUserDropdown,
    toggleSubmenu,
  };
}
