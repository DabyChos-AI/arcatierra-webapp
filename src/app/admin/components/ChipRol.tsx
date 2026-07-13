'use client'

import type { RolPersonal } from '@/types/catalogos'

/**
 * Chip de rol de una persona del modulo de reservas.
 * vendedora → terracota; guia → verde.
 */
export default function ChipRol({ rol }: { rol: RolPersonal }) {
  const esVendedora = rol === 'vendedora'
  const classes = esVendedora
    ? 'bg-terracota/10 text-terracota'
    : 'bg-verde/10 text-verde'
  const label = esVendedora ? 'Vendedora' : 'Guía'

  return (
    <span
      className={`inline-block rounded-full text-xs px-2 py-0.5 font-medium ${classes}`}
    >
      {label}
    </span>
  )
}
