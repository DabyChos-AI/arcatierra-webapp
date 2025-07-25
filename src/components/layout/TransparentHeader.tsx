'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { signIn, signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { shouldHaveTransparentHeader } from './HeaderDetector';
// import { useCart } from '@/context/CartContext'; // Revertido a lógica original

// Hook para detectar el tamaño de la ventana con seguridad SSR/CSR
function useWindowSize() {
  // Inicializar con un estado de "no disponible" en el servidor
  const [windowSize, setWindowSize] = useState({
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    isMounted: false
  });

  useEffect(() => {
    // Solo ejecutar en el cliente
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMounted: true
      });
    }
    
    // Agregar event listener
    window.addEventListener('resize', handleResize);
    
    // Llamar al handler inmediatamente para establecer el tamaño inicial
    handleResize();
    
    // Limpiar en el desmontaje
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Array vacío significa que solo se ejecuta al montar y desmontar
  
  return windowSize;
};

// Definición de estilos inline con variables CSS para la paleta oficial
const styles = {
  header: (isTransparent: boolean, isScrolled: boolean) => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'all 0.4s ease',
    backgroundColor: isTransparent && !isScrolled 
      ? 'transparent' 
      : 'white', // Cambiado a fondo blanco
    boxShadow: isTransparent && !isScrolled 
      ? 'none' 
      : '0 2px 10px rgba(0,0,0,0.2)',
    borderBottom: 'none', // Eliminamos la línea inferior del header
  }),
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 5%',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  logo: {
    position: 'relative' as const,
    width: '150px',
    height: '50px',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
  },
  link: (isTransparent: boolean, isScrolled: boolean) => ({
    textDecoration: 'none',
    color: isTransparent && !isScrolled 
      ? 'white' 
      : 'var(--arcatierra-verde-tipografia)', // Siempre verde oscuro cuando hay fondo
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
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  loginButton: {
    background: 'var(--arcatierra-terracota-principal)',
    color: 'white',
    padding: '0.5rem 1.5rem',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
  },
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
  },
  dropdownItem: {
    display: 'block',
    padding: '0.75rem 1rem',
    color: 'var(--arcatierra-verde-tipografia)',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: '1px solid var(--arcatierra-gris-azulado)',
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: 'var(--arcatierra-verde-tipografia)',
  },
  cartIcon: (isTransparent: boolean, isScrolled: boolean) => ({
    color: isTransparent && !isScrolled 
      ? 'white' 
      : 'var(--arcatierra-verde-tipografia)',
    position: 'relative' as const,
    fontSize: '1.5rem',
  }),
  cartBadge: {
    position: 'absolute' as const,
    top: '-5px',
    right: '-5px',
    backgroundColor: 'var(--arcatierra-verde-principal)', // Verde
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  iconButton: (isTransparent: boolean, isScrolled: boolean) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: isTransparent && !isScrolled ? 'white' : 'var(--arcatierra-verde-tipografia)',
    padding: '0.4rem',
    transition: 'all 0.3s',
    borderRadius: '4px',
    textDecoration: 'none',
  }),
  mobileMenuButton: (isTransparent: boolean, isScrolled: boolean) => ({
    color: isTransparent && !isScrolled 
      ? 'white' 
      : 'var(--arcatierra-verde-tipografia)',
    fontSize: '1.5rem'
  }),
  mobileMenu: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(10px)',
  },
  mobileMenuHeaderOld: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  mobileMenuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--arcatierra-crema-principal)',
    backgroundColor: 'var(--arcatierra-crema-principal)',
  },
  mobileMenuLink: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--arcatierra-verde-tipografia)', // Verde oscuro para texto
    padding: '0.6rem 1rem', // Padding reducido para ahorrar espacio vertical y horizontal
    fontSize: '1rem', // Tamaño de fuente ligeramente reducido
    fontWeight: '500' as any,
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    textDecoration: 'none',
  },
  mobileMenuCloseButton: {
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
  mobileMenuContent: {
    padding: '1.5rem',
    overflowY: 'auto' as const,
    height: 'calc(100% - 73px)', // Altura del menú menos el header
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  mobileMenuDivider: {
    height: '1px',
    backgroundColor: 'var(--arcatierra-crema-principal)',
    margin: '1rem 0',
    width: '100%',
  },
  mobileGreeting: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--arcatierra-verde-tipografia)',
    marginBottom: '1rem',
    display: 'block',
  },
  mobileSignOutButton: {
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
  mobileSignInButton: {
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
    gap: '0.5rem',
  },
  submenu: {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    minWidth: '220px',
    backgroundColor: 'white',
    border: '1px solid var(--arcatierra-crema-principal)',
    borderRadius: '4px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    zIndex: 100,
    marginTop: '0.5rem',
    padding: '0.5rem 0',
  },
  submenuItem: {
    display: 'block',
    padding: '0.75rem 1.5rem',
    color: 'white',
    textDecoration: 'none',
    textAlign: 'center' as const,
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  cartSidebar: {
    position: 'fixed' as const,
    right: '-400px',
    top: 0,
    width: '400px',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
    transition: 'right 0.3s ease',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column' as const,
    transform: 'translateX(0)',
  },
  cartSidebarOpen: {
    right: 0,
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid var(--arcatierra-crema-principal)',
  },
  cartCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: 'var(--arcatierra-verde-tipografia)',
    cursor: 'pointer',
  },
  cartItems: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1rem',
  },
  cartFooter: {
    padding: '1rem',
    borderTop: '1px solid var(--arcatierra-crema-principal)',
    backgroundColor: 'var(--arcatierra-crema-principal)',
  }
};

const TransparentHeader: React.FC = () => {
  // NextAuth sesión real
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const isTransparent = shouldHaveTransparentHeader(pathname);
  const windowSize = useWindowSize();
  
  // Estado del carrito (lógica original que funcionaba)
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Función para cerrar el carrito
  const closeCart = () => setIsCartOpen(false);
  
  // Función para alternar el carrito
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  
  // Actualizar contador del carrito desde localStorage
  useEffect(() => {
    const updateCartCount = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedCart = localStorage.getItem('arcaTierraCart');
          if (savedCart) {
            const cartItems = JSON.parse(savedCart);
            const count = cartItems.reduce((sum: number, item: any) => {
              const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
              return sum + quantity;
            }, 0);
            setCartCount(count);
          } else {
            setCartCount(0);
          }
        } catch (error) {
          console.error('Error reading cart from localStorage:', error);
          setCartCount(0);
        }
      }
    };
    
    // Actualizar al cargar
    updateCartCount();
    
    // Escuchar eventos de actualización del carrito
    window.addEventListener('cartUpdated', updateCartCount);
    
    // Escuchar eventos para abrir/cerrar el carrito lateral
    const handleToggleCartSidebar = () => setIsCartOpen(prev => !prev);
    window.addEventListener('toggleCartSidebar', handleToggleCartSidebar);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('toggleCartSidebar', handleToggleCartSidebar);
    };
  }, []);

  // Efecto para detectar el scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Verificamos el estado inicial
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Efecto para cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Navegación principal actualizada
  const mainNav = [
    { name: 'Experiencias', href: '/experiencias', hasSubmenu: true, submenuItems: [
      { name: 'Calendario Experiencias', href: '/experiencias/calendario' },
      { name: 'Galería de Experiencias', href: '/experiencias/galeria' },
      { name: 'Experiencias (versión antigua)', href: '/experiencias-antigua' }
    ] },
    { name: 'Catering', href: '/catering' },
    { name: 'Prensa', href: '/prensa' },
    { name: 'Restaurantes', href: '/restaurantes' },
    { name: 'Baldío Restaurante', href: '/baldio' },
    { name: 'Tienda', href: '/tienda', hasSubmenu: true, submenuItems: [
      { name: 'Productos', href: '/tienda/productos' },
      { name: 'Canastas Agroecológicas', href: '/tienda/canastas' }
    ] },
    { name: 'Recetas', href: '/recetas' },
    { name: 'Nosotros', href: '/nosotros' },
  ];
  
  // Iconos de navegación
  const iconNav = [
    { name: 'Impacto Ambiental', href: '/impacto', icon: 'fa-recycle' },
    { name: 'Favoritos', href: '/favoritos', icon: 'fa-heart' },
    { name: 'Contacto', href: '/contacto', icon: 'fa-phone' },
  ];

  // Opciones del menú de usuario
  const userMenuItems = [
    { name: 'Mi Perfil', href: '/usuario/perfil' },
    { name: 'Mis Reservas', href: '/usuario/reservas' },
    { name: 'Favoritos', href: '/usuario/favoritos' },
  ];

  // Para el menú móvil
  const userDropdownLinks = [
    { name: 'Mi Perfil', href: '/user-dashboard' },
    { name: 'Mis Reservas', href: '/user-dashboard/reservations' },
    { name: 'Favoritos', href: '/user-dashboard/favorites' },
    { name: 'Recomendaciones', href: '/user-dashboard/recommendations' },
  ];

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Función de cierre de sesión real con NextAuth
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ callbackUrl: '/' });
  };

  const handleSignIn = () => {
    signIn();
  };

  const toggleSubmenu = (e: React.MouseEvent, name: string) => {
    // No prevenimos el comportamiento predeterminado para permitir navegación
    // Sólo detenemos la propagación para evitar conflictos de eventos
    e.stopPropagation();
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };
  
  // Ya no necesitamos estas funciones ya que usamos el contexto
  // const toggleCart = () => { ... };
  // const closeCart = () => { ... };
  
  // Cerrar submenús al hacer clic en cualquier parte
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveSubmenu(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header style={styles.header(isTransparent, isScrolled)}>
      <div style={styles.container}>
        {/* Logo - Siempre visible y enlace a inicio */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={styles.logo}>
            {/* Renderizamos ambos logos con clases CSS para responsividad confiable */}
            <>
              {/* Logo para escritorio - Controlado por CSS media queries */}
              <div className="header-logo-desktop" style={{ 
                position: 'relative',
                width: '180px',
                height: '54px'
              }}>
                <OptimizedImage 
                  src="/images/logos/logo_arcatierra_horizontal.png"
                  alt="Arca Tierra" 
                  width={180}
                  height={54}
                  style={{ 
                    opacity: 1
                  }} />
              </div>
              
              {/* Logo para móvil - Controlado por CSS media queries */}
              <div className="header-logo-mobile" style={{ 
                position: 'relative',
                width: '50px',
                height: '50px'
              }}>
                <OptimizedImage 
                  src="/images/logos/logo_arcatierra_sin_texto.png"
                  alt="Arca Tierra" 
                  fill
                  style={{ 
                    objectFit: 'contain',
                    opacity: 1
                  }} />
              </div>
            </>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={styles.nav} className="header-desktop-nav">
          {mainNav.map((item) => (
            <div key={item.name} style={{ position: 'relative' }}>
              {item.hasSubmenu ? (
                <a
                  href={item.href}
                  style={styles.link(isTransparent, isScrolled)}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = item.href;
                  }}
                >
                  {item.name}
                  <i className="fas fa-chevron-down ml-1" style={{ fontSize: '0.7rem', marginLeft: '5px' }}></i>
                  {pathname.startsWith(item.href) && (
                    <motion.div
                      style={styles.underline}
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
                  style={styles.link(isTransparent, isScrolled)}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = item.href;
                  }}
                >
                  {item.name}
                  {pathname.startsWith(item.href) && (
                    <motion.div
                      style={styles.underline}
                      layoutId={`underline-${item.name}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </a>
              )}
              
              {/* Submenú */}
              {item.hasSubmenu && activeSubmenu === item.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={styles.submenu}
                >
                  {item.submenuItems?.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      style={styles.submenuItem}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
          
          {/* Los iconos de navegación se han trasladado a la cuadrícula 2x2 */}
        </nav>

        {/* User Section - Solo elementos esenciales en móvil */}
        <div style={{...styles.userSection, display: 'flex', alignItems: 'center', gap: windowSize.width && windowSize.width < 2000 ? '0.3rem' : '0.7rem'}}>
          {/* Iconos solo en desktop - Ocultos completamente en móvil */}
          {windowSize.width && windowSize.width >= 2000 && (
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              {/* Impacto ambiental */}
              <a 
                href="javascript:void(0)" 
                style={{...styles.iconButton(isTransparent, isScrolled)}}
                onClick={() => window.location.href = '/impacto'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Impacto Ambiental</span>
              </a>
              
              {/* Favoritos */}
              <a 
                href="javascript:void(0)" 
                style={{...styles.iconButton(isTransparent, isScrolled)}}
                onClick={() => window.location.href = '/favoritos'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Favoritos</span>
              </a>
              
              {/* Contacto */}
              <Link href="/contacto" style={{...styles.iconButton(isTransparent, isScrolled)}}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="sr-only">Contacto</span>
              </Link>
            </div>
          )}
          
          {/* Elementos esenciales para móvil y desktop */}
          <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
            {/* Shopping Cart - Siempre visible */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new Event('toggleCartSidebar'));
              }} 
              style={{
                ...styles.iconButton(isTransparent, isScrolled), 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                position: 'relative' as const,
                padding: windowSize.width && windowSize.width < 2000 ? '0.4rem' : '0.5rem'
              }}
              aria-label="Carrito"
            >
              <div style={{...styles.cartIcon(isTransparent, isScrolled), display: 'flex', alignItems: 'center'}}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                {cartCount > 0 && (
                  <span style={{
                    ...styles.cartBadge,
                    fontSize: windowSize.width && windowSize.width < 2000 ? '0.65rem' : '0.7rem',
                    width: windowSize.width && windowSize.width < 2000 ? '16px' : '18px',
                    height: windowSize.width && windowSize.width < 2000 ? '16px' : '18px'
                  }}>{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </div>
            </button>
            
            {/* User Button - Minimalista en móvil, completo en desktop */}
            {session ? (
              <div style={{ position: 'relative' }}>
                {/* Botón de usuario adaptativo */}
                <button 
                  onClick={toggleDropdown} 
                  style={{
                    ...styles.userButton,
                    padding: windowSize.width && windowSize.width < 2000 ? '0.4rem' : '0.5rem 1rem',
                    minWidth: windowSize.width && windowSize.width < 2000 ? '32px' : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  {/* En móvil: solo iniciales, en desktop: nombre completo */}
                  {windowSize.width && windowSize.width < 2000 ? (
                    <span style={{
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
                    }}>
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
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    style={styles.userDropdown}
                  >
                    {userMenuItems.map((item) => (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        style={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--arcatierra-crema-principal)' }} />
                    <a 
                      href="#" 
                      style={styles.dropdownItem}
                      onClick={handleSignOut}
                    >
                      Cerrar Sesión
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => window.location.href = '/auth/signin'} 
              style={{
                ...styles.loginButton,
                padding: windowSize.width && windowSize.width < 2000 ? '0.4rem' : '0.5rem 1.5rem',
                fontSize: windowSize.width && windowSize.width < 2000 ? '0.8rem' : '1rem',
                minWidth: windowSize.width && windowSize.width < 2000 ? '70px' : 'auto'
              }}
            >
              {windowSize.width && windowSize.width < 2000 ? 'Login' : 'Iniciar Sesión'}
            </button>
          )}

          {/* Mobile Menu Button - Máxima visibilidad en móvil */}
          <button 
            onClick={toggleMobileMenu} 
            className="header-mobile-button"
            style={{
              display: windowSize.width && windowSize.width < 2000 ? 'flex' : 'none',
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
              minHeight: '36px'
            }}
          >
            {/* Hamburger icon usando SVG para garantizar visibilidad */}
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
        </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1999,
              }}
              onClick={toggleMobileMenu}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              style={styles.mobileMenu}
              initial={{ x: '-100%' }}
              animate={{ x: '0' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.mobileMenuHeader}>
                {/* Logos en el menú móvil - Logo sin texto + Logo solo texto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Logo sin texto */}
                  <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                    <OptimizedImage 
                      src="/images/logos/logo_arcatierra_sin_texto.png"
                      alt="Arca Tierra" 
                      width={40}
                      height={40}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  
                  {/* Logo solo letras */}
                  <div style={{ position: 'relative', height: '25px' }}>
                    <OptimizedImage 
                      src="/images/logos/logo_arcatiera_solo_texto.png"
                      alt="Arca Tierra" 
                      width={80}
                      height={25}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={toggleMobileMenu}
                  style={styles.mobileMenuCloseButton}
                >
                  <i className="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
              <div style={styles.mobileMenuContent}>
                {/* Menú principal móvil */}
                {mainNav.map((item) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    style={styles.mobileMenuLink}
                    onClick={toggleMobileMenu}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
                  </motion.a>
                ))}
                
                {/* Iconos de navegación móvil */}
                <div style={{ marginTop: '1rem' }}>
                  {iconNav.map((item) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      style={styles.mobileMenuLink}
                      onClick={toggleMobileMenu}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.name}
                    </motion.a>
                  ))}
                </div>
                
                {/* Usuario */}
                <div style={{ marginTop: '1.5rem' }}>
                  {session ? (
                    <>
                      <span style={{ 
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--arcatierra-verde-tipografia)',
                        marginBottom: '1rem',
                        display: 'block'
                      }}>
                        Hola, {session.user?.name?.split(' ')[0]}
                      </span>
                      
                      {userDropdownLinks.map((item) => (
                        <Link 
                          key={item.name} 
                          href={item.href} 
                          style={styles.mobileMenuLink}
                          onClick={toggleMobileMenu}
                        >
                          {item.name}
                        </Link>
                      ))}
                      
                      <button
                        onClick={(e) => {
                          handleSignOut(e);
                          toggleMobileMenu();
                        }}
                        style={{
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
                          textAlign: 'center' as const
                        }}
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <Link 
                      href="/auth/signin" 
                      prefetch={true}
                      onClick={() => toggleMobileMenu()}
                      style={{
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
                      }}
                    >
                      <i className="fas fa-user"></i>
                      Iniciar Sesión
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Carrito lateral manejado por CartSidebar.tsx - No duplicar aquí */}
    </header>
  );
};

export default TransparentHeader;
