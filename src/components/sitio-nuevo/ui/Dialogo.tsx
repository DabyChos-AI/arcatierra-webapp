'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { FOCO_BOTON, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4; C32): ventana modal del sitio nuevo (la usa el popup del armazón). Medido en la maqueta: velo ink al
// 30 % con 24 px de margen (`#arca-popup`), panel warm de hasta 760 px con radio 14 y sombra (`div.popup`), relleno 36/32 en escritorio y
// 28/24 en el celular (`.popup-content`), ✕ en un círculo de 32 px ink al 15 % a 14 px de la esquina (`.popup-close`).
// Cerrado NO está en el DOM (C32). Abierto: role="dialog" + aria-modal, foco dentro (Tab da la vuelta), Escape cierra, el clic en el velo
// cierra (no el 2.º clic de un doble clic, como Avisos.tsx), el foco regresa a donde estaba y la página de atrás no se desplaza.
// El scroll va en un hijo del panel y no en el panel: así el ✕ (absoluto en el panel) no se va con el contenido en el celular. Al abrir, el
// foco va a ese hijo, para que las flechas lo desplacen. Panel e hijo llevan `focus:outline-none`: el `*:focus` de globals.css le gana a
// `outline-none` y pintaba el contorno terracota de hoy alrededor de todo el panel (medido por armazon, 12:37).
// El foco se queda dentro con dos guardas (C45): un elemento enfocable vacío al principio y otro al final del panel. Cuando Tab o Shift+Tab
// llegan a una guarda, ella pasa el foco al otro extremo de los controles del panel; no se escucha el teclado para Tab. Escape se atiende en el
// propio velo (`onKeyDown`), porque el foco siempre está dentro.
// Sin texto propio: el título (o el id del título que pinte quien lo usa) y la etiqueta del ✕ los pasa quien lo usa.

const CANDIDATOS = 'a[href], button, input, select, textarea, [tabindex]'

// Los controles a los que llega Tab dentro del panel, en orden del documento: con tabIndex ≥ 0, sin deshabilitar, pintados y sin las guardas.
function controles(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(CANDIDATOS)).filter(
    (el) => el.tabIndex >= 0 && !el.matches(':disabled') && !el.hasAttribute('data-guarda') && el.getClientRects().length > 0,
  )
}

/** Elemento vacío que solo existe para recibir el foco en una orilla del panel y mandarlo a la otra. Va en la esquina de arriba, dentro de
 * la caja del panel (sin el margen negativo de `sr-only`), para que enfocarlo no desplace el panel ni mueva el ✕. */
function Guarda({ alRecibirFoco }: { alRecibirFoco: () => void }) {
  return (
    <span
      data-guarda=""
      tabIndex={0}
      onFocus={alRecibirFoco}
      className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0 focus:outline-none"
    />
  )
}

type Comun = {
  abierto: boolean
  onCerrar: () => void
  /** `aria-label` del botón ✕. */
  etiquetaCerrar: string
  cerrarConFondo?: boolean
  /** Relleno de la maqueta (28/24 → 36/32 desde 861 px). Sin relleno, el contenido llega a las orillas (la foto del popup). */
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
  const desplazableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const raiz = document.documentElement
    const desbordeAntes = raiz.style.overflow
    raiz.style.overflow = 'hidden'
    desplazableRef.current?.focus()
    return () => {
      raiz.style.overflow = desbordeAntes
      if (antes && antes.isConnected) antes.focus()
    }
  }, [])

  // La guarda de arriba recibe el foco con Shift+Tab desde el primer control: lo manda al último. La de abajo, al revés.
  const irA = (orilla: 'principio' | 'final') => {
    const lista = panelRef.current ? controles(panelRef.current) : []
    const destino = orilla === 'principio' ? lista[0] : lista[lista.length - 1]
    ;(destino ?? desplazableRef.current)?.focus()
  }

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
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return
        e.stopPropagation()
        onCerrar()
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
          'relative w-full max-w-[760px] overflow-hidden rounded-sn-tarjeta bg-sn-warm text-sn-ink focus:outline-none [box-shadow:0_12px_32px_rgba(0,0,0,0.18)]',
          className,
        )}
      >
        <Guarda alRecibirFoco={() => irA('final')} />
        <div
          ref={desplazableRef}
          tabIndex={-1}
          data-testid={`${testId}-contenido`}
          className={unirClases(
            'max-h-[calc(100dvh-48px)] overflow-y-auto overscroll-contain focus:outline-none',
            relleno && 'px-6 py-7 min-[861px]:px-8 min-[861px]:py-9',
          )}
        >
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
        <Guarda alRecibirFoco={() => irA('principio')} />
      </div>
    </div>
  )
}
