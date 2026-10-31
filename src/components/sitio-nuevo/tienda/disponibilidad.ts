// R15 v2 · F3 (tienda): cuántas piezas se pueden vender y si un producto está en venta, con la regla de la tienda de hoy
// (`disponibleDe` y `enVentaDe`, src/app/tienda/page.tsx:61-68, sin exportar). Reescritas con su prueba contra las de hoy (D-F3-06).
import { aNumero } from '@/types/tienda'

export interface DisponibilidadApi {
  stock_actual?: unknown
  disponible?: unknown
  en_venta?: unknown
}

/** Piezas ENTERAS que se pueden comprar: `disponible` (ya descuenta lo apartado por otros) o, si no viene, `stock_actual`; nunca negativo. */
export function disponibleDe(p: DisponibilidadApi): number {
  const crudo = p.disponible !== undefined && p.disponible !== null ? p.disponible : p.stock_actual
  return Math.max(0, Math.floor(aNumero(crudo)))
}

/** `en_venta` manda; si no viene, hay al menos una pieza. */
export function enVentaDe(p: DisponibilidadApi): boolean {
  return typeof p.en_venta === 'boolean' ? p.en_venta : disponibleDe(p) >= 1
}
