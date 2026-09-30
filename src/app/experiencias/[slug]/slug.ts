// Slug de experiencia en las URLs públicas (WEB-f, 30-sep).
//
// La API arma el slug con `slug_experiencia(nombre)` del backend: minúsculas,
// espacios→guiones, ñ→n y CONSERVA los acentos («bebidas-baldío»). Ese es el
// contrato de las URLs ya publicadas. Pero Next 15 entrega el parámetro de la ruta
// codificado («bebidas-bald%C3%ADo»), y hay ligas viejas sin acentos
// («bebidas-baldio»). Por eso el detalle compara las dos formas normalizadas.

/** El parámetro de la ruta tal como se escribió («bebidas-bald%C3%ADo» → «bebidas-baldío»). */
export function decodificarSlug(valor: string): string {
  try {
    return decodeURIComponent(valor)
  } catch {
    // Un «%» suelto hace fallar decodeURIComponent: se usa tal cual
    return valor
  }
}

/** Minúsculas y sin diacríticos (NFD también convierte ñ→n): «Bebidas-Baldío» → «bebidas-baldio». */
export function normalizarSlug(valor: string): string {
  return valor.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Ruta del detalle de una experiencia a partir de su slug (codificado para la URL). */
export function rutaExperiencia(slug: string): string {
  return `/experiencias/${encodeURIComponent(slug)}`
}
