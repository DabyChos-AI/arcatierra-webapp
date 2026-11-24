// S69 · Ronda 2 · CATS1: la categoría de un producto como la lee un cliente. La API trae a veces el TEXTO «Sin categoría» (11 productos
// visibles en producción, medido el 24-nov), «null» o vacío: nada de eso es una categoría y no se pinta (tarjeta, vista rápida, ficha,
// migas, sugerencias). Sin imports.

const NO_ES_CATEGORIA = new Set(['', 'null', 'undefined', 'sin categoría', 'sin categoria', 'sin-categoria'])

/** La categoría tal como viene, o null si no es una categoría de verdad. */
export function categoriaReal(categoria: unknown): string | null {
  if (typeof categoria !== 'string') return null
  const limpia = categoria.trim()
  return NO_ES_CATEGORIA.has(limpia.toLowerCase()) ? null : limpia
}
