/**
 * Cómo se escribe un precio en la tienda. Un solo lugar.
 *
 * El problema que resuelve: el precio se imprimía en **cinco** sitios distintos
 * —tres vistas de la tienda, la tarjeta de producto y las sugerencias del
 * buscador— cada uno con su propio `toFixed(2)`. Un producto sin costo salía
 * como `$0.00`, que se lee como un precio y no como que es gratis.
 *
 * Es el mismo patrón que ya nos mordió con el costo de envío: cuatro fórmulas
 * repartidas, tres equivocadas. Una función, un comportamiento.
 */

/** `$120.00 / kg`, o `GRATIS` cuando no hay nada que cobrar. */
export function precioLegible(precio: number | null | undefined, unidad?: string | null): string {
  const n = Number(precio) || 0
  if (n <= 0) return 'GRATIS'
  return `$${n.toFixed(2)}${unidad ? ` / ${unidad}` : ''}`
}

/** ¿Este precio se muestra como gratuito? Para decidir si sobra la unidad. */
export function esGratuito(precio: number | null | undefined): boolean {
  return (Number(precio) || 0) <= 0
}
