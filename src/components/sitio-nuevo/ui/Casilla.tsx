'use client'

import { forwardRef, useId } from 'react'
import { FOCO, FOCO_SOBRE_OSCURO, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): casilla con su etiqueta (el consentimiento del boletín y de privacidad, que la API exige). Casilla
// nativa con `accent-sn-terra` (la maqueta: borde 1 px ink, radio 4 px); la etiqueta es `children` y puede traer una liga. Error con
// role="alert" ligado por aria-describedby.

type Props = {
  children: React.ReactNode
  checked?: boolean
  defaultChecked?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  id?: string
  name?: string
  requerida?: boolean
  error?: string
  ayuda?: string
  sobreOscuro?: boolean
  testId?: string
  className?: string
}

const Casilla = forwardRef<HTMLInputElement, Props>(function Casilla(
  { children, checked, defaultChecked, onChange, id, name, requerida = false, error, ayuda, sobreOscuro = false, testId = 'sn-casilla', className },
  ref,
) {
  const generado = useId()
  const idCasilla = id ?? `${generado}-casilla`
  const idAyuda = ayuda ? `${idCasilla}-ayuda` : undefined
  const idError = error ? `${idCasilla}-error` : undefined
  const describe = [idError, idAyuda].filter(Boolean).join(' ') || undefined
  const tono = sobreOscuro ? 'text-sn-warm' : 'text-sn-ink'

  return (
    <div className={unirClases('flex flex-col gap-1', className)}>
      <div className="flex min-h-6 items-start gap-2.5">
        <input
          ref={ref}
          id={idCasilla}
          name={name}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          required={requerida}
          aria-required={requerida || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe}
          data-testid={testId}
          className={unirClases('mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-sn-terra', sobreOscuro ? FOCO_SOBRE_OSCURO : FOCO)}
        />
        <label htmlFor={idCasilla} className={unirClases('cursor-pointer font-sn-texto text-sn-cuerpo-xs font-normal', tono)}>
          {children}
        </label>
      </div>
      {ayuda && (
        <p id={idAyuda} data-testid={`${testId}-ayuda`} className={unirClases('m-0 pl-[26px] font-sn-texto text-sn-cuerpo-xs font-normal', tono)}>
          {ayuda}
        </p>
      )}
      {error && (
        <p
          id={idError}
          role="alert"
          data-testid={`${testId}-error`}
          className={unirClases('m-0 pl-[26px] font-sn-texto text-sn-cuerpo-xs font-medium', sobreOscuro ? 'text-sn-warm' : 'text-sn-terra')}
        >
          {error}
        </p>
      )}
    </div>
  )
})

export default Casilla
