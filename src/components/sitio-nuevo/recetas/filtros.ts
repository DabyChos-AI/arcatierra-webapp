// R15 v2 · F5 (recetas, sesión 63): búsqueda y filtros de la lista de recetas = los de `/recetas` de hoy (DR-10; contrato v2 D-F5-12
// P-2 y P-3; cadena-v2/f5/recetas-F5.md §2.6). Lógica pura, sin pantalla: la usa `ListaRecetas.tsx` y la prueba que la compara con la
// de hoy (`src/app/recetas/client-page.tsx:207-254`) en las mismas entradas.
// Textos y valores de hoy: dificultades (:239), temporadas (:240), tiempo máximo de 10 a 120 con 60 de inicio (:33, :433-434; «10»,
// «60» y «120» están en la lista corta por D-F5-12 P-2). Las etiquetas salen de los datos importados (:238).
import type { Recipe } from '@/data/recetas'

export const DIFICULTADES = ['Fácil', 'Medio', 'Avanzado'] as const
export const TEMPORADAS = ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'] as const

export const TIEMPO_MINIMO = 10
export const TIEMPO_MAXIMO = 120
export const TIEMPO_INICIAL = 60

export type GrupoFiltro = 'dificultad' | 'temporada' | 'etiquetas'

export type Filtros = {
  busqueda: string
  dificultades: string[]
  temporadas: string[]
  etiquetas: string[]
  tiempoMaximo: number
}

export const FILTROS_INICIALES: Filtros = {
  busqueda: '',
  dificultades: [],
  temporadas: [],
  etiquetas: [],
  tiempoMaximo: TIEMPO_INICIAL,
}

/** Las etiquetas de todas las recetas, sin repetir y en el orden en que aparecen (como hoy, :238). */
export function etiquetasDe(recetas: readonly Recipe[]): string[] {
  return [...new Set(recetas.flatMap((r) => r.tags))]
}

/** Quita el valor si ya estaba y lo agrega al final si no (la regla de hoy, :211-223). */
export function alternar(lista: readonly string[], valor: string): string[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
}

/** Las recetas que pasan la búsqueda y los filtros, en el mismo orden de los datos (la regla de hoy, :243-254). */
export function filtrarRecetas(recetas: readonly Recipe[], f: Filtros): Recipe[] {
  const buscado = f.busqueda.toLowerCase()
  return recetas.filter((receta) => {
    const pasaBusqueda =
      receta.title.toLowerCase().includes(buscado) ||
      receta.description.toLowerCase().includes(buscado) ||
      receta.ingredients.some((ing) => ing.toLowerCase().includes(buscado))
    const pasaDificultad = f.dificultades.length === 0 || f.dificultades.includes(receta.difficulty)
    const pasaTemporada = f.temporadas.length === 0 || f.temporadas.includes(receta.season)
    const pasaEtiquetas = f.etiquetas.length === 0 || f.etiquetas.some((e) => receta.tags.includes(e))
    const pasaTiempo = receta.cookTime <= f.tiempoMaximo
    return pasaBusqueda && pasaDificultad && pasaTemporada && pasaEtiquetas && pasaTiempo
  })
}
