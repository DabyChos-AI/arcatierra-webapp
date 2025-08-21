// Configuración centralizada de navegación para el header
// Todas las definiciones de menús, submenús y estructura de navegación

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
      { name: 'Canastas de frutas y verduras agroecológicas', href: '/tienda?categoria=canastas-de-frutas-y-verduras-agroecologicas' },
      { name: 'Frutas y Verduras a Granel', href: '/tienda?categoria=frutas-y-verduras-a-granel' },
      { name: 'Proteínas Regenerativas', href: '/tienda?categoria=proteinas-regenerativas' },
      { name: 'Huevo de libre pastoreo y lácteos artesanales', href: '/tienda?categoria=huevo-y-lacteos' },
      { name: 'Café, cacao y chocolate artesanal', href: '/tienda?categoria=cafe-cacao-y-chocolate' },
      { name: 'Aceites naturales', href: '/tienda?categoria=aceites-naturales' },
      { name: 'Granos y cereales integrales', href: '/tienda?categoria=granos-y-cereales-integrales' },
      { name: 'Pastas', href: '/tienda?categoria=pastas' },
      { name: 'Galletas, harinas y pan artesanales', href: '/tienda?categoria=galletas-harinas-y-pan' },
      { name: 'Endulzantes naturales', href: '/tienda?categoria=endulzantes' },
      { name: 'Especias y condimentos artesanales', href: '/tienda?categoria=especias' },
      { name: 'Tés e infusiones naturales', href: '/tienda?categoria=infusiones-y-te' },
      { name: 'Mermeladas y untables naturales', href: '/tienda?categoria=mermeladas-y-untables' },
      { name: 'Alimentos Arca Tierra', href: '/tienda' },
    ]
  },
  {
    name: 'Experiencias',
    href: '/experiencias',
    hasSubmenu: true,
    submenuItems: [
      { name: 'Públicas', href: '/experiencias#publicas' },
      { name: 'Privadas', href: '/experiencias#privadas' },
      { name: 'Calendario', href: '/calendario' },
      { name: 'Preguntas frecuentes (FAQ)', href: '/experiencias/faq' },
    ]
  },
  {
    name: 'Restaurante Baldío',
    href: '/baldio'
  },
  {
    name: 'Recetas',
    href: '/recetas'
  },
  {
    name: 'Nosotros',
    href: '/nosotros'
  },
  {
    name: 'Arca Tierra',
    href: '#',
    hasSubmenu: true,
    submenuItems: [
      { name: 'Catering', href: '/catering' },
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
    name: 'Catering',
    href: '/catering'
  },
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
  },
  {
    name: 'Términos y Condiciones',
    href: '/terminos'
  },
  {
    name: 'Política de Privacidad',
    href: '/privacidad'
  }
];

// ICONOS DE ACCIÓN (solo desktop >=2000px)
export const actionIcons: ActionIcon[] = [
  {
    name: 'Impacto Ambiental',
    href: '/impacto',
    icon: 'recycle'
  },
  {
    name: 'Favoritos',
    href: '/favoritos',
    icon: 'heart'
  },
  {
    name: 'Contacto',
    href: '/contacto',
    icon: 'phone'
  }
];

// MENÚ DE USUARIO (dropdown)
export const userMenuItems: NavigationItem[] = [
  { name: 'Mi Perfil', href: '/usuario/perfil' },
  { name: 'Mis Reservas', href: '/usuario/reservas' },
  { name: 'Favoritos', href: '/usuario/favoritos' }
];

// MENÚ DE USUARIO MÓVIL (más opciones)
export const mobileUserMenuItems: NavigationItem[] = [
  { name: 'Mi Perfil', href: '/user-dashboard' },
  { name: 'Mis Reservas', href: '/user-dashboard/reservations' },
  { name: 'Favoritos', href: '/user-dashboard/favorites' },
  { name: 'Recomendaciones', href: '/user-dashboard/recommendations' }
];

// CONFIGURACIÓN COMPLETA PARA MENÚ HAMBURGUESA
// Combina navegación principal (sin "Arca Tierra") + secciones adicionales
export const hamburgerMenuItems: NavigationItem[] = [
  ...mainNavigation.filter(item => item.name !== 'Arca Tierra'),
  ...additionalSections
];

// FUNCIONES UTILITARIAS
export const getMainNavigation = (): NavigationItem[] => mainNavigation;
export const getHamburgerMenuItems = (): NavigationItem[] => hamburgerMenuItems;
export const getActionIcons = (): ActionIcon[] => actionIcons;
export const getUserMenuItems = (): NavigationItem[] => userMenuItems;
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
