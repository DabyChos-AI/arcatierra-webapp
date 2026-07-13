'use client'

import type { PersonalKPIs, PersonalTab } from '@/types/catalogos'

const TABS: { key: PersonalTab; label: string; kpiKey: keyof PersonalKPIs }[] = [
  { key: 'todos', label: 'Todos', kpiKey: 'total' },
  { key: 'vendedoras', label: 'Vendedoras', kpiKey: 'vendedoras_activas' },
  { key: 'guias', label: 'Guías', kpiKey: 'guias_activos' },
  { key: 'multirol', label: 'Multi-rol', kpiKey: 'multirol' },
]

/**
 * Tabs horizontales de la vista Personal, con chip de conteo por tab.
 * Activo: border-bottom terracota + font-semibold.
 */
export default function TabsPersonal({
  current,
  onChange,
  kpis,
}: {
  current: PersonalTab
  onChange: (tab: PersonalTab) => void
  kpis: PersonalKPIs | null
}) {
  return (
    <div className="border-b border-neutro-borde flex gap-1 overflow-x-auto" role="tablist">
      {TABS.map((t) => {
        const active = current === t.key
        const count = kpis ? kpis[t.kpiKey] : null
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors ${
              active
                ? 'border-terracota text-terracota font-semibold'
                : 'border-transparent text-verde-suave hover:text-verde'
            }`}
          >
            {t.label}
            {count !== null && (
              <span
                className={`inline-flex items-center justify-center min-w-[1.25rem] px-1.5 rounded-full text-xs tabular-nums ${
                  active ? 'bg-terracota/10 text-terracota' : 'bg-neutro-light text-verde-suave'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
