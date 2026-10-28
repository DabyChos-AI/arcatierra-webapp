'use client'

// R15 · F1 (WF1, sesión 54): el menú del celular de la maqueta (`#burger-drawer`): cajón a la derecha con los 8 enlaces,
// «Quiero canasta →», «Mi cuenta» y «Tu canasta». Esc, el fondo y ✕ lo cierran; el foco queda atrapado adentro mientras está
// abierto y regresa al botón que lo abrió. Capa z-[950] (la de los modales públicos, Z_INDEX_HIERARCHY.md).
// Siempre está en el HTML (oculto con `invisible`): abrir y cerrar no cambia el árbol, solo clases.
import { useEffect, useRef, type RefObject } from 'react'
import Link from 'next/link'
import { abrirCarrito } from '@/lib/carrito'
import { ENLACE_MI_CUENTA, ENLACE_QUIERO_CANASTA, ENLACES_MENU_CELULAR } from './enlaces'

export const ID_MENU_CELULAR = 'sn-menu-celular'

type Props = {
  abierto: boolean
  onCerrar: () => void
  /** El botón que lo abre: ahí regresa el foco al cerrar. */
  botonRef: RefObject<HTMLButtonElement | null>
  conteo: number
  /** Href del enlace de la página actual (aria-current), o null. */
  actual: string | null
}

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function MenuCelular({ abierto, onCerrar, botonRef, conteo, actual }: Props) {
  const cajonRef = useRef<HTMLElement>(null)
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const estabaAbierto = useRef(false)

  // Al abrir: foco en ✕, sin scroll detrás, Esc cierra y Tab no sale del cajón. Al cerrar: el foco regresa al botón.
  useEffect(() => {
    if (!abierto) {
      if (estabaAbierto.current) botonRef.current?.focus()
      estabaAbierto.current = false
      return
    }
    estabaAbierto.current = true
    const overflowAntes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cerrarRef.current?.focus()

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCerrar()
        return
      }
      if (e.key !== 'Tab' || !cajonRef.current) return
      const enfocables = Array.from(cajonRef.current.querySelectorAll<HTMLElement>(ENFOCABLES))
      if (enfocables.length === 0) return
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      const activo = document.activeElement
      if (e.shiftKey && (activo === primero || !cajonRef.current.contains(activo))) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && (activo === ultimo || !cajonRef.current.contains(activo))) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = overflowAntes
    }
  }, [abierto, onCerrar, botonRef])

  const claseEnlace =
    'block border-b border-sn-borde py-4 font-sn-titulos text-2xl leading-[1.1] tracking-[-0.3px] text-sn-tinta hover:text-sn-terra'

  return (
    <>
      <div
        data-testid="sn-menu-fondo"
        aria-hidden="true"
        onClick={onCerrar}
        className={`fixed inset-0 z-[950] bg-[rgba(61,42,26,0.55)] backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
          abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        ref={cajonRef}
        id={ID_MENU_CELULAR}
        data-testid="sn-menu-celular"
        data-abierto={abierto ? '1' : '0'}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        aria-hidden={!abierto}
        // Al abrir, `visible` entra de inmediato (solo se anima el desplazamiento) para que ✕ pueda recibir el foco en el
        // mismo instante; al cerrar, `visibility` espera a que termine el desplazamiento.
        className={`fixed bottom-0 right-0 top-0 z-[950] w-[84%] max-w-[380px] overflow-y-auto bg-sn-calido px-8 pb-8 pt-[76px] shadow-sn-cajon duration-300 ease-out motion-reduce:transition-none ${
          abierto ? 'visible translate-x-0 transition-transform' : 'invisible translate-x-full transition-[transform,visibility]'
        }`}
      >
        <button
          ref={cerrarRef}
          type="button"
          data-testid="sn-menu-cerrar"
          aria-label="Cerrar menú"
          onClick={onCerrar}
          className="absolute right-[22px] top-[18px] p-2 font-sn-texto text-lg leading-none text-sn-tinta hover:text-sn-terra"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <nav aria-label="Menú del celular" className="flex flex-col">
          {ENLACES_MENU_CELULAR.map((e) => (
            <Link
              key={e.href + e.texto}
              href={e.href}
              data-testid="sn-menu-enlace"
              data-href={e.href}
              aria-current={actual === e.href ? 'page' : undefined}
              onClick={onCerrar}
              className={`${claseEnlace} ${actual === e.href ? 'text-sn-terra' : ''}`}
            >
              {e.texto}
            </Link>
          ))}

          <div className="mt-7 flex flex-col gap-[10px]">
            <Link
              href={ENLACE_QUIERO_CANASTA.href}
              data-testid="sn-menu-quiero-canasta"
              onClick={onCerrar}
              className="block rounded-sn-boton bg-sn-terra px-5 py-[14px] text-center font-sn-mono text-xs font-medium uppercase leading-[1.1] tracking-[1.6px] text-white hover:bg-sn-tinta hover:text-white"
            >
              {ENLACE_QUIERO_CANASTA.texto} →
            </Link>
            <Link
              href={ENLACE_MI_CUENTA.href}
              data-testid="sn-menu-cuenta"
              onClick={onCerrar}
              className="block rounded-sn-pildora border border-sn-tinta p-3 text-center font-sn-mono text-xs uppercase leading-[1.1] tracking-[1.1px] text-sn-tinta hover:border-sn-terra hover:text-sn-terra"
            >
              {ENLACE_MI_CUENTA.texto}
            </Link>
            <button
              type="button"
              data-testid="sn-menu-canasta"
              onClick={() => {
                onCerrar()
                abrirCarrito()
              }}
              className="block w-full rounded-sn-pildora border border-sn-tinta p-3 text-center font-sn-mono text-xs uppercase leading-[1.1] tracking-[1.1px] text-sn-tinta hover:border-sn-terra hover:text-sn-terra"
            >
              Tu canasta{conteo > 0 ? ` (${conteo})` : ''}
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}
