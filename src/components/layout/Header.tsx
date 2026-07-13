'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import LogoutButton from '../auth/LogoutButton';

interface User {
  name: string;
  email: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Cargar carrito desde localStorage
    loadCartFromStorage();
    
    // Escuchar cambios en localStorage para carrito únicamente
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'arcaTierraCart') {
        loadCartFromStorage();
      }
    };

    // Escuchar evento cartUpdated (mismo tab)
    const handleCartUpdate = () => {
      console.log('🛒 CARRITO ACTUALIZADO - Header escuchó evento cartUpdated');
      loadCartFromStorage();
    };

    console.log('✅ Header.tsx montado - Escuchando cartUpdated');
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);



  const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem('arcaTierraCart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
        
        // Calcular total de items
        const totalItems = parsedCart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (e) {
        // Si hay error al parsear, crear un carrito vacío
        setCartItems([]);
        setCartCount(0);
      }
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCartClick = () => {
    // Disparar evento para abrir el carrito lateral
    window.dispatchEvent(new CustomEvent('toggleCartSidebar'));
  };

  return (
    <>
      <header className="main-header bg-white shadow-sm border-b border-gray-100 w-full sticky top-0 z-[1050]" role="banner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center w-full">
            <div className="w-full max-w-6xl relative">
              <div className="flex items-center justify-between h-16">
                {/* Logo Container - Alineación horizontal */}
                <div className="logo-container flex-shrink-0">
                  <Link href="/" aria-label="ArcaTierra - Página de inicio" className="flex items-center space-x-2">
                    {/* Logo principal (ícono) */}
                    <OptimizedImage
                      src="/logo-arcatierra.png"
                      alt="ArcaTierra - Ícono"
                      width={40}
                      height={40}
                      className="h-8 w-auto sm:h-9"
                    />
                    {/* Logo de texto */}
                    <OptimizedImage
                      src="/logo-text.png"
                      alt="ArcaTierra - Texto"
                      width={100}
                      height={30}
                      className="h-5 w-auto sm:h-6 hidden xs:block"
                    />
                  </Link>
                </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex lg:items-center lg:justify-center flex-1 mx-auto" role="navigation" aria-label="Navegación principal">
                <ul className="flex items-center space-x-3 lg:space-x-6" role="menubar">
                  {/* Inicio eliminado, ahora solo el logo funciona como enlace a inicio */}
                  <li role="none">
                    <Link 
                      href="/tienda" 
                      role="menuitem"
                      className="nav-link text-xs lg:text-sm font-medium text-verde-tipografia hover:text-terracota transition-colors py-2 whitespace-nowrap"
                    >
                      Tienda
                    </Link>
                  </li>
                  <li role="none">
                    <Link 
                      href="/recetas" 
                      role="menuitem"
                      className="nav-link text-xs lg:text-sm font-medium text-verde-tipografia hover:text-terracota transition-colors py-2 whitespace-nowrap"
                    >
                      Recetas
                    </Link>
                  </li>
                  <li role="none">
                    <Link 
                      href="/experiencias-premium" 
                      role="menuitem"
                      className="nav-link text-xs lg:text-sm font-medium text-verde-tipografia hover:text-terracota transition-colors py-2 whitespace-nowrap"
                    >
                      Experiencias
                    </Link>
                  </li>
                  <li role="none">
                    <Link 
                      href="/catering2" 
                      role="menuitem"
                      className="nav-link text-xs lg:text-sm font-medium text-verde-tipografia hover:text-terracota transition-colors py-2 whitespace-nowrap"
                    >
                      Catering
                    </Link>
                  </li>
                  <li role="none" className="relative group">
                    <Link 
                      href="/baldio" 
                      role="menuitem"
                      className="nav-link text-xs lg:text-sm font-medium text-verde-tipografia hover:text-terracota transition-colors py-2 flex items-center whitespace-nowrap"
                    >
                      <span className="hidden lg:inline">Baldío Restaurante</span>
                      <span className="lg:hidden">Baldío</span>
                      <svg className="ml-1 h-3 w-3 lg:h-4 lg:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>
                    <div className="absolute left-0 z-10 mt-1 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                      <Link 
                        href="/baldio/menu" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Menú
                      </Link>
                      <Link 
                        href="/baldio/reservas" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Reservaciones
                      </Link>
                    </div>
                  </li>
                  <li role="none" className="relative group">
                    <button 
                      role="menuitem"
                      className="nav-link text-xs lg:text-sm font-medium text-verde-tipografia hover:text-terracota transition-colors py-2 flex items-center whitespace-nowrap bg-transparent border-0 cursor-pointer"
                    >
                      Nosotros
                      <svg className="ml-1 h-3 w-3 lg:h-4 lg:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 z-10 mt-1 w-56 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                      <Link 
                        href="/nosotros" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Sobre Nosotros
                      </Link>
                      <Link 
                        href="/prensa" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Prensa
                      </Link>
                      <Link 
                        href="/restaurantes" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Restaurantes
                      </Link>
                      <Link 
                        href="/impacto" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Impacto Ambiental
                      </Link>
                      <Link 
                        href="/favoritos" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Favoritos
                      </Link>
                      <Link 
                        href="/contacto" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Contacto
                      </Link>
                      <Link 
                        href="/blog" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Blog
                      </Link>
                      <Link 
                        href="/terminos" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Términos y Condiciones
                      </Link>
                      <Link 
                        href="/privacidad" 
                        className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100"
                      >
                        Política de Privacidad
                      </Link>
                    </div>
                  </li>
                  <li role="none">
                    <Link 
                      href="/entregas" 
                      role="menuitem"
                      className="nav-link text-xs lg:text-sm font-medium text-verde-tipografia hover:text-terracota transition-colors py-2 whitespace-nowrap"
                    >
                      Entregas
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Desktop User/Cart Actions */}
              <div className="hidden lg:flex lg:items-center space-x-1 lg:space-x-2">
                {/* Cart Button */}
                <button 
                  onClick={handleCartClick}
                  className="relative group p-1.5 lg:p-2 text-verde-tipografia hover:text-terracota focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracota rounded-md" 
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="sr-only">Carrito de compras</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-terracota text-white text-xs font-medium">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>

                {/* User Button or Login */}
                {session?.user ? (
                  <div className="relative">
                    <button className="flex items-center space-x-1 ml-2 lg:ml-4 text-verde-tipografia hover:text-terracota group p-1.5 lg:p-2">
                      <span className="text-xs lg:text-sm font-medium hidden lg:block">
                        {session.user.name || 'Usuario'}
                      </span>
                      <span className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-verde-oscuro text-white flex items-center justify-center text-xs">
                        {getInitials(session.user.name || 'Usuario')}
                      </span>
                    </button>
                    <div className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                      <Link href="/perfil" className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100">Tu perfil</Link>
                      <Link href="/pedidos" className="block px-4 py-2 text-sm text-verde-tipografia hover:bg-gray-100">Tus pedidos</Link>
                      <LogoutButton />
                      {/* Nota: El cierre de sesión ahora se maneja internamente en LogoutButton */}
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => signIn()}
                    className="ml-2 lg:ml-4 px-2 lg:px-3 py-1 lg:py-1.5 rounded text-xs lg:text-sm font-medium text-white bg-terracota hover:bg-terracota-oscuro focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracota whitespace-nowrap"
                  >
                    <span className="hidden lg:inline">Iniciar Sesión</span>
                    <span className="lg:hidden">Login</span>
                  </button>
                )}
              </div>

              {/* Mobile menu button - Solo elementos esenciales */}
              <div className="lg:hidden flex items-center gap-1.5">
                {/* Cart Icon for Mobile - Ultra minimalista */}
                <button 
                  onClick={handleCartClick}
                  className="relative p-1.5 text-verde-tipografia hover:text-terracota rounded-md" 
                  aria-label="Carrito"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-terracota text-white text-xs font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>

                {/* User Button for Mobile - Minimalista */}
                {session?.user ? (
                  <button className="p-1.5 text-verde-tipografia hover:text-terracota rounded-md">
                    <span className="h-5 w-5 rounded-full bg-verde-oscuro text-white flex items-center justify-center text-xs font-medium">
                      {getInitials(session.user.name || 'Usuario')}
                    </span>
                  </button>
                ) : (
                  <button 
                    onClick={() => signIn()}
                    className="p-1.5 text-verde-tipografia hover:text-terracota rounded-md"
                    aria-label="Login"
                  >
                    <User className="h-5 w-5" />
                  </button>
                )}

                {/* Hamburger Menu Button - Máxima visibilidad */}
                <button
                  type="button"
                  onClick={toggleMenu}
                  className="p-2 rounded-md text-verde-tipografia hover:text-terracota transition-colors duration-200"
                  aria-controls="mobile-menu"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">{isMenuOpen ? 'Cerrar menú' : 'Abrir menú principal'}</span>
                  <div className="relative w-6 h-6">
                    <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                      isMenuOpen ? 'rotate-45 translate-y-2.5' : 'translate-y-0'
                    }`} />
                    <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out translate-y-2.5 ${
                      isMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`} />
                    <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out translate-y-5 ${
                      isMenuOpen ? '-rotate-45 -translate-y-2.5' : 'translate-y-0'
                    }`} />
                  </div>
                </button>
                </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen 
              ? 'max-h-screen opacity-100 visible' 
              : 'max-h-0 opacity-0 invisible'
          }`}
          id="mobile-menu"
        >
          <div className="pt-4 pb-6 space-y-2 bg-white border-t border-gray-100">
            <Link
              href="/"
              className="block mx-4 px-4 py-3 rounded-lg text-base font-medium text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/tienda"
              className="block mx-4 px-4 py-3 rounded-lg text-base font-medium text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Tienda
            </Link>
            <Link
              href="/recetas"
              className="block mx-4 px-4 py-3 rounded-lg text-base font-medium text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Recetas
            </Link>
            <Link
              href="/experiencias-premium"
              className="block mx-4 px-4 py-3 rounded-lg text-base font-medium text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Experiencias
            </Link>
            <Link
              href="/catering2"
              className="block mx-4 px-4 py-3 rounded-lg text-base font-medium text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Catering
            </Link>
            <Link
              href="/baldio"
              className="block mx-4 px-4 py-3 rounded-lg text-base font-medium text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Baldío Restaurante
            </Link>
            <div className="mx-4 rounded-lg border-b border-gray-100">
              <div className="px-4 py-3 text-base font-semibold text-verde-oscuro">
                Nosotros
              </div>
              <Link
                href="/nosotros"
                className="block pl-8 pr-4 py-2 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/prensa"
                className="block pl-8 pr-4 py-2 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Prensa
              </Link>
              <Link
                href="/restaurantes"
                className="block pl-8 pr-4 py-2 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Restaurantes
              </Link>
              <Link
                href="/impacto"
                className="block pl-8 pr-4 py-2 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Impacto Ambiental
              </Link>
              <Link
                href="/favoritos"
                className="block pl-8 pr-4 py-2 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Favoritos
              </Link>
              <Link
                href="/contacto"
                className="block pl-8 pr-4 py-2 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <Link
                href="/blog"
                className="block pl-8 pr-4 py-2 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/terminos"
                className="block pl-8 pr-4 py-2 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Términos y Condiciones
              </Link>
              <Link
                href="/privacidad"
                className="block pl-8 pr-4 py-2 pb-3 text-sm text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Política de Privacidad
              </Link>
            </div>
            <Link
              href="/entregas"
              className="block mx-4 px-4 py-3 rounded-lg text-base font-medium text-verde-tipografia hover:bg-gray-50 hover:text-terracota transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Entregas
            </Link>

            <div className="pt-6 pb-4 mt-4 border-t border-gray-200">
              <div className="px-4">
                {session?.user ? (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-verde-oscuro text-white flex items-center justify-center text-lg font-semibold">
                          {getInitials(session.user.name || 'Usuario')}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-lg font-semibold text-verde-tipografia">{session.user.name || 'Usuario'}</div>
                        <div className="text-sm text-gray-600">{session.user.email || ''}</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Link
                        href="/perfil"
                        className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-verde-tipografia hover:bg-white transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        👤 Tu perfil
                      </Link>
                      <Link
                        href="/pedidos"
                        className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-verde-tipografia hover:bg-white transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        📦 Tus pedidos
                      </Link>
                      <button 
                        className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <span className="mr-2">🚪</span>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      signIn();
                      setIsMenuOpen(false);
                    }}
                    className="w-full rounded-xl px-6 py-4 text-lg font-semibold text-white bg-terracota hover:bg-terracota-oscuro transition-colors duration-200 shadow-lg"
                  >
                    🔐 Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 min-[2000px]:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;
