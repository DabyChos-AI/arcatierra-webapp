// R15 v2 · F5 (recetas, sesión 63): favoritos de recetas en el navegador, con la MISMA llave y forma que `/recetas` de hoy
// (`src/app/recetas/client-page.tsx:38-73`) y que la página de cada receta, que se queda como hoy (`src/app/receta/[id]/client-page.tsx:65-90`):
// un arreglo en `arcaTierraFavoritos` donde una receta va con el prefijo `recipe-`. Así el corazón de la lista nueva y el de la página de
// hoy dicen lo mismo (DR-10; contrato v2 D-F5-12, recetas-F5.md §2.10).
// Diferencia con hoy, solo con datos dañados: si la llave no trae un arreglo legible, hoy la página truena; aquí se lee como vacía
// (información, como D-F3-07 (c): no se copia un defecto). Defecto de hoy anotado (H-1): con sesión, `useFavoritos` reescribe la llave
// solo con productos y se pierden las recetas; aquí no se toca ese gancho.

export const LLAVE_FAVORITOS = 'arcaTierraFavoritos'
export const PREFIJO_RECETA = 'recipe-'

/** El arreglo guardado tal cual (también lo que no es receta: se devuelve sin tocar al guardar). */
function leerLlave(): unknown[] {
  try {
    const crudo = window.localStorage.getItem(LLAVE_FAVORITOS)
    const valor: unknown = JSON.parse(crudo || '[]')
    return Array.isArray(valor) ? valor : []
  } catch {
    return []
  }
}

/** Los ids de las recetas marcadas (sin el prefijo), en el orden guardado. */
export function leerFavoritosRecetas(): string[] {
  return leerLlave()
    .filter((id): id is string => typeof id === 'string' && id.startsWith(PREFIJO_RECETA))
    .map((id) => id.slice(PREFIJO_RECETA.length))
}

/**
 * Marca o desmarca una receta y avisa a las otras pestañas con el mismo `StorageEvent` de hoy (:69-73). Devuelve si quedó marcada, o
 * `null` si el navegador no dejó guardar (entonces nada cambió). Los demás favoritos (los de productos) se conservan tal cual.
 */
export function alternarFavoritoReceta(recetaId: string): boolean | null {
  const favoritos = leerLlave()
  const clave = `${PREFIJO_RECETA}${recetaId}`
  const estaba = favoritos.includes(clave)
  const nuevos = estaba ? favoritos.filter((id) => id !== clave) : [...favoritos, clave]
  const texto = JSON.stringify(nuevos)
  try {
    window.localStorage.setItem(LLAVE_FAVORITOS, texto)
  } catch {
    return null
  }
  window.dispatchEvent(new StorageEvent('storage', { key: LLAVE_FAVORITOS, newValue: texto }))
  return !estaba
}
