// S69 · Ronda 2 · UNID1 (DR-35, decisión del líder; David la puede cambiar): la unidad de venta como la lee un cliente, nunca un código ni
// un relleno. Una sola función para todo el sitio nuevo: tarjeta y vista rápida de la tienda, ficha y carrito. Sin imports.
//
// - KGM / kg → «kg»; PZ / pza / pieza / H87 → «pieza»; g, ml, paquete, manojo, unidad → tal cual, en minúsculas.
// - null, «null», «undefined», vacío y «UM DEL INVENTARIO» → sin unidad (quien llama no pinta la barra «/»).
// - Si el NOMBRE ya dice su presentación («750ml», «425 g», «1 kg»), no se pinta una unidad de peso o volumen: «$159.00 / kg» en una
//   botella de 750 ml sería falso. Pieza, paquete, manojo y unidad sí se pintan.
// - Un valor desconocido se pinta tal cual (no se esconde información).
// `src/lib/precio.ts` y el sitio de hoy no cambian (DR-10): esto solo lo usa el sitio nuevo.

const VACIAS = new Set(['', 'null', 'undefined', 'um del inventario'])
const EQUIVALENTES: Readonly<Record<string, string>> = {
  kgm: 'kg',
  kg: 'kg',
  pz: 'pieza',
  pza: 'pieza',
  pieza: 'pieza',
  h87: 'pieza',
  g: 'g',
  ml: 'ml',
  paquete: 'paquete',
  manojo: 'manojo',
  unidad: 'unidad',
}
/** Unidades de peso o volumen: no se pintan si el nombre ya trae su presentación. */
const DE_PESO_O_VOLUMEN = new Set(['kg', 'g', 'ml', 'l', 'lt'])
/** «750ml», «425 g», «1 kg», «2.5 L», «500 Ml», «100 G», «1/2 kg»: un número pegado o con espacio a una unidad de peso o volumen. */
const PRESENTACION = /(^|[^\p{L}\d])\d+(?:[.,/]\d+)?\s*(?:kgs?|kilos?|kilogramos?|g|grs?|gramos?|ml|mililitros?|l|lts?|litros?)(?![\p{L}\d])/iu

/** La unidad que se pinta después de « / », o '' si no va ninguna. */
export function unidadLegible(unidad: unknown, nombre?: unknown): string {
  const cruda = typeof unidad === 'string' ? unidad.trim() : ''
  const llave = cruda.toLowerCase()
  if (VACIAS.has(llave)) return ''
  const legible = EQUIVALENTES[llave] ?? cruda
  if (DE_PESO_O_VOLUMEN.has(legible.toLowerCase()) && typeof nombre === 'string' && PRESENTACION.test(nombre)) return ''
  return legible
}
