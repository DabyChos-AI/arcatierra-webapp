// Configuración centralizada de navegación para el header
// Todas las definiciones de menús, submenús y estructura de navegación

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export interface NavigationItem {
  name: string;
  href: string;
  hasSubmenu?: boolean;
  submenuItems?: NavigationItem[];
}

export interface ActionIcon {
  name: string;
  href: string;
  icon: string;
}

// NAVEGACIÓN PRINCIPAL (visible en desktop)
export const mainNavigation: NavigationItem[] = [
  {
    name: 'Tienda',
    href: '/tienda',
    hasSubmenu: true,
    submenuItems: [
      { name: 'Todas las categorías', href: '/tienda' },
      { name: 'Frutas y Verduras', href: '/tienda?categoria=Frutas y Verduras' },
      { name: 'Granos y Cereales', href: '/tienda?categoria=Granos y Cereales' },
      { name: 'Proteínas Regenerativas', href: '/tienda?categoria=Proteínas Regenerativas' },
      { name: 'Endulzantes naturales', href: '/tienda?categoria=Endulzantes naturales' },
      { name: 'Café, cacao y chocolate', href: '/tienda?categoria=Café, cacao y chocolate' },
      { name: 'Canastas agroecológicas', href: '/tienda?categoria=Canastas agroecológicas' },
      { name: 'Especias y Condimentos', href: '/tienda?categoria=Especias y Condimentos' },
      { name: 'Mermeladas y untables naturales', href: '/tienda?categoria=Mermeladas y untables naturales' },
      { name: 'Harinas y pastas orgánicas', href: '/tienda?categoria=Harinas y pastas orgánicas' },
      { name: 'Infusiones Naturales', href: '/tienda?categoria=Infusiones Naturales' },
      { name: 'Huevo y lácteos', href: '/tienda?categoria=Huevo y lácteos' },
      { name: 'Maíz', href: '/tienda?categoria=Maíz' },
      { name: 'Recetas', href: '/recetas' },
    ]
  },
  {
    name: 'Experiencias',
    href: '/experiencias',
    hasSubmenu: true,
    submenuItems: [
      { name: 'Públicas', href: '/experiencias?tipo=publica' },
      { name: 'Privadas', href: '/experiencias?tipo=privada' },
      { name: 'Calendario Experiencias', href: '/calendario' }
    ]
  },
  {
    name: 'Baldío',
    href: '/baldio'
  },
  {
    name: 'Catering',
    href: '/catering'
  },
  {
    name: 'Nosotros',
    href: '/nosotros',
    hasSubmenu: true,
    submenuItems: [
      { name: 'Sobre Nosotros', href: '/nosotros' },
      { name: 'Prensa', href: '/prensa' },
      { name: 'Restaurantes', href: '/restaurantes' },
      { name: 'Impacto Ambiental', href: '/impacto' },
      { name: 'Favoritos', href: '/favoritos' },
      { name: 'Contacto', href: '/contacto' },
      { name: 'Blog', href: '/blog' },
      { name: 'Términos y Condiciones', href: '/terminos' },
      { name: 'Política de Privacidad', href: '/privacidad' }
    ]
  }
];

// SECCIONES ADICIONALES (solo en menú hamburguesa)
export const additionalSections: NavigationItem[] = [
  {
    name: 'Prensa',
    href: '/prensa'
  },
  {
    name: 'Restaurantes',
    href: '/restaurantes'
  },
  {
    name: 'Impacto Ambiental',
    href: '/impacto'
  },
  {
    name: 'Favoritos',
    href: '/favoritos'
  },
  {
    name: 'Contacto',
    href: '/contacto'
  }
];

// ICONOS DE ACCIÓN (solo desktop >=2000px)
// Iconos eliminados por solicitud del usuario - solo se mantiene el carrito
export const actionIcons: ActionIcon[] = [];

// MENÚ DE USUARIO BASE (dropdown)
export const userMenuItemsBase: NavigationItem[] = [
  { name: 'Mi Perfil', href: '/usuario/perfil' },
  { name: 'Mis Reservas', href: '/usuario/reservas' },
  { name: 'Favoritos', href: '/usuario/favoritos' },
  { name: 'Mi Dashboard', href: '/usuario/dashboard' }
];

// MENÚ DE USUARIO ADMIN (solo empleados)
export const userMenuItemsAdmin: NavigationItem[] = [
  { name: 'Panel de Administración', href: '/admin' }
];

// MENÚ DE USUARIO MÓVIL (más opciones)
export const mobileUserMenuItems: NavigationItem[] = [
  { name: 'Mi Perfil', href: '/user-dashboard' },
  { name: 'Mis Reservas', href: '/user-dashboard/reservations' },
  { name: 'Favoritos', href: '/user-dashboard/favorites' },
  { name: 'Recomendaciones', href: '/user-dashboard/recommendations' }
];

// CONFIGURACIÓN COMPLETA PARA MENÚ HAMBURGUESA
// Combina navegación principal + secciones adicionales en el orden especificado
export const hamburgerMenuItems: NavigationItem[] = [
  ...mainNavigation,
  ...additionalSections
];

// FUNCIONES UTILITARIAS
export const getMainNavigation = (): NavigationItem[] => mainNavigation;
export const getHamburgerMenuItems = (): NavigationItem[] => hamburgerMenuItems;
export const getActionIcons = (): ActionIcon[] => actionIcons;

// Hook para obtener items de menú dinámicamente según rol
export const useUserMenuItems = (): NavigationItem[] => {
  const { data: session, status } = useSession();
  const [isEmployee, setIsEmployee] = useState(false);
  const [checkingEmployee, setCheckingEmployee] = useState(false);

  useEffect(() => {
    const checkIfEmployee = async () => {
      if (status !== 'authenticated' || !session?.user?.email || checkingEmployee) {
        return;
      }
      
      setCheckingEmployee(true);
      try {
        const response = await fetch(
          `${API_URL}/api/auth/check-employee?email=${encodeURIComponent(session.user.email)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setIsEmployee(data.is_employee);
        }
      } catch (error) {
        console.error('Error checking employee status:', error);
        setIsEmployee(false);
      } finally {
        setCheckingEmployee(false);
      }
    };

    checkIfEmployee();
  }, [session, status]);

  // Retornar items base + admin si es empleado
  return isEmployee 
    ? [...userMenuItemsBase, ...userMenuItemsAdmin]
    : userMenuItemsBase;
};

// Función estática (deprecated - usar useUserMenuItems)
export const getUserMenuItems = (): NavigationItem[] => userMenuItemsBase;
export const getMobileUserMenuItems = (): NavigationItem[] => mobileUserMenuItems;

// Función para determinar si un ítem debe ser visible según el breakpoint
export const getNavigationForBreakpoint = (breakpoint: 'desktop' | 'tablet' | 'mobile') => {
  switch (breakpoint) {
    case 'desktop':
      return {
        visible: mainNavigation,
        hamburger: []
      };
    case 'tablet':
    case 'mobile':
      return {
        visible: [], // Todo va al hamburguesa en móvil
        hamburger: hamburgerMenuItems
      };
    default:
      return {
        visible: mainNavigation,
        hamburger: []
      };
  }
};
