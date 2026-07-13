'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeaderState } from './hooks/HeaderStateContext';
import { getMainNavigation } from './NavigationConfig';

// Estilos para la navegación principal
const navigationStyles = {
  nav: {
    display: 'flex',
    gap: '0.5rem',
  },
  
  link: (isTransparent: boolean, isScrolled: boolean) => ({
    textDecoration: 'none',
    color: isTransparent && !isScrolled 
      ? 'white' 
      : 'var(--arcatierra-verde-tipografia)',
    margin: '0 0.25rem',
    position: 'relative' as const,
    fontWeight: 500,
    transition: 'all 0.3s',
    fontSize: '0.9rem',
  }),
  
  underline: {
    position: 'absolute' as const,
    bottom: '-4px',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: 'var(--arcatierra-terracota-principal)',
    transformOrigin: 'left',
  },
  
  submenu: {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    minWidth: '280px',
    maxWidth: '350px',
    maxHeight: '400px',
    backgroundColor: 'white',
    border: '1px solid var(--arcatierra-crema-principal)',
    borderRadius: '4px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    zIndex: 1002,
    marginTop: '0.5rem',
    padding: '0.5rem 0',
    overflowY: 'auto' as const,
  },
  
  submenuItem: {
    display: 'block',
    padding: '0.75rem 1.5rem',
    color: 'var(--arcatierra-verde-tipografia)',
    textDecoration: 'none',
    textAlign: 'left' as const,
    transition: 'background-color 0.2s',
    whiteSpace: 'normal' as const,
    wordWrap: 'break-word' as const,
    fontSize: '0.85rem',
    borderBottom: '1px solid rgba(139, 69, 19, 0.05)',
  }
};

interface MainNavigationProps {
  className?: string;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ className }) => {
  const { 
    isTransparent, 
    isScrolled, 
    pathname, 
    activeSubmenu, 
    toggleSubmenu,
    breakpoint 
  } = useHeaderState();

  const mainNavigation = getMainNavigation();

  // Solo mostrar en desktop y desktop-small
  if (breakpoint === 'mobile' || breakpoint === 'tablet') {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    window.location.href = href;
  };

  const handleSubmenuToggle = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    toggleSubmenu(e, name);
  };

  const closeSubmenu = () => {
    // Crear un evento mock con preventDefault y stopPropagation para evitar errores
    const mockEvent = { 
      preventDefault: () => {}, 
      stopPropagation: () => {} 
    } as React.MouseEvent;
    toggleSubmenu(mockEvent, '');
  };

  return (
    <nav style={navigationStyles.nav} className={`header-desktop-nav ${className || ''}`}>
      {mainNavigation.map((item) => (
        <div key={item.name} style={{ position: 'relative' }}>
          {item.hasSubmenu ? (
            <a
              href={item.href}
              style={navigationStyles.link(isTransparent, isScrolled)}
              onClick={(e) => handleLinkClick(e, item.href)}
              onMouseEnter={(e) => handleSubmenuToggle(e, item.name)}
              className="header-nav-link"
            >
              {item.name}
              <span style={{ marginLeft: '0.3rem', fontSize: '0.8em' }}>▼</span>
              {pathname.startsWith(item.href) && (
                <motion.div
                  style={navigationStyles.underline}
                  layoutId={`underline-${item.name}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </a>
          ) : (
            <a 
              href={item.href} 
              style={navigationStyles.link(isTransparent, isScrolled)}
              onClick={(e) => handleLinkClick(e, item.href)}
              className="header-nav-link"
            >
              {item.name}
              {pathname.startsWith(item.href) && (
                <motion.div
                  style={navigationStyles.underline}
                  layoutId={`underline-${item.name}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </a>
          )}
          
          {/* Submenú */}
          <AnimatePresence>
            {item.hasSubmenu && activeSubmenu === item.name && item.submenuItems && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={navigationStyles.submenu}
                onMouseLeave={closeSubmenu}
              >
                {item.submenuItems.map((subItem, index) => (
                  <Link
                    key={`${subItem.name}-${index}`}
                    href={subItem.href}
                    style={{
                      ...navigationStyles.submenuItem,
                      backgroundColor: pathname === subItem.href ? 'rgba(139, 69, 19, 0.05)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(139, 69, 19, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = pathname === subItem.href ? 'rgba(139, 69, 19, 0.05)' : 'transparent';
                    }}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
};

export default MainNavigation;
