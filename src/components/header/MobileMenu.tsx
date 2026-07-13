'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useHeaderState } from './hooks/HeaderStateContext';
import { getHamburgerMenuItems, getMobileUserMenuItems } from './NavigationConfig';

// Estilos para el menú móvil
const mobileMenuStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
  },
  
  menu: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10001,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(10px)',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--arcatierra-crema-principal)',
    backgroundColor: 'var(--arcatierra-crema-principal)',
  },
  
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  
  logoCircular: {
    position: 'relative' as const,
    width: '40px',
    height: '40px'
  },
  
  logoText: {
    position: 'relative' as const,
    height: '25px'
  },
  
  closeButton: {
    background: 'var(--arcatierra-terracota-principal)',
    border: 'none',
    color: 'white',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  
  content: {
    padding: '1.5rem',
    overflowY: 'auto' as const,
    height: 'calc(100% - 73px)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  
  menuLink: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--arcatierra-verde-tipografia)',
    padding: '0.6rem 1rem',
    fontSize: '1rem',
    fontWeight: '500' as any,
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    textDecoration: 'none',
  },
  
  submenuContainer: {
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
    borderLeft: '3px solid var(--arcatierra-terracota-principal)',
  },
  
  submenuItem: {
    display: 'block',
    padding: '0.8rem 1.5rem',
    textDecoration: 'none',
    fontSize: '0.9rem',
    color: 'var(--arcatierra-verde-tipografia)',
  },
  
  divider: {
    height: '1px',
    backgroundColor: 'var(--arcatierra-crema-principal)',
    margin: '1rem 0',
    width: '100%',
  },
  
  userSection: {
    padding: '1rem',
    borderTop: '2px solid rgba(139, 69, 19, 0.1)',
    marginTop: '1rem'
  },
  
  greeting: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--arcatierra-verde-tipografia)',
    marginBottom: '1rem',
    display: 'block',
  },
  
  signOutButton: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--arcatierra-terracota-principal)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    width: '100%',
    textAlign: 'center' as const,
  },
  
  signInButton: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--arcatierra-terracota-principal)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    width: '100%',
    textAlign: 'center' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    gap: '0.5rem'
  }
};

// Componente para enlaces del menú móvil con submenús
interface MobileMenuLinkProps {
  item: any;
  isActive: boolean;
  onClose: () => void;
}

const MobileMenuLink: React.FC<MobileMenuLinkProps> = ({ item, isActive, onClose }) => {
  const [showSubmenu, setShowSubmenu] = React.useState(false);

  const handleClick = () => {
    if (item.hasSubmenu && item.submenuItems?.length > 0) {
      setShowSubmenu(!showSubmenu);
    } else {
      onClose();
    }
  };

  const handleLinkClick = (href: string) => {
    window.location.href = href;
    onClose();
  };

  return (
    <div>
      {item.hasSubmenu && item.submenuItems?.length > 0 ? (
        <button
          onClick={handleClick}
          style={{
            ...mobileMenuStyles.menuLink,
            width: '100%',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            justifyContent: 'space-between',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--arcatierra-terracota-principal)' : 'var(--arcatierra-verde-tipografia)',
            cursor: 'pointer',
          }}
        >
          {item.name}
          <span style={{ 
            transform: showSubmenu ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
            ▼
          </span>
        </button>
      ) : (
        <a
          href={item.href}
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick(item.href);
          }}
          style={{
            ...mobileMenuStyles.menuLink,
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--arcatierra-terracota-principal)' : 'var(--arcatierra-verde-tipografia)',
          }}
        >
          {item.name}
        </a>
      )}

      {/* Submenú */}
      <AnimatePresence>
        {showSubmenu && item.submenuItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={mobileMenuStyles.submenuContainer}
          >
            {item.submenuItems.map((subItem: any, index: number) => (
              <a
                key={`${subItem.name}-${index}`}
                href={subItem.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(subItem.href);
                }}
                style={mobileMenuStyles.submenuItem}
              >
                {subItem.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        height: '1px',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        margin: '0 1rem',
      }} />
    </div>
  );
};

// Componente principal del menú móvil
interface MobileMenuProps {
  className?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ className }) => {
  const { data: session } = useSession();
  const { 
    mobileMenuOpen, 
    closeMobileMenu, 
    pathname,
    breakpoint 
  } = useHeaderState();
  
  const hamburgerMenuItems = getHamburgerMenuItems();
  const mobileUserMenuItems = getMobileUserMenuItems();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Solo mostrar en móvil y tablet
  if (breakpoint === 'desktop' || breakpoint === 'desktop-small') {
    return null;
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ callbackUrl: '/' });
    closeMobileMenu();
  };

  const handleSignIn = () => {
    window.location.href = '/auth/signin';
    closeMobileMenu();
  };

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={mobileMenuStyles.overlay}
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu Panel */}
          <motion.div
            style={mobileMenuStyles.menu}
            initial={{ x: '-100%' }}
            animate={{ x: '0' }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className={className}
          >
            {/* Header del menú con logos */}
            <div style={mobileMenuStyles.header}>
              <div style={mobileMenuStyles.logoContainer}>
                {/* Logo sin texto */}
                <div style={mobileMenuStyles.logoCircular}>
                  <OptimizedImage 
                    src="/images/logos/logo_arcatierra_sin_texto.png"
                    alt="Arca Tierra" 
                    width={40}
                    height={40}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                
                {/* Logo solo letras */}
                <div style={mobileMenuStyles.logoText}>
                  <OptimizedImage 
                    src="/images/logos/logo_arcatierra_solo_texto.png"
                    alt="Arca Tierra" 
                    width={80}
                    height={25}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
              
              <button 
                onClick={closeMobileMenu}
                style={mobileMenuStyles.closeButton}
                aria-label="Cerrar menú"
              >
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>

            {/* Contenido del menú */}
            <div style={mobileMenuStyles.content}>
              {/* Enlaces de navegación principales + adicionales */}
              {hamburgerMenuItems.map((item) => {
                const isActive = pathname.startsWith(item.href) && item.href !== '/';
                return (
                  <MobileMenuLink
                    key={item.name}
                    item={item}
                    isActive={isActive}
                    onClose={closeMobileMenu}
                  />
                );
              })}
              
              {/* Sección de usuario */}
              <div style={mobileMenuStyles.userSection}>
                {session ? (
                  <>
                    <span style={mobileMenuStyles.greeting}>
                      Hola, {session.user?.name?.split(' ')[0]}
                    </span>
                    
                    {mobileUserMenuItems.map((item) => (
                      <Link 
                        key={item.name} 
                        href={item.href} 
                        style={mobileMenuStyles.menuLink}
                        onClick={closeMobileMenu}
                      >
                        {item.name}
                      </Link>
                    ))}
                    
                    <button
                      onClick={handleSignOut}
                      style={mobileMenuStyles.signOutButton}
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <a
                    href="/auth/signin"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSignIn();
                    }}
                    style={mobileMenuStyles.signInButton}
                  >
                    <i className="fas fa-user"></i>
                    Iniciar Sesión
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
