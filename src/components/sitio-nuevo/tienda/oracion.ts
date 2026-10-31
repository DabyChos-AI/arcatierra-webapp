// R15 v2 · F3 (tienda): los nombres de los productos como los pinta la tienda de hoy. Es la regla de `toSentenceCase`
// (src/app/tienda/page.tsx:121-139), que vive dentro de esa página y no se exporta: se escribe de nuevo aquí con una prueba que la compara
// con la de hoy sobre los nombres reales de GET /api/products (D-F3-06). Lo que escribe la tienda en el carrito es este nombre (D-F3-24 P-18).

/** Las palabras que la tienda de hoy deja en minúsculas (artículos y preposiciones). */
const EN_MINUSCULAS = new Set(['de', 'del', 'la', 'el', 'y', 'en', 'con', 'para', 'por', 'a', 'al'])

export function enOracion(texto: string): string {
  if (!texto) return texto
  const palabras = texto
    .toLowerCase()
    .split(' ')
    .map((palabra) => (EN_MINUSCULAS.has(palabra) ? palabra : palabra.charAt(0).toUpperCase() + palabra.slice(1)))
  // La primera siempre con mayúscula (aunque sea «de»), como hoy.
  return palabras.join(' ').replace(/^\w/, (letra) => letra.toUpperCase())
}
