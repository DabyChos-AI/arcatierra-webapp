'use client'

// R15 v2 · F5 (recetas, sesión 63): una pregunta plegable de la FAQ (maqueta `.faq-q`: pregunta serif, círculo terra con la cruz o el más,
// respuesta debajo, filete entre preguntas). No existe en `ui/` (CONTRATO-BASE-F1 §4: «para la fase que lo use»; D-F5-12 P-14).
// Cada pregunta se abre sola (en la maqueta; hoy, una a la vez: diseño). Cerrada, la respuesta está oculta de verdad (`hidden`, C32).
// Una pregunta cuya respuesta es una marca empieza abierta, para que la marca se vea al cargar.
// `globals.css` le pone la letra del texto a `span` y a `button`: la pregunta lleva la serif en su propio `span`.
// F8 (D-F8-16, P-5): al abrir, la respuesta entra con un fundido corto y el signo gira hasta quedar en la cruz; al cerrar, el signo gira de
// vuelta (maqueta `.faq-q-toggle`: 45° en .25 s; `.faq-q-answer`: .3 s). El estado cambia en el acto, como antes: la respuesta tiene su caja
// completa desde el primer cuadro (no se anima el alto) y al cerrar se oculta de inmediato. Con la Web Animations API (movimiento.ts): sin
// reglas de CSS y sin animación con «reducir movimiento».
import { useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Plus, X } from 'lucide-react'
import { CURVA_SUAVE, OPACIDAD_DE_ENTRADA, animar } from '@/components/sitio-nuevo/movimiento'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import type { OrigenRespuesta } from './preguntas'

const P = 'sn-faq-categorias-pregunta'

type Props = {
  id: number
  pregunta: string
  origen: OrigenRespuesta
  abiertaAlInicio?: boolean
  children: React.ReactNode
}

export default function PreguntaPlegable({ id, pregunta, origen, abiertaAlInicio = false, children }: Props) {
  const [abierta, setAbierta] = useState(abiertaAlInicio)
  const base = useId()
  const idBoton = `${base}-boton`
  const idPanel = `${base}-respuesta`
  const signo = useRef<HTMLSpanElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  const alternar = () => {
    const abrir = !abierta
    // Primero el estado, ya pintado en el DOM (`hidden`, `aria-expanded`, `data-abierta`); el movimiento va encima.
    flushSync(() => setAbierta(abrir))
    animar(signo.current, [{ transform: `rotate(${abrir ? '-45deg' : '45deg'})` }, { transform: 'none' }], { duration: 250, easing: 'ease' })
    if (abrir) {
      animar(panel.current, [{ opacity: OPACIDAD_DE_ENTRADA, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], {
        duration: 300,
        easing: CURVA_SUAVE,
      })
    }
  }

  return (
    <div
      data-testid={P}
      data-pregunta-id={id}
      data-abierta={abierta ? 'si' : 'no'}
      data-origen={origen}
      className="border-0 border-b border-solid border-sn-border"
    >
      <h3 className="m-0 font-sn-titulos text-sn-h5 font-normal text-sn-ink">
        <button
          type="button"
          id={idBoton}
          data-testid={`${P}-boton`}
          aria-expanded={abierta}
          aria-controls={idPanel}
          onClick={alternar}
          className={unirClases('flex w-full items-center justify-between gap-6 bg-transparent py-6 text-left text-sn-ink', FOCO)}
        >
          <span className="min-w-0 break-words font-sn-titulos text-sn-h5 font-normal">{pregunta}</span>
          <span
            ref={signo}
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sn-pildora bg-sn-terra text-white"
          >
            {abierta ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
        </button>
      </h3>
      <div ref={panel} id={idPanel} role="region" aria-labelledby={idBoton} hidden={!abierta} data-testid={`${P}-respuesta`} className="pb-6 pr-14">
        {children}
      </div>
    </div>
  )
}
