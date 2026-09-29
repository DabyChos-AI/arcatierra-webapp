'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Filtro de opción múltiple con casillas (29-sep, pedido de David: "que los filtros sean check box
 * para poder seleccionar múltiples cosas a la vez"). Se ve como los demás controles de la barra: un
 * botón con el resumen de lo elegido que abre la lista. Se cierra al hacer clic fuera o con Escape.
 */
export interface OpcionFiltro {
  value: string
  label: string
}

interface Props {
  id: string
  etiqueta: string
  opciones: OpcionFiltro[]
  seleccion: string[]
  onChange: (seleccion: string[]) => void
  /** Lo que dice el botón (lo arma quien lo usa: "Todas", "5 de 6", el nombre si es una sola…). */
  resumen: string
  /** Cuántas deben quedar marcadas como mínimo (la última no se puede desmarcar). */
  minimo?: number
}

export default function FiltroMultiple({ id, etiqueta, opciones, seleccion, onChange, resumen, minimo = 0 }: Props) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false)
    }
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', escape)
    }
  }, [abierto])

  const alternar = (valor: string) => {
    if (seleccion.includes(valor)) {
      if (seleccion.length <= minimo) return
      onChange(seleccion.filter((v) => v !== valor))
    } else {
      // Se conserva el orden de las opciones, no el de los clics.
      onChange(opciones.map((o) => o.value).filter((v) => v === valor || seleccion.includes(v)))
    }
  }

  return (
    <div className="relative" ref={caja}>
      <span id={`${id}-etiqueta`} className="block text-xs text-verde-suave mb-1">
        {etiqueta}
      </span>
      <button
        type="button"
        id={id}
        data-testid={id}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-labelledby={`${id}-etiqueta ${id}`}
        onClick={() => setAbierto((a) => !a)}
        className="flex min-w-[10rem] items-center justify-between gap-2 border border-neutro-borde rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
      >
        <span className="truncate">{resumen}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {abierto && (
        <div
          role="listbox"
          aria-multiselectable="true"
          data-testid={`${id}-opciones`}
          className="absolute right-0 z-30 mt-1 min-w-full w-max max-h-72 overflow-auto rounded-lg border border-neutro-borde bg-white p-1 shadow-lg"
        >
          {opciones.map((o) => {
            const marcada = seleccion.includes(o.value)
            const bloqueada = marcada && seleccion.length <= minimo
            return (
              <label
                key={o.value}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-900 ${
                  bloqueada ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-neutro-light'
                }`}
                title={bloqueada ? 'Debe quedar al menos una marcada' : undefined}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#33503E]"
                  checked={marcada}
                  disabled={bloqueada}
                  data-valor={o.value}
                  onChange={() => alternar(o.value)}
                />
                {o.label}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
