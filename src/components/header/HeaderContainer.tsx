'use client';

import React from 'react';
import { HeaderStateProvider, useHeaderState } from './hooks/HeaderStateContext';
import LogoSection from './LogoSection';
import MainNavigation from './MainNavigation';
import ActionSection from './ActionSection';
import MobileMenu from './MobileMenu';

// Estilos del header container
const headerStyles = {
  header: (isTransparent: boolean, isScrolled: boolean) => ({
    position: 'fixed' as const,
    top: '28px',
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'all 0.4s ease',
    backgroundColor: isTransparent && !isScrolled 
      ? 'transparent' 
      : 'white',
    boxShadow: isTransparent && !isScrolled 
      ? 'none' 
      : '0 2px 10px rgba(0,0,0,0.2)',
    borderBottom: 'none',
  }),
  
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 5%',
    height: '60px',
    maxWidth: '1400px',
    margin: '0 auto',
  }
};

interface HeaderContainerProps {
  className?: string;
  style?: React.CSSProperties;
}

// Componente interno que usa el contexto
const HeaderContent: React.FC<HeaderContainerProps> = ({ 
  className,
  style 
}) => {
  const { isTransparent, isScrolled } = useHeaderState();

  return (
    <>
      <header 
        style={{
          ...headerStyles.header(isTransparent, isScrolled),
          ...style
        }}
        className={className}
      >
        <div style={headerStyles.container}>
          {/* Logo responsivo */}
          <LogoSection />
          
          {/* Navegación principal (solo desktop) */}
          <MainNavigation />
          
          {/* Sección de acciones (carrito, usuario, hamburguesa) */}
          <ActionSection />
        </div>
      </header>
      
      {/* Menú móvil */}
      <MobileMenu />
    </>
  );
};

// Componente principal que provee el contexto
const HeaderContainer: React.FC<HeaderContainerProps> = (props) => {
  return (
    <HeaderStateProvider>
      <HeaderContent {...props} />
    </HeaderStateProvider>
  );
};

export default HeaderContainer;
