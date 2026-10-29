'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { FOCO_BOTON, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4; C32): ventana modal del sitio nuevo (la usa el popup del armazón). Medido en la maqueta: velo ink al
// 30 % con 24 px de margen (`#arca-popup`), panel warm de hasta 760 px con radio 14 y sombra (`div.popup`), relleno 36/32 en escritorio y
// 28/24 en el celular (`.popup-content`), ✕ en un círculo de 32 px ink al 15 % a 14 px de la esquina (`.popup-close`).
// Cerrado NO está en el DOM (C32). Abierto: role="dialog" + aria-modal, foco dentro (Tab da la vuelta), Escape cierra, el clic en el velo
// cierra (no el 2.º clic de un doble clic, como Avisos.tsx), el foco regresa a donde estaba y la página de atrás no se desplaza.
// Sin texto propio: el título (o el id del título que pinte quien lo usa) y la etiqueta del ✕ los pasa quien lo usa.

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type Comun = {
  abierto: boolean
  onCerrar: () => void
  /** `aria-label` del botón ✕. */
  etiquetaCerrar: string
  cerrarConFondo?: boolean
  /** Relleno de la maqueta (28/24 → 36/32 desde 860 px). Sin relleno, el contenido llega a las orillas (la foto del popup). */
  relleno?: boolean
  testId?: string
  className?: string
  children: React.ReactNode
}

type ConTitulo = Comun & { titulo: React.ReactNode; tituloOculto?: boolean; etiquetadoPor?: never }
/** El título lo pinta quien usa el diálogo, dentro de `children`, con este id. */
type ConEtiqueta = Comun & { etiquetadoPor: string; titulo?: never; tituloOculto?: never }

export type DialogoProps = ConTitulo | ConEtiqueta

export default function Dialogo(props: DialogoProps) {
  if (!props.abierto) return null
  return <DialogoAbierto {...props} />
}

function DialogoAbierto({
  onCerrar,
  etiquetaCerrar,
  cerrarConFondo = true,
  relleno = true,
  testId = 'sn-dialogo',
  className,
  children,
  ...resto
}: DialogoProps) {
  const idTitulo = `${useId()}-titulo`
  const panelRef = useRef<HTMLDivElement>(null)
  const cerrarRef = useRef(onCerrar)
  cerrarRef.current = onCerrar

  useEffect(() => {
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const raiz = document.documentElement
    const desbordeAntes = raiz.style.overflow
    raiz.style.overflow = 'hidden'
    panelRef.current?.focus()

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        cerrarRef.current()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const enfocables = [...panelRef.current.querySelectorAll<HTMLElement>(ENFOCABLES)].filter((el) => el.offsetParent !== null)
      if (!enfocables.length) {
        e.preventDefault()
        return
      }
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      const activo = document.activeElement
      if (e.shiftKey && (activo === primero || activo === panelRef.current)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      raiz.style.overflow = desbordeAntes
      if (antes && antes.isConnected) antes.focus()
    }
  }, [])

  const etiquetadoPor = 'etiquetadoPor' in resto && resto.etiquetadoPor ? resto.etiquetadoPor : idTitulo
  const titulo = 'titulo' in resto ? resto.titulo : undefined
  const tituloOculto = 'tituloOculto' in resto ? resto.tituloOculto : false

  return (
    <div
      data-testid={`${testId}-fondo`}
      className="fixed inset-0 z-[950] flex items-center justify-center bg-sn-ink/30 p-6"
      onMouseDown={(e) => {
        if (cerrarConFondo && e.target === e.currentTarget && e.detail <= 1) onCerrar()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={etiquetadoPor}
        tabIndex={-1}
        data-testid={testId}
        className={unirClases(
          // La sombra medida de `div.popup` va como propiedad arbitraria y no como utilidad de sombra: una utilidad de sombra nueva hace
          // que el minificador reagrupe las reglas de sombra de hoy (cambia su texto, C16; CONTRATO-BASE-F1 §3.4).
          'relative max-h-[calc(100dvh-48px)] w-full max-w-[760px] overflow-y-auto rounded-sn-tarjeta bg-sn-warm text-sn-ink outline-none [box-shadow:0_12px_32px_rgba(0,0,0,0.18)]',
          className,
        )}
      >
        <div className={relleno ? 'px-6 py-7 min-[860px]:px-8 min-[860px]:py-9' : undefined}>
          {titulo !== undefined && (
            <h2
              id={idTitulo}
              data-testid={`${testId}-titulo`}
              className={unirClases(tituloOculto ? 'sr-only' : 'm-0 mb-4 pr-10 font-sn-titulos text-sn-h4 font-normal text-sn-ink')}
            >
              {titulo}
            </h2>
          )}
          {children}
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label={etiquetaCerrar}
          data-testid={`${testId}-cerrar`}
          className={unirClases('absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-sn-pildora text-sn-ink', FOCO_BOTON)}
        >
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-sn-pildora bg-sn-ink/15">
            <X className="h-4 w-4" strokeWidth={1.75} focusable="false" />
          </span>
        </button>
      </div>
    </div>
  )
}
