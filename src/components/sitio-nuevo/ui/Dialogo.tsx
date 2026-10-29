'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { FOCO_BOTON, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4; C32, C45, C47): ventana modal del sitio nuevo; la usa el popup del armazón.
//
// Diseño medido en la maqueta: velo ink al 30 % con 24 px de margen (`#arca-popup`); panel warm de hasta 760 px, radio 14 y sombra
// (`div.popup`); relleno 28/24 en el celular y 36/32 desde 861 px (`.popup-content`); ✕ en un círculo de 32 px ink al 15 % (`.popup-close`).
//
// Conducta:
// - Cerrado no está en el DOM (C32). Abierto: role="dialog" + aria-modal y la página de atrás no se desplaza.
// - El scroll va en un hijo del panel (`-contenido`), así el ✕, que está fijo en el panel, no se va con el contenido.
// - Al abrir, el foco entra a `-contenido` (las flechas lo desplazan). Al cerrar, regresa a donde estaba.
// - Tab: dos guardas vacías en las orillas del panel pasan el foco a la otra punta (C45).
// - El foco no se queda fuera mientras está abierto (C47): si se va del panel —porque se desmonta, se oculta o se deshabilita el control que
//   lo tenía, o porque algo lo mueve afuera— vuelve a `-contenido`. Lo vigila un MutationObserver sobre el panel y `focusin` en el documento.
// - Escape cierra esté donde esté el foco (C47): se oye en `window`, también cuando el foco cayó en <body>.
// - El clic en el velo cierra (no el 2.º clic de un doble clic, como Avisos.tsx).
// - Panel y `-contenido` llevan `focus:outline-none`: el `*:focus` de globals.css pintaba el contorno terracota de hoy (armazon, 12:37).
// Sin texto propio: el título (o el id del título que pinte quien lo usa) y la etiqueta del ✕ los pasa quien lo usa.

const SELECTOR_CONTROLES = 'a[href], button, input, select, textarea, [tabindex]'

/** Lo que alcanza Tab dentro del panel, en orden del documento (sin las guardas). */
function alcanzables(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(SELECTOR_CONTROLES)).filter(
    (el) => el.tabIndex >= 0 && !el.matches(':disabled') && !el.hasAttribute('data-guarda') && el.getClientRects().length > 0,
  )
}

/** Orilla enfocable y vacía: al recibir el foco lo manda a la otra punta. En la esquina de arriba, dentro de la caja del panel. */
function Guarda({ enviar }: { enviar: () => void }) {
  return (
    <span
      data-guarda=""
      tabIndex={0}
      onFocus={enviar}
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
  const contenidoRef = useRef<HTMLDivElement>(null)
  // Escape se oye fuera de React: el oyente lee siempre el onCerrar más reciente sin volver a montarse.
  const cerrarVigente = useRef(onCerrar)
  useEffect(() => {
    cerrarVigente.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    const panel = panelRef.current
    const contenido = contenidoRef.current
    if (!panel || !contenido) return
    const dondeEstaba = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const html = document.documentElement
    const desbordeOriginal = html.style.overflow
    html.style.overflow = 'hidden'
    contenido.focus()

    // Regresa el foco a `-contenido` si no está dentro del panel.
    const reubicar = () => {
      if (!panel.contains(document.activeElement)) contenido.focus({ preventScroll: true })
    }
    // Quitar el control enfocado deja el foco en <body> en el acto; ocultarlo o deshabilitarlo lo deja ahí al siguiente cuadro.
    const vigia = new MutationObserver(() => {
      reubicar()
      requestAnimationFrame(() => setTimeout(reubicar, 0))
    })
    vigia.observe(panel, { subtree: true, childList: true, attributes: true })

    const oyentes = new AbortController()
    document.addEventListener('focusin', reubicar, { signal: oyentes.signal })
    window.addEventListener(
      'keydown',
      (evento) => {
        if (evento.key !== 'Escape' || evento.isComposing || evento.defaultPrevented) return
        cerrarVigente.current()
      },
      { signal: oyentes.signal },
    )

    return () => {
      oyentes.abort()
      vigia.disconnect()
      html.style.overflow = desbordeOriginal
      if (dondeEstaba?.isConnected) dondeEstaba.focus()
    }
  }, [])

  // Guarda de arriba (Shift+Tab desde el primero) → al último; guarda de abajo (Tab desde el último) → al primero.
  const mandarA = (punta: 'primero' | 'ultimo') => {
    const lista = panelRef.current ? alcanzables(panelRef.current) : []
    const elegido = punta === 'primero' ? lista[0] : lista[lista.length - 1]
    ;(elegido ?? contenidoRef.current)?.focus()
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
        <Guarda enviar={() => mandarA('ultimo')} />
        <div
          ref={contenidoRef}
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
        <Guarda enviar={() => mandarA('primero')} />
      </div>
    </div>
  )
}
