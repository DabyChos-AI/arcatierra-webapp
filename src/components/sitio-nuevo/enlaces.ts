// R15 · F1 (WF1, sesión 54): los enlaces de la maqueta (cabecera, menú del celular y pie) a las direcciones públicas de HOY.
// Cuando una fase agregue la página nueva (p. ej. /chinampas o /eventos en F3–F4), cambia aquí la dirección y RUTAS_SITIO_NUEVO.
// Sin imports: lo usan componentes de cliente y de servidor.

export interface Enlace {
  texto: string
  href: string
}

/** Cabecera de escritorio (maqueta `.topbar-nav-links`: 6 enlaces). */
export const ENLACES_CABECERA: readonly Enlace[] = [
  { texto: 'Tienda', href: '/tienda' },
  { texto: 'Experiencias', href: '/experiencias' },
  // Hoy no hay página de eventos privados: las privadas se ven en Experiencias con su filtro.
  { texto: 'Eventos', href: '/experiencias?tipo=privada' },
  { texto: 'Catering', href: '/catering' },
  // Hoy las chinampas viven en /xochimilco («Chinampas de Xochimilco»); WF5 (F4) hace la página de Chinampas.
  { texto: 'Chinampas', href: '/xochimilco' },
  { texto: 'Nosotros', href: '/nosotros' },
]

/** Menú del celular (maqueta `.burger-drawer-inner`: los 6 + Recetas y Contacto). */
export const ENLACES_MENU_CELULAR: readonly Enlace[] = [
  ...ENLACES_CABECERA,
  { texto: 'Recetas', href: '/recetas' },
  { texto: 'Contacto', href: '/contacto' },
]

/** «Quiero canasta» (maqueta: lleva a la tienda). */
export const ENLACE_QUIERO_CANASTA: Enlace = { texto: 'Quiero canasta', href: '/tienda' }

/** «Mi cuenta»: ruta protegida de hoy (sin sesión, el middleware manda al inicio de sesión y regresa). */
export const ENLACE_MI_CUENTA: Enlace = { texto: 'Mi cuenta', href: '/usuario/dashboard' }

/** Pie, columna «Come Arca». */
export const ENLACES_PIE_COME: readonly Enlace[] = [
  { texto: 'Tienda', href: '/tienda' },
  { texto: 'Canastas', href: '/suscripciones' },
  { texto: 'Recetas', href: '/recetas' },
  ENLACE_MI_CUENTA,
]

/** Pie, columna «Vive Arca». */
export const ENLACES_PIE_VIVE: readonly Enlace[] = [
  { texto: 'Experiencias', href: '/experiencias' },
  { texto: 'Eventos privados', href: '/experiencias?tipo=privada' },
  { texto: 'Catering', href: '/catering' },
  { texto: 'Las chinampas', href: '/xochimilco' },
  { texto: 'Nosotros', href: '/nosotros' },
  { texto: 'Contacto', href: '/contacto' },
]

/** Legales del pie (las páginas de hoy). La maqueta trae «Cookies»: no hay página ni banner (Umami no usa cookies, DR70/DR76). */
export const ENLACES_LEGALES: readonly Enlace[] = [
  { texto: 'Privacidad', href: '/privacidad' },
  { texto: 'Términos', href: '/terminos' },
]
