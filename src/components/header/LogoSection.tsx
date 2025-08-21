'use client';

import React from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useBreakpoint } from './hooks/useHeaderState';

// Estilos para la sección de logos
const logoStyles = {
  container: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  
  // Logo para escritorio - Horizontal completo
  desktop: {
    position: 'relative' as const,
    width: '180px',
    height: '54px'
  },
  
  // Logo para vista intermedia (tablet) - Logo circular + texto
  intermediate: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  
  intermediateCircular: {
    position: 'relative' as const,
    width: '40px',
    height: '40px'
  },
  
  intermediateText: {
    position: 'relative' as const,
    height: '25px'
  },
  
  // Logo para móvil - Solo circular
  mobile: {
    position: 'relative' as const,
    width: '50px',
    height: '50px'
  }
};

interface LogoSectionProps {
  className?: string;
}

const LogoSection: React.FC<LogoSectionProps> = ({ className }) => {
  const breakpoint = useBreakpoint();

  const renderLogo = () => {
    switch (breakpoint) {
      case 'desktop':
      case 'desktop-small':
        return (
          <div className="header-logo-desktop" style={logoStyles.desktop}>
            <OptimizedImage 
              src="/images/logos/logo_arcatierra_horizontal.png"
              alt="Arca Tierra" 
              width={180}
              height={54}
              style={{ opacity: 1 }}
            />
          </div>
        );
        
      case 'tablet':
        return (
          <div className="header-logo-intermediate" style={logoStyles.intermediate}>
            {/* Logo circular */}
            <div style={logoStyles.intermediateCircular}>
              <OptimizedImage 
                src="/images/logos/logo_arcatierra_sin_texto.png"
                alt="Arca Tierra" 
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </div>
            
            {/* Texto del logo */}
            <div style={logoStyles.intermediateText}>
              <OptimizedImage 
                src="/images/logos/logo_arcatierra_solo_texto.png"
                alt="Arca Tierra" 
                width={80}
                height={25}
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        );
        
      case 'mobile':
      default:
        return (
          <div className="header-logo-mobile" style={logoStyles.mobile}>
            <OptimizedImage 
              src="/images/logos/logo_arcatierra_sin_texto.png"
              alt="Arca Tierra" 
              fill
              style={{ 
                objectFit: 'contain',
                opacity: 1
              }}
            />
          </div>
        );
    }
  };

  return (
    <Link href="/" style={{ textDecoration: 'none' }} className={className}>
      <div style={logoStyles.container}>
        {renderLogo()}
      </div>
    </Link>
  );
};

export default LogoSection;
