// Textos del precio de una experiencia PRIVADA (WEB2, decisión DR4 de David, R1 · sesión 41).
//
// Una privada se cobra POR GRUPO: el precio cubre `personas_incluidas` (lo corrige el equipo de Experiencias en el
// panel) y cada persona de más paga `precio_persona_adicional`. Antes la web decía «hasta 10 personas» fijo y
// «/ por persona», que no es como se cobra. Una sola fuente para /experiencias, /experiencias/[slug] y
// /experiencias-premium: si la API no manda el número, NO se inventa.
import { formatPrice } from '@/utils/formatters'

/** `personas_incluidas` de la API si es un entero > 0; si no, null (no se inventa un número). */
export function personasIncluidasValidas(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0 ? valor : null
}

/** «Precio por grupo de hasta N personas» (o «Precio por grupo» si la API no trae el número). */
export function textoGrupoPrivada(personasIncluidas: unknown): string {
  const n = personasIncluidasValidas(personasIncluidas)
  return n !== null ? `Precio por grupo de hasta ${n} ${n === 1 ? 'persona' : 'personas'}` : 'Precio por grupo'
}

/** «+ $X por persona adicional» solo si `precio_persona_adicional > 0`; si no, null (no se pinta nada). */
export function textoAdicionalPrivada(precioAdicional: unknown): string | null {
  return typeof precioAdicional === 'number' && Number.isFinite(precioAdicional) && precioAdicional > 0
    ? `+ $${formatPrice(precioAdicional)} por persona adicional`
    : null
}
