'use client'

import type { Personal } from '@/types/reservas'

interface MultiSelectGuiasProps {
  guias: Personal[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  guiasPendientes?: string[]
  label?: string
  id?: string
  maxHeight?: number
}

export default function MultiSelectGuias({
  guias,
  selectedIds,
  onChange,
  guiasPendientes = [],
  label = 'Guias asignados',
  id,
  maxHeight = 140,
}: MultiSelectGuiasProps) {
  const containerId = id ?? 'multi-select-guias'

  const toggle = (guiaId: string) => {
    if (selectedIds.includes(guiaId)) {
      onChange(selectedIds.filter((x) => x !== guiaId))
    } else {
      onChange([...selectedIds, guiaId])
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={containerId} className="text-sm font-medium text-verde">
          {label}
        </label>
        <span className="text-xs text-verde-suave">
          Seleccionados: {selectedIds.length} de {guias.length}
        </span>
      </div>

      {guias.length === 0 ? (
        <div className="border border-neutro-borde rounded-lg p-3 bg-neutro-light text-sm text-verde-suave">
          No hay guias disponibles. Confirma con personal.
        </div>
      ) : (
        <div
          id={containerId}
          data-testid={containerId}
          className="border border-neutro-borde rounded-lg p-2 overflow-y-auto"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {guias.map((guia) => {
            const isPendiente = guiasPendientes.includes(guia.id)
            const isChecked = selectedIds.includes(guia.id)
            return (
              <label
                key={guia.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutro-light cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(guia.id)}
                  className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                  aria-label={`Seleccionar guia ${guia.nombre}`}
                />
                <span className="text-sm text-verde flex-1">
                  {guia.nombre}
                  {guia.apellidos ? ` ${guia.apellidos}` : ''}
                </span>
                {guia.idiomas && guia.idiomas.length > 0 && (
                  <span className="flex gap-1">
                    {guia.idiomas.map((idioma) => (
                      <span
                        key={idioma}
                        className="text-[10px] uppercase bg-neutro-light text-verde-suave px-1.5 py-0.5 rounded"
                      >
                        {idioma}
                      </span>
                    ))}
                  </span>
                )}
                {isPendiente && (
                  <span className="text-xs text-verde-suave italic">(pdte)</span>
                )}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
