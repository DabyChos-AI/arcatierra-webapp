'use client'

// R15 v2 · F1: la cabecera del sitio nuevo (maqueta `.topbar`). De izquierda a derecha: logo, ligas (desde 1100 px), cuenta, carrito con
// su contador, «Quiero canasta» (desde 1100 px, con la marca: pregunta C41) y el botón del menú del celular (debajo de 1100 px).
// Originales: TransparentHeader.tsx (logo, ligas, cuenta, carrito) y enlaces.ts (contrato v2 §9 C20). El carrito es el de siempre
// (src/lib/carrito.ts → CartSidebar); su botón se ve también a 390, porque ahí es la única forma de abrirlo (Z_INDEX_HIERARCHY.md).
// Hidratación (contrato v1 §3.3): el primer render es igual en servidor y navegador. La liga actual sale de los segmentos
// (ligaActual.ts); el contador, `data-pegada` y la sesión llegan después de hidratar.
// Textos de los controles: los de hoy, tal cual (C24): «Carrito» (TransparentHeader.tsx:833), «Abrir menú» / «Cerrar menú» (:956).
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, ShoppingCart } from 'lucide-react'
import { abrirCarrito } from '@/lib/carrito'
import Falta from '@/components/sitio-nuevo/Falta'
import { HREF_TIENDA, ligasDe, type Enlace } from './enlaces'
import { E } from './estilos'
import { esLigaActual, useDireccionPublica } from './ligaActual'
import MenuCelular from './MenuCelular'
import MenuCuenta from './MenuCuenta'
import { useConteoCarrito } from './useConteoCarrito'

const LIGAS = ligasDe('cabecera')
const ID_MENU = 'sn-menu-celular'

// La maqueta pega la sombra con `window.scrollY > 8`. Un centinela de 8 px en el borde de arriba del documento: mientras toca la
// ventana, la página va entre 0 y 8 px. Estilo en línea: no agrega reglas al CSS que comparte el sitio de hoy (C16).
const CENTINELA: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: 1, height: 8, pointerEvents: 'none' }

function useFueraDeVista(objetivo: RefObject<HTMLElement | null>): boolean {
  const [fuera, setFuera] = useState(false)
  useEffect(() => {
    const el = objetivo.current
    if (!el) return
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) setFuera(!entrada.isIntersecting)
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [objetivo])
  return fuera
}

export default function Cabecera() {
  const centinela = useRef<HTMLSpanElement>(null)
  const botonMenu = useRef<HTMLButtonElement>(null)
  const pegada = useFueraDeVista(centinela)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const conteo = useConteoCarrito()
  const publica = useDireccionPublica()

  // Al cerrar, el foco vuelve al botón que abrió el menú (si ya no se ve, porque la ventana pasó el corte, no pasa nada).
  const cerrarMenu = useCallback(() => {
    setMenuAbierto(false)
    botonMenu.current?.focus()
  }, [])

  return (
    <>
      <span ref={centinela} aria-hidden="true" style={CENTINELA} />
      <header
        data-testid="sn-cabecera"
        data-pegada={pegada ? '1' : '0'}
        className={pegada ? `${E.cabecera} ${E.cabeceraPegada}` : E.cabecera}
      >
        <Link href="/" data-testid="sn-cabecera-logo" className={E.logoLiga}>
          <LogoDeHoy />
        </Link>

        <div className={E.acciones}>
          <nav aria-label="Principal" className={E.navEscritorio}>
            <ul className={E.navLista}>
              {LIGAS.map((liga) => (
                <LigaDeLaBarra key={`${liga.href}·${liga.texto}`} liga={liga} actual={esLigaActual(liga.href, publica)} />
              ))}
            </ul>
          </nav>

          {/* Sin sesión, «Iniciar Sesión»; con sesión, el menú de la persona (MenuCuenta.tsx). */}
          <MenuCuenta claseBoton={E.iconoBoton} clasePanel={E.cuentaPanel} claseEnlace={E.cuentaEnlace} />

          <button
            type="button"
            onClick={() => abrirCarrito()}
            aria-label="Carrito"
            className={`relative ${E.iconoBoton}`}
            data-testid="sn-cabecera-carrito"
          >
            <ShoppingCart size={18} aria-hidden="true" focusable="false" />
            {conteo > 0 ? (
              <span aria-hidden="true" className={E.carritoConteo} data-testid="sn-cabecera-carrito-conteo">
                {conteo > 9 ? '9+' : conteo}
              </span>
            ) : null}
          </button>

          <Link href={HREF_TIENDA} className={E.tiendaEscritorio} data-testid="sn-cabecera-tienda">
            <Falta que="texto del botón a la tienda" quien="Lucio y Pablo" />
          </Link>

          <button
            ref={botonMenu}
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            aria-controls={ID_MENU}
            className={`${E.iconoBoton} ${E.soloCelular}`}
            data-testid="sn-menu-boton"
          >
            <Menu size={22} aria-hidden="true" focusable="false" />
          </button>
        </div>
      </header>

      <MenuCelular id={ID_MENU} abierto={menuAbierto} alCerrar={cerrarMenu} />
    </>
  )
}

/** El logo de hoy (TransparentHeader.tsx): horizontal desde 1100 px; debajo, el isotipo y las letras. */
function LogoDeHoy() {
  const isotipo = '/images/logos/logo_arcatierra_sin_texto.png'
  const letras = '/images/logos/logo_arcatierra_solo_texto.png'
  return (
    <>
      <Image src="/images/logos/logo_arcatierra_horizontal.png" alt="Arca Tierra" width={1332} height={349} priority className={E.logoHorizontal} />
      <span className={E.logoAngosto}>
        <Image src={isotipo} alt="" width={2319} height={1679} priority className={E.logoIsotipo} />
        <Image src={letras} alt="Arca Tierra" width={2623} height={422} priority className={E.logoLetras} />
      </span>
    </>
  )
}

function LigaDeLaBarra({ liga, actual }: { liga: Enlace; actual: boolean }) {
  return (
    <li>
      <Link
        href={liga.href}
        aria-current={actual ? 'page' : undefined}
        className={E.navEnlace}
        data-testid="sn-cabecera-enlace"
        data-href={liga.href}
      >
        {liga.texto}
      </Link>
    </li>
  )
}
