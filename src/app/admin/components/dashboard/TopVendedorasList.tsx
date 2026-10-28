'use client'

import { useTemaAdmin } from '../TemaAdminContext'

export interface Vendedora {
  id: string
  nombre: string
  reservas_count: number
  ingresos: number
}

interface TopVendedorasListProps {
  items: Vendedora[]
  loading?: boolean
}

// Paleta de avatares (cicla por índice), coherente con el demo. CLARO1 (R15 F1): el ámbar pasa de #F59E0B (2.15 con las
// iniciales blancas) a #B45309 (amber-700, 5.02); los otros cuatro ya pasaban 4.5.
const AVATAR_COLORS = ['#B15543', '#33503E', '#7C3AED', '#B45309', '#DB2777']
// K2 (DR77): en oscuro, los mismos tonos más profundos para que las iniciales blancas se lean (≥ 5.9:1;
// el ámbar claro da 2.15 con blanco). El claro no cambia.
const AVATAR_COLORS_OSCURO = ['#A04A3A', '#3D6B50', '#6D28D9', '#92400E', '#BE185D']

function iniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function formatMonto(n: number): string {
  if (n >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n)}`
}

export default function TopVendedorasList({ items, loading }: TopVendedorasListProps) {
  const { tema } = useTemaAdmin()
  const colores = tema === 'oscuro' ? AVATAR_COLORS_OSCURO : AVATAR_COLORS
  const max = items.length > 0 ? Math.max(...items.map((v) => v.ingresos), 1) : 1

  return (
    <div className="bg-white rounded-xl border border-neutro-borde p-5 shadow-soft">
      <div className="flex items-center justify-between flex-wrap gap-1 mb-4">
        <h3 className="text-sm font-semibold text-verde-tipografia">
          Top vendedoras del mes
        </h3>
        <span className="text-[10.5px] text-verde-medio font-normal">
          Lo vendido este mes por cada vendedora
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-neutral-200 rounded w-1/3" />
                <div className="h-1.5 bg-neutral-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-verde-medio">
          Aún sin ventas este mes
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((v, i) => {
            const pct = Math.max(4, (v.ingresos / max) * 100)
            return (
              <div key={v.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: colores[i % colores.length] }}
                  aria-hidden="true"
                >
                  {iniciales(v.nombre)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-verde-tipografia truncate mb-1">
                    {v.nombre}
                  </div>
                  <div className="h-1.5 rounded-full bg-neutro-crema/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-terracota transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="text-[11.5px] font-semibold text-verde-tipografia whitespace-nowrap flex-shrink-0">
                  {formatMonto(v.ingresos)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
