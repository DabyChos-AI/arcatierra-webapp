'use client'

import { forwardRef, useId } from 'react'
import { Check } from 'lucide-react'
import { FOCO, FOCO_SOBRE_OSCURO, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4; C34): casilla con su etiqueta (el consentimiento del boletín y de privacidad, que la API exige). La de
// la maqueta (`.servicio-check input`, medida a las 13:15): 16 px, borde 1 px ink, radio 4 px y fondo transparente; marcada, fondo y borde
// terra con una palomita blanca. Sigue siendo un checkbox nativo (teclado, formulario y lector de pantalla), sin su dibujo; la palomita
// es un ícono decorativo encima. La etiqueta es `children` y puede traer una liga. Error con role="alert" ligado por aria-describedby.

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
        <span className="relative mt-[3px] flex h-4 w-4 shrink-0">
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
            className={unirClases(
              'peer m-0 h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-solid bg-transparent',
              sobreOscuro
                ? unirClases('border-sn-warm checked:bg-sn-warm', FOCO_SOBRE_OSCURO)
                : unirClases('border-sn-ink checked:border-sn-terra checked:bg-sn-terra', FOCO),
            )}
          />
          <Check
            aria-hidden="true"
            focusable="false"
            strokeWidth={3}
            className={unirClases(
              'pointer-events-none absolute inset-0 m-auto hidden h-3 w-3 peer-checked:block',
              sobreOscuro ? 'text-sn-ink' : 'text-white',
            )}
          />
        </span>
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
