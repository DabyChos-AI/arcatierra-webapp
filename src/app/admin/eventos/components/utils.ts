/** Misma lista de ids sin importar el orden (para saber si cambiaron los guías). */
export function mismosIds(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((id) => setB.has(id))
}

/** Texto limpio o null (null limpia en los PATCH del backend). */
export function textoONull(valor: string): string | null {
  const limpio = valor.trim()
  return limpio || null
}
