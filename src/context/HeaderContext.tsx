'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { shouldHaveTransparentHeader } from '../components/layout/HeaderDetector';
import { useWindowSize, useScrollDetection, useBreakpoint } from '../components/header/hooks/useHeaderState';

interface HeaderContextType {
  // Estados derivados
  isTransparent: boolean;
  isScrolled: boolean;
  windowSize: any;
  breakpoint: string;
  pathname: string;
  
  // Estados locales
  mobileMenuOpen: boolean;
  userDropdownOpen: boolean;
  activeSubmenu: string | null;
  
  // Funciones
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleUserDropdown: (e: React.MouseEvent) => void;
  toggleSubmenu: (e: React.MouseEvent, name: string) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const toggleMobileMenu = () => {
    console.log('HeaderContext toggleMobileMenu called, current state:', mobileMenuOpen);
    setMobileMenuOpen(!mobileMenuOpen);
    console.log('HeaderContext setting state to:', !mobileMenuOpen);
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

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeaderContext = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
};
