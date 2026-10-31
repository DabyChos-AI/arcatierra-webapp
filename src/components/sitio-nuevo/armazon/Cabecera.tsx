'use client'

// R15 v2 · F1: la cabecera del sitio nuevo (maqueta `.topbar`). De izquierda a derecha: logo, ligas (desde 1100 px), cuenta, carrito con
// su contador, «Quiero canasta» (desde 1100 px, con la marca: pregunta C41) y el botón del menú del celular (debajo de 1100 px).
// Originales: TransparentHeader.tsx (logo, ligas, cuenta, carrito) y enlaces.ts (contrato v2 §9 C20). F3 (D-F3-05, D-F3-13, D-F3-22 P-6):
// el carrito es la liga a la página del carrito (se ve también a 390); el carrito lateral de hoy ya no se abre desde aquí. Cuando el
// conteo SUBE, el contador da el salto de la maqueta (`bumpCart()`: escala 1 → 1.4 → 1, medido) con la Web Animations API, sin reglas
// nuevas en el CSS de hoy y sin animación con «reducir movimiento»; el cambio de color de la maqueta no va (el texto blanco sobre ese
// color queda en 3.77, no pasa AA).
// Hidratación (contrato v1 §3.3): el primer render es igual en servidor y navegador. La liga actual sale de los segmentos
// (ligaActual.ts); el contador, `data-pegada` y la sesión llegan después de hidratar.
// Textos de los controles: los de hoy, tal cual (C24): «Carrito» (TransparentHeader.tsx:833), «Abrir menú» / «Cerrar menú» (:956).
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, ShoppingCart } from 'lucide-react'
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

const sinAvisos = () => () => {}

/** false en el servidor y al hidratar; true desde el render que sigue a la hidratación (el mismo en que llega el conteo del navegador). */
function useYaHidratada(): boolean {
  return useSyncExternalStore(sinAvisos, () => true, () => false)
}

/**
 * El salto del contador cuando el conteo sube (no al cargar la página ni al bajar). Al hidratar, `useConteoCarrito` da 0 (lo del
 * servidor) y en el render siguiente las piezas del navegador: esa primera lectura no es una subida, solo fija desde dónde se cuenta.
 */
function useSaltoAlSubir(conteo: number): RefObject<HTMLSpanElement> {
  const contador = useRef<HTMLSpanElement>(null)
  const yaHidratada = useYaHidratada()
  const anterior = useRef<number | null>(null)
  useEffect(() => {
    if (!yaHidratada) return
    const antes = anterior.current
    anterior.current = conteo
    const el = contador.current
    if (antes === null || conteo <= antes || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }], {
      duration: 500,
      easing: 'cubic-bezier(.34,1.56,.64,1)',
    })
  }, [conteo, yaHidratada])
  return contador
}

export default function Cabecera() {
  const centinela = useRef<HTMLSpanElement>(null)
  const botonMenu = useRef<HTMLButtonElement>(null)
  const pegada = useFueraDeVista(centinela)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const conteo = useConteoCarrito()
  const contador = useSaltoAlSubir(conteo)
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

          <Link href="/carrito" aria-label="Carrito" className={`relative ${E.iconoBoton}`} data-testid="sn-cabecera-carrito">
            <ShoppingCart size={18} aria-hidden="true" focusable="false" />
            {conteo > 0 ? (
              <span ref={contador} aria-hidden="true" className={E.carritoConteo} data-testid="sn-cabecera-carrito-conteo">
                {conteo > 9 ? '9+' : conteo}
              </span>
            ) : null}
          </Link>

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
