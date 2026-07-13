'use client'

import { CAPACIDAD_SIN_TOPE } from '@/types/catalogos'

/**
 * Renderiza una capacidad maxima. El backend usa 999 como centinela "sin tope".
 * NUNCA muestra el 999 literal.
 */
export default function DisplayCapacidad({ valor }: { valor: number }) {
  if (valor === CAPACIDAD_SIN_TOPE) {
    return <span className="text-verde-suave italic">sin tope</span>
  }
  return <span className="tabular-nums">{valor}</span>
}
