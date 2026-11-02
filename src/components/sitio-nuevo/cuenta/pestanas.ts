// R15 v2 · F6 (cuenta, sesión 64): las pestañas del marco de Mi cuenta (D-F6-11 P-3, P-4). Textos de hoy: los del menú de usuario de hoy
// (`armazon/enlaces.ts`, ENLACES_CUENTA = `TransparentHeader.tsx` userMenuItems) y «Mis Direcciones» (`usuario/dashboard/page.tsx:560`).
// Sin imports de cliente: lo usan el marco y las pestañas.
import { ENLACES_CUENTA, ENLACE_MI_CUENTA, type Enlace } from '@/components/sitio-nuevo/armazon/enlaces'
import { TEXTO_MIS_DIRECCIONES } from './textos'

/** El enlace de hoy para esa dirección (el texto sale del menú de usuario de hoy, no se escribe aquí). */
export function enlaceDeHoy(href: string): Enlace {
  const enlace = ENLACES_CUENTA.find((e) => e.href === href)
  if (!enlace) throw new Error(`Falta ${href} en ENLACES_CUENTA`)
  return enlace
}

export type IdPestanaCuenta = 'resumen' | 'suscripciones' | 'pedidos' | 'direcciones' | 'datos' | 'reservas' | 'favoritos'

/**
 * En el orden de la maqueta (Resumen · Suscripciones · Pedidos · Direcciones · Datos; sin «Métodos de pago», D-F6-06) y después las dos de
 * hoy que la maqueta no trae (D-F6-11 P-4). `segmento` = la carpeta de `src/app/nuevo/usuario/`; reservas y favoritos van a su página de hoy.
 */
export const PESTANAS_CUENTA: ReadonlyArray<{ id: IdPestanaCuenta; segmento: string | null } & Enlace> = [
  { id: 'resumen', segmento: 'dashboard', ...ENLACE_MI_CUENTA },
  { id: 'suscripciones', segmento: 'suscripciones', ...enlaceDeHoy('/usuario/suscripciones') },
  { id: 'pedidos', segmento: 'pedidos', ...enlaceDeHoy('/usuario/pedidos') },
  { id: 'direcciones', segmento: 'direcciones', texto: TEXTO_MIS_DIRECCIONES, href: '/usuario/direcciones' },
  { id: 'datos', segmento: 'perfil', ...enlaceDeHoy('/usuario/perfil') },
  { id: 'reservas', segmento: null, ...enlaceDeHoy('/usuario/reservas') },
  { id: 'favoritos', segmento: null, ...enlaceDeHoy('/usuario/favoritos') },
]
