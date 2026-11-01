// R15 v2 · F1 (sesión 58): las ligas del armazón del sitio nuevo. Contrato v2 §9 C20.
//
// Una sola tabla: cada fila es una dirección y dice en qué lugares sale y con qué texto. Cada lugar las pinta en el orden de la tabla.
// Las direcciones son las de HOY: el sitio nuevo todavía no tiene más página que la portada (RUTAS_SITIO_NUEVO), así que cada liga
// lleva a la página de hoy que hace esa función. Cuando una fase haga la página nueva, cambia aquí su dirección.
// - Nada a páginas que se ocultan (DR-7: /xochimilco, /impacto, /blog, /calendario, /experiencias/testimonios) ni a /prensa (pregunta C44).
// - F5 (D-F5-03, D-F5-13 P-12): «Chinampas» (cabecera y celular) y «Las chinampas» (pie) llevan a /chinampas, la página nueva (C20/C49);
//   /xochimilco sigue con su página de hoy hasta F7 y nada del sitio nuevo liga a ella.
// - «Cookies» (pie) no se pinta: no hay página ni banner (DR76, pregunta C46).
// Textos: los de hoy (TransparentHeader.tsx, Footer.tsx); «Eventos» y «Eventos privados» son los nombres de la página de eventos (F4).
// Sin imports: lo usan componentes de cliente y de servidor.

export interface Enlace {
  texto: string
  href: string
}

/** Dónde sale una liga: la barra de escritorio, el menú del celular y las dos columnas de ligas del pie. */
export type Lugar = 'cabecera' | 'celular' | 'pie-tienda' | 'pie-experiencias'

/** «Mi cuenta» (TransparentHeader.tsx): ruta protegida; sin sesión, el middleware manda a iniciar sesión y regresa. */
export const ENLACE_MI_CUENTA: Enlace = { texto: 'Mi cuenta', href: '/usuario/dashboard' }

/** «Quiero canasta» de la maqueta: lleva a la tienda; su texto no existe hoy (pregunta C41) y va con la marca. */
export const HREF_TIENDA = '/tienda'

// Texto por lugar. Eventos: la página de eventos de F4, con las privadas y su solicitud (D-F4-12 P-1b).
// Canastas → /tienda (MAPA-CONTENIDO B §0.5). Chinampas va entre Catering y Nosotros, como en la maqueta (cabecera y pie).
const TABLA: ReadonlyArray<{ href: string; en: Partial<Record<Lugar, string>> }> = [
  { href: '/tienda', en: { cabecera: 'Tienda', celular: 'Tienda', 'pie-tienda': 'Tienda' } },
  { href: '/tienda', en: { 'pie-tienda': 'Canastas' } },
  { href: '/experiencias', en: { cabecera: 'Experiencias', celular: 'Experiencias', 'pie-experiencias': 'Experiencias' } },
  { href: '/eventos', en: { cabecera: 'Eventos', celular: 'Eventos', 'pie-experiencias': 'Eventos privados' } },
  { href: '/catering', en: { cabecera: 'Catering', celular: 'Catering', 'pie-experiencias': 'Catering' } },
  { href: '/chinampas', en: { cabecera: 'Chinampas', celular: 'Chinampas', 'pie-experiencias': 'Las chinampas' } },
  { href: '/nosotros', en: { cabecera: 'Nosotros', celular: 'Nosotros', 'pie-experiencias': 'Nosotros' } },
  { href: '/recetas', en: { celular: 'Recetas', 'pie-tienda': 'Recetas' } },
  { href: '/contacto', en: { celular: 'Contacto', 'pie-experiencias': 'Contacto' } },
  { href: ENLACE_MI_CUENTA.href, en: { 'pie-tienda': ENLACE_MI_CUENTA.texto } },
]

/** Las ligas de un lugar, en el orden de la tabla. */
export function ligasDe(lugar: Lugar): Enlace[] {
  return TABLA.flatMap(({ href, en }) => {
    const texto = en[lugar]
    return texto ? [{ texto, href }] : []
  })
}

/** Menú de usuario de hoy (TransparentHeader.tsx, userMenuItems), en su orden. «Panel de Administración» va aparte (solo empleados). */
export const ENLACES_CUENTA: readonly Enlace[] = [
  { texto: 'Mi perfil', href: '/usuario/perfil' },
  { texto: 'Mis reservas', href: '/usuario/reservas' },
  { texto: 'Mis pedidos', href: '/usuario/pedidos' },
  { texto: 'Mis suscripciones', href: '/usuario/suscripciones' },
  { texto: 'Favoritos', href: '/usuario/favoritos' },
  ENLACE_MI_CUENTA,
]

export const ENLACE_PANEL: Enlace = { texto: 'Panel de Administración', href: '/admin' }
export const HREF_INICIAR_SESION = '/auth/signin'

/** Legales del pie, con los textos de hoy (Footer.tsx). Las páginas existen («en construcción»: pregunta C46 y WF15). */
export const ENLACES_LEGALES: readonly Enlace[] = [
  { texto: 'Política de Privacidad', href: '/privacidad' },
  { texto: 'Términos y Condiciones', href: '/terminos' },
]
