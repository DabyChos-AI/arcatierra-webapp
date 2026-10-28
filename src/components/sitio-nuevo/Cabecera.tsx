'use client'

// R15 · F1 (WF1, sesión 54): la cabecera de la maqueta (`.topbar`): logo, 6 enlaces, cuenta, carrito con contador y
// «Quiero canasta»; se pega arriba y gana sombra al bajar 8 px. Debajo de 1100 px: carrito + botón del menú del celular.
//
// - La maqueta cambia al menú del celular en 860 px, pero entre 861 y ~1080 px su barra no cabe (se sale): aquí cambia en
//   1100 px, el otro corte de la maqueta, para que nada se salga de la pantalla.
// - El carrito es el MISMO de hoy (src/lib/carrito.ts): cuenta con `useConteoCarrito` y abre el carrito lateral de siempre
//   (`abrirCarrito()` → CartSidebar). La maqueta lo esconde a 390; aquí se queda visible porque hoy, debajo de 640 px, el
//   botón del encabezado es la única forma de abrir el carrito (CAR2, Z_INDEX_HIERARCHY.md) y no se pierde esa función.
// - Regla de F0 (contrato §3.3): nada visible se decide con usePathname() en el primer render (el servidor ve /nuevo y el
//   navegador /). El enlace activo sale de useSelectedLayoutSegments() + RUTAS_SITIO_NUEVO, igual en servidor y navegador.
// - Capa z-[940]: debajo de los modales públicos (950) y encima del tirador del carrito (900) y la burbuja (750).
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSelectedLayoutSegments } from 'next/navigation'
import { abrirCarrito } from '@/lib/carrito'
import { RUTAS_SITIO_NUEVO, SEGMENTO_SITIO_NUEVO } from '@/lib/sitio-nuevo'
import Logo from './Logo'
import MenuCelular, { ID_MENU_CELULAR } from './MenuCelular'
import { useConteoCarrito } from './useConteoCarrito'
import { ENLACE_MI_CUENTA, ENLACE_QUIERO_CANASTA, ENLACES_CABECERA, ENLACES_MENU_CELULAR } from './enlaces'

/** El segmento (debajo de src/app/nuevo) de un enlace que ya tiene página nueva; null si sigue con la de hoy o es la portada. */
function segmentoDe(href: string): string | null {
  const interna = RUTAS_SITIO_NUEVO[href.split('?')[0]]
  if (!interna) return null
  const resto = interna.replace(new RegExp(`^/${SEGMENTO_SITIO_NUEVO}/?`), '')
  return resto.length > 0 ? resto : null
}

/** El href del menú que corresponde a la página que se ve (solo páginas nuevas; en F1 ninguna fuera de la portada). */
function useEnlaceActual(): string | null {
  const segmentos = useSelectedLayoutSegments().join('/')
  if (!segmentos) return null
  const enlace = ENLACES_MENU_CELULAR.find((e) => {
    const s = segmentoDe(e.href)
    return s !== null && (segmentos === s || segmentos.startsWith(`${s}/`))
  })
  return enlace ? enlace.href : null
}

function IconoCuenta() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconoCarrito() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

const PILDORA =
  'relative inline-flex items-center gap-[6px] rounded-sn-pildora border-[1.5px] border-sn-borde px-[10px] py-[6px] text-sn-tinta transition-colors hover:border-sn-terra hover:text-sn-terra'

export default function Cabecera() {
  const [pegada, setPegada] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonMenuRef = useRef<HTMLButtonElement>(null)
  const { conteo, salto } = useConteoCarrito()
  const actual = useEnlaceActual()

  // Sombra al bajar más de 8 px (maqueta: `.topbar.is-stuck`). Arranca sin sombra en servidor y navegador.
  useEffect(() => {
    const alBajar = () => setPegada(window.scrollY > 8)
    alBajar()
    window.addEventListener('scroll', alBajar, { passive: true })
    return () => window.removeEventListener('scroll', alBajar)
  }, [])

  // Si la ventana crece hasta la barra de escritorio con el menú abierto, se cierra (el botón ya no se ve).
  useEffect(() => {
    if (!menuAbierto) return
    const consulta = window.matchMedia('(min-width: 1100px)')
    const alCambiar = () => {
      if (consulta.matches) setMenuAbierto(false)
    }
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [menuAbierto])

  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])

  return (
    <>
      <header
        data-testid="sn-cabecera"
        data-pegada={pegada ? '1' : '0'}
        className={`sticky top-0 z-[940] flex h-14 items-center justify-between gap-4 border-b border-sn-borde bg-sn-calido px-5 transition-shadow duration-300 motion-reduce:transition-none min-[1100px]:h-16 min-[1100px]:px-10 ${
          pegada ? 'shadow-sn-pegada' : 'shadow-none'
        }`}
      >
        <Link
          href="/"
          data-testid="sn-cabecera-logo"
          aria-label="Arca Tierra, inicio"
          className="flex min-w-0 shrink items-center text-sn-terra hover:text-sn-terra"
        >
          <Logo />
        </Link>

        <div className="flex shrink-0 items-center gap-[18px]">
          <nav aria-label="Principal" className="hidden min-[1100px]:block">
            <ul className="flex items-center gap-[22px]">
              {ENLACES_CABECERA.map((e) => {
                const activo = actual === e.href
                return (
                  <li key={e.href + e.texto}>
                    <Link
                      href={e.href}
                      data-testid="sn-cabecera-enlace"
                      data-href={e.href}
                      aria-current={activo ? 'page' : undefined}
                      className={`relative block font-sn-mono text-xs font-medium uppercase leading-[1.55] tracking-[1.2px] transition-colors after:absolute after:-bottom-[22px] after:left-0 after:right-0 after:h-[2px] after:origin-left after:bg-sn-terra after:transition-transform after:duration-200 hover:text-sn-terra hover:after:scale-x-100 motion-reduce:after:transition-none ${
                        activo ? 'text-sn-terra after:scale-x-100' : 'text-sn-tinta after:scale-x-0'
                      }`}
                    >
                      {e.texto}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3 min-[1100px]:border-l min-[1100px]:border-sn-borde min-[1100px]:pl-2">
            <Link
              href={ENLACE_MI_CUENTA.href}
              data-testid="sn-cabecera-cuenta"
              aria-label={ENLACE_MI_CUENTA.texto}
              title={ENLACE_MI_CUENTA.texto}
              className={`${PILDORA} hidden min-[1100px]:inline-flex`}
            >
              <IconoCuenta />
            </Link>

            <button
              type="button"
              data-testid="sn-cabecera-carrito"
              data-conteo={conteo}
              aria-label={`Abrir tu canasta (${conteo})`}
              title="Tu canasta"
              onClick={abrirCarrito}
              className={PILDORA}
            >
              <IconoCarrito />
              {conteo > 0 && (
                <span
                  data-testid="sn-carrito-conteo"
                  className={`ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-sn-pildora px-[5px] font-sn-mono text-[10px] font-medium leading-none text-sn-calido transition-transform duration-200 motion-reduce:transition-none ${
                    salto ? 'scale-[1.4] bg-sn-vivo' : 'scale-100 bg-sn-terra'
                  }`}
                >
                  {conteo}
                </span>
              )}
              <span
                aria-hidden="true"
                className={`absolute right-1 top-1 h-2 w-2 rounded-full border-[1.5px] border-sn-calido bg-sn-durazno transition-[opacity,transform] duration-300 motion-reduce:transition-none ${
                  conteo > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
              />
            </button>

            <Link
              href={ENLACE_QUIERO_CANASTA.href}
              data-testid="sn-cabecera-quiero-canasta"
              className="hidden whitespace-nowrap rounded-sn-pildora bg-sn-terra px-[10px] py-[5px] font-sn-mono text-[11px] font-medium uppercase leading-[11px] tracking-[1.2px] text-white transition-colors hover:bg-sn-tinta hover:text-white min-[1100px]:inline-block"
            >
              {ENLACE_QUIERO_CANASTA.texto}
            </Link>

            <button
              ref={botonMenuRef}
              type="button"
              data-testid="sn-menu-boton"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
              aria-controls={ID_MENU_CELULAR}
              onClick={() => setMenuAbierto((v) => !v)}
              className="flex flex-col items-center justify-center gap-[5px] p-2 min-[1100px]:hidden"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={`block h-[1.6px] w-[22px] bg-sn-tinta transition-all duration-200 motion-reduce:transition-none ${
                    menuAbierto && i === 0 ? 'translate-y-[6.6px] rotate-45' : ''
                  } ${menuAbierto && i === 1 ? 'opacity-0' : ''} ${menuAbierto && i === 2 ? '-translate-y-[6.6px] -rotate-45' : ''}`}
                />
              ))}
            </button>
          </div>
        </div>
      </header>

      <MenuCelular abierto={menuAbierto} onCerrar={cerrarMenu} botonRef={botonMenuRef} conteo={conteo} actual={actual} />
    </>
  )
}
