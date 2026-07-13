'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useHeaderState } from './hooks/HeaderStateContext';
import { useCart } from './hooks/useCart';
import { getActionIcons, useUserMenuItems } from './NavigationConfig';

// Estilos para la sección de acciones
const actionStyles = {
  section: (gap: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap,
  }),
  
  iconButton: (isTransparent: boolean, isScrolled: boolean) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: isTransparent && !isScrolled ? 'white' : 'var(--arcatierra-verde-tipografia)',
    padding: '0.4rem',
    transition: 'all 0.3s',
    borderRadius: '4px',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  }),
  
  cartIcon: (isTransparent: boolean, isScrolled: boolean) => ({
    color: isTransparent && !isScrolled 
      ? 'white' 
      : 'var(--arcatierra-verde-tipografia)',
    position: 'relative' as const,
    fontSize: '1.5rem',
  }),
  
  cartBadge: (isSmall: boolean) => ({
    position: 'absolute' as const,
    top: '-5px',
    right: '-5px',
    backgroundColor: 'var(--arcatierra-verde-principal)',
    color: 'white',
    borderRadius: '50%',
    width: isSmall ? '16px' : '18px',
    height: isSmall ? '16px' : '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: isSmall ? '0.65rem' : '0.7rem',
    fontWeight: 'bold',
  }),
  
  userButton: (isSmall: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: '1px solid var(--arcatierra-gris-azulado)',
    padding: isSmall ? '0.4rem' : '0.5rem 1rem',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: 'var(--arcatierra-verde-tipografia)',
    minWidth: isSmall ? '32px' : 'auto',
    justifyContent: 'center',
  }),
  
  userAvatar: (isTransparent: boolean, isScrolled: boolean) => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: isTransparent && !isScrolled 
      ? 'var(--arcatierra-verde-oscuro)' 
      : 'var(--arcatierra-terracota-principal)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 600,
    border: isTransparent && !isScrolled 
      ? 'none' 
      : '1px solid var(--arcatierra-verde-tipografia)',
    boxShadow: isTransparent && !isScrolled 
      ? 'none' 
      : '0 1px 3px rgba(0,0,0,0.2)'
  }),
  
  loginButton: (isSmall: boolean) => ({
    background: 'var(--arcatierra-terracota-principal)',
    color: 'white',
    padding: isSmall ? '0.4rem' : '0.5rem 1.5rem',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: isSmall ? '0.8rem' : '1rem',
    minWidth: isSmall ? '70px' : 'auto',
  }),
  
  userDropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    minWidth: '200px',
    zIndex: 1001,
    marginTop: '8px',
  },
  
  dropdownItem: {
    display: 'block',
    padding: '0.75rem 1rem',
    color: 'var(--arcatierra-verde-tipografia)',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  
  hamburgerButton: (isTransparent: boolean, isScrolled: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: isTransparent && !isScrolled ? 'white' : 'var(--arcatierra-verde-tipografia)',
    fontSize: '1.3rem',
    zIndex: 1001,
    minWidth: '36px',
    minHeight: '36px',
  }),
};

// Componente del carrito
const CartButton: React.FC = () => {
  const { isTransparent, isScrolled, breakpoint } = useHeaderState();
  const { cartCount, handleCartButtonClick } = useCart();
  
  const isSmall = breakpoint === 'mobile' || breakpoint === 'tablet';

  return (
    <button 
      onClick={handleCartButtonClick}
      style={{
        ...actionStyles.iconButton(isTransparent, isScrolled),
        position: 'relative' as const,
        padding: isSmall ? '0.4rem' : '0.5rem'
      }}
      aria-label="Carrito"
    >
      <div style={{...actionStyles.cartIcon(isTransparent, isScrolled), display: 'flex', alignItems: 'center'}}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        {cartCount > 0 && (
          <span style={actionStyles.cartBadge(isSmall)}>
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </div>
    </button>
  );
};

// Componente de iconos de acción (solo desktop >=2000px)
const ActionIcons: React.FC = () => {
  const { isTransparent, isScrolled, breakpoint } = useHeaderState();
  const actionIcons = getActionIcons();

  // Solo mostrar en desktop muy grande
  if (breakpoint !== 'desktop') return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {actionIcons.map((icon) => {
        const handleClick = () => window.location.href = icon.href;
        
        return (
          <button
            key={icon.name}
            onClick={handleClick}
            style={actionStyles.iconButton(isTransparent, isScrolled)}
            aria-label={icon.name}
          >
            {icon.icon === 'recycle' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            )}
            {icon.icon === 'heart' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            )}
            {icon.icon === 'phone' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            )}
            <span className="sr-only">{icon.name}</span>
          </button>
        );
      })}
    </div>
  );
};

// Componente de usuario
const UserSection: React.FC = () => {
  const { data: session } = useSession();
  const { 
    isTransparent, 
    isScrolled, 
    breakpoint, 
    userDropdownOpen, 
    toggleUserDropdown 
  } = useHeaderState();
  
  const userMenuItems = useUserMenuItems(); // Hook dinámico con verificación empleado
  const isSmall = breakpoint === 'mobile' || breakpoint === 'tablet';

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ callbackUrl: '/' });
  };

  const handleSignIn = () => {
    window.location.href = '/auth/signin';
  };

  if (session) {
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={toggleUserDropdown} 
          style={actionStyles.userButton(isSmall)}
        >
          {isSmall ? (
            <span style={actionStyles.userAvatar(isTransparent, isScrolled)}>
              {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          ) : (
            <>
              <span>{session.user?.name?.split(' ')[0] || 'Usuario'}</span>
              <i className="fas fa-chevron-down" aria-hidden="true"></i>
            </>
          )}
        </button>
      
        <AnimatePresence>
          {userDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={actionStyles.userDropdown}
            >
              {userMenuItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  style={actionStyles.dropdownItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--arcatierra-crema-principal)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {item.name}
                </Link>
              ))}
              <hr style={{ 
                margin: '0.5rem 0', 
                border: 'none', 
                borderTop: '1px solid var(--arcatierra-crema-principal)' 
              }} />
              <a 
                href="#" 
                style={actionStyles.dropdownItem}
                onClick={handleSignOut}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--arcatierra-crema-principal)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cerrar Sesión
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button 
      onClick={handleSignIn}
      style={actionStyles.loginButton(isSmall)}
    >
      {isSmall ? 'Login' : 'Iniciar Sesión'}
    </button>
  );
};

// Componente del botón hamburguesa
const HamburgerButton: React.FC = () => {
  const { isTransparent, isScrolled, breakpoint, toggleMobileMenu } = useHeaderState();

  // Solo mostrar en móvil y tablet
  if (breakpoint === 'desktop' || breakpoint === 'desktop-small') {
    return null;
  }

  return (
    <button 
      onClick={toggleMobileMenu} 
      className="header-mobile-button"
      style={actionStyles.hamburgerButton(isTransparent, isScrolled)}
      aria-label="Menú de navegación"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  );
};

// Componente principal de la sección de acciones
interface ActionSectionProps {
  className?: string;
}

const ActionSection: React.FC<ActionSectionProps> = ({ className }) => {
  const { breakpoint } = useHeaderState();
  
  const gap = breakpoint === 'mobile' || breakpoint === 'tablet' ? '0.3rem' : '0.7rem';

  return (
    <div style={actionStyles.section(gap)} className={className}>
      {/* Iconos de acción - solo desktop grande */}
      <ActionIcons />
      
      {/* Elementos esenciales */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {/* Carrito - siempre visible */}
        <CartButton />
        
        {/* Usuario - siempre visible */}
        <UserSection />

        {/* Menú hamburguesa - móvil y tablet */}
        <HamburgerButton />
      </div>
    </div>
  );
};

export default ActionSection;
export { CartButton, UserSection, HamburgerButton, ActionIcons };
