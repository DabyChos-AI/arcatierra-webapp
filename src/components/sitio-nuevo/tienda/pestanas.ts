// R15 v2 · F3 (tienda, sesión 61): las tres pestañas de la tienda nueva y su dirección.
// D-F3-11: «Compra suelto» · «Canasta lista» · «Agrega extras a tu canasta», en ese orden.
// D-F3-22 (1): la dirección pública queda fija: /tienda?pestana=compra-suelto|canasta-lista|extras; sin el parámetro o con otro
// valor = «Compra suelto». D-F3-24 T-19: la página es estática y la pestaña la lee el navegador (lector en <Suspense>).

export const PESTANAS = [
  { id: 'compra-suelto', texto: 'Compra suelto' },
  { id: 'canasta-lista', texto: 'Canasta lista' },
  { id: 'extras', texto: 'Agrega extras a tu canasta' },
] as const

export type IdPestana = (typeof PESTANAS)[number]['id']

export const PESTANA_POR_OMISION: IdPestana = 'compra-suelto'

/** La pestaña que pide la dirección (`?pestana=`); cualquier otro valor, o ninguno, es «Compra suelto». */
export function pestanaDe(valor: string | null | undefined): IdPestana {
  const encontrada = PESTANAS.find((p) => p.id === valor)
  return encontrada ? encontrada.id : PESTANA_POR_OMISION
}

/** La dirección de una pestaña, conservando los demás parámetros (p. ej. `?categoria=`). */
export function direccionDePestana(id: IdPestana, consultaActual: string): string {
  const parametros = new URLSearchParams(consultaActual)
  parametros.set('pestana', id)
  return `?${parametros.toString()}`
}
