'use client'

import { forwardRef, useId } from 'react'
import { FOCO, FOCO_SOBRE_OSCURO, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §2.3, §4): campo con su etiqueta. Medido en la maqueta: etiqueta en DM Mono 10 px mayúsculas; campo blanco,
// radio 8 px, relleno 12/14 px, texto 14 px ink. Borde: la maqueta usa `border` (#D8D0C0, 1.29–1.53: no llega a 3:1, WCAG 1.4.11);
// va `muted` (3.17 contra warm, 3.77 contra blanco) — PROPUESTA en espera del líder (C31). Placeholder `ink/70` (4.81 · 5.24) en lugar del
// `ink/40` de la maqueta (2.22) — misma espera. El error se lee (role="alert") y queda ligado al campo (aria-describedby, aria-invalid).

type Tipo = 'text' | 'email' | 'tel' | 'number' | 'date' | 'search' | 'url' | 'password' | 'textarea' | 'select'

type Props = {
  etiqueta: string
  /** La etiqueta sigue en el DOM para lectores de pantalla, pero no se ve. */
  etiquetaOculta?: boolean
  tipo?: Tipo
  opciones?: { valor: string; etiqueta: string }[]
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  requerido?: boolean
  ayuda?: string
  error?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  min?: string | number
  max?: string | number
  filas?: number
  deshabilitado?: boolean
  sobreOscuro?: boolean
  testId?: string
  className?: string
}

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

const Campo = forwardRef<Control, Props>(function Campo(
  {
    etiqueta,
    etiquetaOculta = false,
    tipo = 'text',
    opciones = [],
    id,
    name,
    value,
    defaultValue,
    onChange,
    onBlur,
    requerido = false,
    ayuda,
    error,
    placeholder,
    autoComplete,
    inputMode,
    maxLength,
    min,
    max,
    filas = 4,
    deshabilitado = false,
    sobreOscuro = false,
    testId = 'sn-campo',
    className,
  },
  ref,
) {
  const generado = useId()
  const idCampo = id ?? `${generado}-campo`
  const idAyuda = ayuda ? `${idCampo}-ayuda` : undefined
  const idError = error ? `${idCampo}-error` : undefined
  const describe = [idError, idAyuda].filter(Boolean).join(' ') || undefined

  const clasesControl = unirClases(
    'block w-full rounded-sn-campo border border-solid bg-white px-3.5 py-3 font-sn-texto text-sn-cuerpo-sm font-normal text-sn-ink',
    'placeholder:text-sn-ink/70',
    error ? 'border-sn-terra' : 'border-sn-muted',
    deshabilitado && 'cursor-not-allowed opacity-60',
    sobreOscuro ? FOCO_SOBRE_OSCURO : FOCO,
  )
  const comunes = {
    id: idCampo,
    name,
    required: requerido,
    'aria-required': requerido || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describe,
    disabled: deshabilitado,
    'data-testid': testId,
    className: clasesControl,
    onBlur,
  } as const

  let control: React.ReactNode
  if (tipo === 'textarea') {
    control = (
      <textarea
        {...comunes}
        ref={ref as React.Ref<HTMLTextAreaElement>}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={filas}
      />
    )
  } else if (tipo === 'select') {
    control = (
      <select {...comunes} ref={ref as React.Ref<HTMLSelectElement>} value={value} defaultValue={defaultValue} onChange={onChange}>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    )
  } else {
    control = (
      <input
        {...comunes}
        ref={ref as React.Ref<HTMLInputElement>}
        type={tipo}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        max={max}
      />
    )
  }

  const tonoEtiqueta = sobreOscuro ? 'text-sn-warm' : 'text-sn-ink'
  return (
    <div data-testid={`${testId}-campo`} className={unirClases('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={idCampo}
        data-testid={`${testId}-etiqueta`}
        className={unirClases(
          etiquetaOculta ? 'sr-only' : 'font-sn-mono text-sn-etiqueta-sm font-medium uppercase',
          !etiquetaOculta && tonoEtiqueta,
        )}
      >
        {etiqueta}
      </label>
      {control}
      {ayuda && (
        <p id={idAyuda} data-testid={`${testId}-ayuda`} className={unirClases('m-0 font-sn-texto text-sn-cuerpo-xs font-normal', sobreOscuro ? 'text-sn-warm' : 'text-sn-ink')}>
          {ayuda}
        </p>
      )}
      {error && (
        <p
          id={idError}
          role="alert"
          data-testid={`${testId}-error`}
          className={unirClases('m-0 font-sn-texto text-sn-cuerpo-xs font-medium', sobreOscuro ? 'text-sn-warm' : 'text-sn-terra')}
        >
          {error}
        </p>
      )}
    </div>
  )
})

export default Campo
