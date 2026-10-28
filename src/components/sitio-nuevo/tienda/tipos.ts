// R15 · F2 (WF3, sesión 55, 28-oct-2026): tipos y constantes de la tienda nueva (src/app/nuevo/tienda). Sin imports de
// servidor: los usan la página (servidor) y los componentes de cliente de esta carpeta.

/** Las 3 pestañas, en el orden de la maqueta corregida (C8/C12: «Arma la tuya» NO se construye). */
export const PESTANAS = [
  { id: 'suelto', nombre: 'Compra suelto' },
  { id: 'canasta', nombre: 'Canasta lista' },
  { id: 'extras', nombre: 'Agrega extras' },
] as const

/** id de la barra de pestañas (destino de los enlaces del hero: `?pestana=…#sn-tienda-pestanas`). */
export const ID_PESTANAS = 'sn-tienda-pestanas'

export type IdPestana = (typeof PESTANAS)[number]['id']

/** `?pestana=…` → la pestaña; cualquier otro valor (o ninguno) = «Compra suelto» (contrato con la portada). */
export function pestanaDeParametro(valor: string | null | undefined): IdPestana {
  return PESTANAS.some((p) => p.id === valor) ? (valor as IdPestana) : 'suelto'
}

/** C8: las 4 canastas fijas de la base, en este orden (ids de `GET /api/subscriptions/planes` = `SubscriptionService.PLANS`).
 *  Las básicas, la retornable y los planes de prueba que también trae `/planes` no se ofrecen aquí. */
export const IDS_CANASTAS = ['individual', 'media', 'completa', 'familiar'] as const

/** Un plan de `GET /api/subscriptions/planes` (nombre y precio de la base, tal cual). */
export interface PlanCanasta {
  id: string
  itemcode: string
  nombre: string
  precio: number
}

/** Las frecuencias de hoy (`DELIVERY_FREQUENCIES` de src/app/suscripciones/page.tsx:264 = `frequencies` de `/planes`). */
export const FRECUENCIAS = [
  { id: 'weekly', nombre: 'Semanal', descripcion: 'Cada semana' },
  { id: 'biweekly', nombre: 'Quincenal', descripcion: 'Cada 2 semanas' },
] as const

export type IdFrecuencia = (typeof FRECUENCIAS)[number]['id']

/** Una categoría de `GET /api/products/categories` que tiene productos en la lista cargada. */
export interface CategoriaTienda {
  nombre: string
  total: number
}

/** Una zona de `GET /api/zonas-entrega/{cp}` (la misma forma que usan PostalCodeSelector y DireccionEntrega). */
export interface ZonaTienda {
  id: number
  codigo_postal: string
  colonia: string
  municipio: string
  lunes: boolean
  martes: boolean
  miercoles: boolean
  jueves: boolean
  viernes: boolean
  sabado: boolean
  domingo: boolean
  tiempo_minimo_dias: number
}

export function esZonaTienda(x: unknown): x is ZonaTienda {
  if (typeof x !== 'object' || x === null) return false
  const z = x as Record<string, unknown>
  return typeof z.codigo_postal === 'string' && typeof z.colonia === 'string' && typeof z.municipio === 'string'
}

const DIAS_ZONA: Array<[keyof ZonaTienda, string]> = [
  ['lunes', 'lunes'],
  ['martes', 'martes'],
  ['miercoles', 'miércoles'],
  ['jueves', 'jueves'],
  ['viernes', 'viernes'],
  ['sabado', 'sábado'],
  ['domingo', 'domingo'],
]

/** «lunes, miércoles y viernes» (los días de la zona en la base). '' si la zona no tiene ningún día marcado. */
export function diasDeZona(zona: ZonaTienda): string {
  const dias = DIAS_ZONA.filter(([clave]) => zona[clave] === true).map(([, nombre]) => nombre)
  if (dias.length <= 1) return dias.join('')
  return `${dias.slice(0, -1).join(', ')} y ${dias[dias.length - 1]}`
}

/** C7: el horario de entrega, como texto (no sale de la API). */
export const HORARIO_ENTREGA = 'de 7:00 a 17:00'
