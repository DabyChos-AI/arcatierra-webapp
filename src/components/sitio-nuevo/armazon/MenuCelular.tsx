'use client'

// R15 v2 · F1: el menú del celular del sitio nuevo (maqueta `#burger-drawer`). Un cajón a la derecha con las ligas, «Quiero canasta»
// (con la marca: pregunta C41), «Mi cuenta» y «Carrito» (el texto de hoy; la maqueta dice «Tu canasta»). Contrato v2 §9 C20, C24, C32.
// - Cerrado, el velo lleva `hidden` (display:none): nada de adentro se ve ni se enfoca, y la marca no cuenta como visible (C32).
// - Abierto: el foco pasa al cajón (role="dialog"); dos guardas, antes y después del cajón, mandan el Tab de vuelta al otro extremo.
//   Escape (keydown del propio velo), un clic en el velo y el ✕ lo cierran; quien lo abre (Cabecera) le devuelve el foco a su botón.
//   La página de atrás no se desplaza (clase en <html>) y, si la ventana crece hasta la barra de escritorio, se cierra solo.
// - Entra como la maqueta, con la Web Animations API (sin reglas nuevas en el CSS de hoy): el cajón en .35 s, el velo en .3 s; con
//   «reducir movimiento», sin animación.
// - Capa `z-[950]` (la de los modales públicos, Z_INDEX_HIERARCHY.md).
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { abrirCarrito } from '@/lib/carrito'
import Falta from '@/components/sitio-nuevo/Falta'
import { ENLACE_MI_CUENTA, HREF_TIENDA, ligasDe, type Enlace } from './enlaces'
import { CORTE_ESCRITORIO, E } from './estilos'
import { esLigaActual, useDireccionPublica } from './ligaActual'

const LIGAS = ligasDe('celular')
/** Lo que se alcanza con Tab dentro del cajón: solo hay ligas y botones. */
const CON_TAB = 'a[href], button:not([disabled])'
const SIN_SCROLL = 'overflow-hidden'

function entrar(velo: HTMLElement, cajon: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  cajon.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.16,1,.3,1)' })
  velo.animate([{ backgroundColor: 'transparent' }, { backgroundColor: getComputedStyle(velo).backgroundColor }], {
    duration: 300,
    easing: 'ease',
  })
}

interface Props {
  id: string
  abierto: boolean
  /** Cierra el menú y regresa el foco a su botón. */
  alCerrar: () => void
}

export default function MenuCelular({ id, abierto, alCerrar }: Props) {
  const velo = useRef<HTMLDivElement>(null)
  const cajon = useRef<HTMLDivElement>(null)
  const publica = useDireccionPublica()

  useEffect(() => {
    const v = velo.current
    const c = cajon.current
    if (!abierto || !v || !c) return
    const html = document.documentElement
    html.classList.add(SIN_SCROLL)
    c.focus()
    entrar(v, c)
    const siCreceLaVentana = () => {
      if (window.innerWidth >= CORTE_ESCRITORIO) alCerrar()
    }
    window.addEventListener('resize', siCreceLaVentana)
    return () => {
      window.removeEventListener('resize', siCreceLaVentana)
      html.classList.remove(SIN_SCROLL)
    }
  }, [abierto, alCerrar])

  // Guardas: el que va antes del cajón recibe el Shift+Tab desde el primero y manda al último; el de después, al revés.
  const saltarA = (extremo: 'primero' | 'ultimo') => () => {
    const enCajon = cajon.current ? Array.from(cajon.current.querySelectorAll<HTMLElement>(CON_TAB)) : []
    const destino = extremo === 'primero' ? enCajon.at(0) : enCajon.at(-1)
    destino?.focus()
  }

  return (
    <div
      ref={velo}
      id={id}
      hidden={!abierto}
      className={E.menu.velo}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return
        // El velo no recibe foco: sin esto el clic lo manda a <body> y Escape ya no llega aquí.
        e.preventDefault()
        // El 2.º clic de un doble clic en el botón del menú cae en el velo mientras el cajón entra: no cierra (como Avisos.tsx).
        if (e.detail <= 1) alCerrar()
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return
        e.stopPropagation()
        alCerrar()
      }}
      data-testid="sn-menu-celular"
      data-abierto={abierto ? '1' : '0'}
    >
      <span tabIndex={0} onFocus={saltarA('ultimo')} className="sr-only" />

      <div ref={cajon} role="dialog" aria-modal="true" aria-label="Menú" tabIndex={-1} className={E.menu.cajon}>
        <button type="button" onClick={alCerrar} aria-label="Cerrar menú" className={E.menu.cerrar} data-testid="sn-menu-cerrar">
          <X size={20} aria-hidden="true" focusable="false" />
        </button>

        <nav aria-label="Principal">
          <ul>
            {LIGAS.map((liga) => (
              <LigaDelCajon key={`${liga.href}·${liga.texto}`} liga={liga} actual={esLigaActual(liga.href, publica)} alElegir={alCerrar} />
            ))}
          </ul>
        </nav>

        <div className={E.menu.acciones}>
          <Link href={HREF_TIENDA} onClick={alCerrar} className={E.menu.tienda} data-testid="sn-menu-tienda">
            <Falta que="texto del botón a la tienda" quien="Lucio y Pablo" />
          </Link>
          <Link href={ENLACE_MI_CUENTA.href} onClick={alCerrar} className={E.menu.secundario} data-testid="sn-menu-cuenta">
            {ENLACE_MI_CUENTA.texto}
          </Link>
          {/* Primero se cierra (el foco va al botón del menú) y luego se abre el carrito lateral de siempre. */}
          <button
            type="button"
            onClick={() => {
              alCerrar()
              abrirCarrito()
            }}
            className={E.menu.secundario}
            data-testid="sn-menu-carrito"
          >
            Carrito
          </button>
        </div>
      </div>

      <span tabIndex={0} onFocus={saltarA('primero')} className="sr-only" />
    </div>
  )
}

function LigaDelCajon({ liga, actual, alElegir }: { liga: Enlace; actual: boolean; alElegir: () => void }) {
  return (
    <li>
      <Link
        href={liga.href}
        onClick={alElegir}
        aria-current={actual ? 'page' : undefined}
        className={E.menu.enlace}
        data-testid="sn-menu-enlace"
        data-href={liga.href}
      >
        {liga.texto}
      </Link>
    </li>
  )
}
