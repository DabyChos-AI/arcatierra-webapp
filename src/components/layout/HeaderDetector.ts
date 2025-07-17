'use client';

/**
 * Utilidad para detectar si la página actual debe tener un header transparente
 * basado en la ruta y las excepciones definidas
 */

// Rutas que nunca deben tener header transparente
const NON_TRANSPARENT_ROUTES = [
  '/contacto',
  '/favoritos',
  '/carrito',
  '/dashboard',
  '/perfil',
  '/cuenta',
  '/ordenes',
  '/user-dashboard',
  '/admin',
  '/tienda',
  '/experiencias', // Añadida para que el header no sea transparente en esta sección
  '/experiencias-premium'
];

/**
 * Verifica si una ruta específica debe tener un header transparente
 * @param pathname La ruta actual
 * @returns boolean
 */
export const shouldHaveTransparentHeader = (pathname: string): boolean => {
  // Primero verificamos si la ruta está en la lista de excepciones
  for (const route of NON_TRANSPARENT_ROUTES) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return false;
    }
  }

  // Por defecto, todas las demás rutas tendrán header transparente
  return true;
};
