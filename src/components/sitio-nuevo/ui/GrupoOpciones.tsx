'use client'

import { useId } from 'react'
import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): elegir una opción entre varias, como tarjetas. La maqueta lo repite en el modal de suscripción de la
// tienda (`.sub-size-btn`) y en el tipo de evento (`.evento-option`): elegida, fondo terra con texto blanco (5.68); sin elegir, blanca; al
// pasar el ratón, terra al 4 % (`:hover` de las dos). Radios nativos dentro de un fieldset: el teclado (flechas) y el lector funcionan sin
// código propio. Borde sin elegir: `muted` (el `border` de la maqueta no llega a 3:1; misma propuesta que el campo, C31).

type Opcion = { valor: string; etiqueta: React.ReactNode; detalle?: React.ReactNode; deshabilitada?: boolean }

type Props = {
  leyenda: string
  leyendaOculta?: boolean
  opciones: Opcion[]
  nombre: string
  valor?: string
  onCambio?: (valor: string) => void
  error?: string
  columnas?: 1 | 2 | 3
  testId?: string
  className?: string
}

const COLUMNAS = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3' } as const

export default function GrupoOpciones({
  leyenda,
  leyendaOculta = false,
  opciones,
  nombre,
  valor,
  onCambio,
  error,
  columnas = 1,
  testId = 'sn-opciones',
  className,
}: Props) {
  const idError = `${useId()}-error`
  return (
    <fieldset
      data-testid={testId}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? idError : undefined}
      className={unirClases('m-0 min-w-0 border-0 p-0', className)}
    >
      <legend
        className={unirClases(leyendaOculta ? 'sr-only' : 'mb-3 p-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink')}
      >
        {leyenda}
      </legend>
      <div className={unirClases('grid gap-3', COLUMNAS[columnas])}>
        {opciones.map((o) => {
          const elegida = valor === o.valor
          return (
            <label
              key={o.valor}
              data-testid={`sn-opcion-${o.valor}`}
              data-elegida={elegida ? '1' : '0'}
              className={unirClases(
                'relative flex min-h-11 cursor-pointer flex-col gap-1 rounded-sn-campo border border-solid px-4 py-3.5 font-sn-texto transition-colors duration-200',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-sn-terra',
                elegida ? 'border-sn-terra bg-sn-terra text-white' : 'border-sn-muted bg-white text-sn-ink hover:bg-sn-terra/[0.04]',
                o.deshabilitada && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name={nombre}
                value={o.valor}
                checked={elegida}
                disabled={o.deshabilitada}
                onChange={() => onCambio?.(o.valor)}
                className="sr-only focus:outline-none"
              />
              <span className="text-sn-cuerpo-sm font-medium">{o.etiqueta}</span>
              {o.detalle && <span className="text-sn-cuerpo-xs font-light">{o.detalle}</span>}
            </label>
          )
        })}
      </div>
      {error && (
        <p id={idError} role="alert" className="m-0 mt-2 font-sn-texto text-sn-cuerpo-xs font-medium text-sn-terra">
          {error}
        </p>
      )}
    </fieldset>
  )
}
