'use client'

// R15 v2 · F8 (pulido; contrato v2 D-F8-16, D-F8-20, D-F8-23 · P-9, «propuesta nueva»: NO está en la maqueta): los bloques del mapa entran
// con el `fadeUp` de la maqueta (16 px hacia arriba y un fundido, .6 s) cuando están por asomar por el borde de abajo de la pantalla.
// No pinta nada. Un solo punto de montaje, src/app/nuevo/layout.tsx: quitar esa línea y su import quita la pieza entera.
// Las reglas (D-F8-20):
// - No hay estado «en espera»: fuera de una animación en curso ningún bloque cambia de opacidad ni de lugar, y el HTML del servidor es el
//   mismo. Lo que entra arranca casi transparente, nunca transparente del todo (movimiento.ts): cuenta como contenido a la vista siempre.
// - Arranca cuando el bloque está a menos de MARGEN px por debajo de la pantalla (todavía no se ve) y termina en DURA ms a lo más, una sola
//   vez por bloque y por carga. Al terminar, el bloque queda con su estilo de siempre: nada persiste (lo único que se sostiene es el
//   primer cuadro de quien espera su turno en una cascada, unas décimas de segundo, dentro de su propia animación).
// - Sin destello: el bloque que al avisar el observador YA se ve (un salto de página, un ancla, la tecla Fin, una carga con la página
//   abajo) no se anima; se mide en ese instante, no con la medida guardada del observador. Quien baja muy rápido no ve entradas.
// - Nunca lo que al llegar ya estaba en la primera pantalla, a un paso de ella o más arriba. Solo en las páginas del mapa.
// - «Una vez por bloque y por carga» vale para el bloque, no para su nodo: lo que ya tuvo su turno (entró, o ya se veía) queda anotado por
//   su lugar en el mapa mientras dure la carga. Si React lo vuelve a montar o lo reemplaza (una lista que llega tarde y se vuelve a pintar),
//   o si se regresa a la página sin recargar, no vuelve a entrar.
// - Con «reducir movimiento», sin JavaScript o sin IntersectionObserver no pasa nada.
import { useEffect } from 'react'
import { useSelectedLayoutSegments } from 'next/navigation'
import { OPACIDAD_DE_ENTRADA, hayMovimiento } from '@/components/sitio-nuevo/movimiento'
import { MAPA_ENTRADAS } from './mapaEntradas'

/** A cuántos px por debajo de la pantalla arranca: chico, para que la entrada se vea al asomar; más grande, nadie la vería. */
const MARGEN = 48
/** El `fadeUp` de la maqueta (`.hero-eyebrow`, `.hero-title`): 16 px, .5–.6 s, `ease`. */
const SUBE = 16
const DURA = 600
/** Entre un bloque y el siguiente de una cascada; el grupo entero termina en DURA. */
const PASO = 70
const CUADROS: Keyframe[] = [
  { opacity: OPACIDAD_DE_ENTRADA, transform: `translateY(${SUBE}px)` },
  { opacity: 1, transform: 'none' },
]
/** Los bloques que ya tuvieron su turno en esta carga, por página, renglón del mapa y lugar entre los que casan. Vive lo que vive el documento. */
const decididos = new Set<string>()

export default function Entradas() {
  // La dirección interna, igual en el servidor y en el navegador (como armazon/ligaActual.ts); los grupos `(…)` no cuentan.
  const clave = useSelectedLayoutSegments()
    .filter((segmento) => !segmento.startsWith('('))
    .join('/')

  useEffect(() => {
    const bloques = MAPA_ENTRADAS[clave]
    const raiz = document.getElementById('sn-contenido')
    if (!bloques || !raiz || !hayMovimiento() || typeof IntersectionObserver !== 'function') return

    const conocidos = new WeakSet<Element>()
    const llaveDe = new WeakMap<Element, string>()

    const vigia = new IntersectionObserver(
      (vistas) => {
        const alto = window.innerHeight
        // Los que llegan en este aviso y todavía no se ven, juntados por padre: los hermanos entran uno tras otro.
        const porPadre = new Map<Element | null, Element[]>()
        for (const { target, isIntersecting } of vistas) {
          if (!isIntersecting) continue
          // Una vez por bloque y por carga, entre o no.
          vigia.unobserve(target)
          const llave = llaveDe.get(target)
          if (llave) decididos.add(llave)
          // Medido AHORA: si ya asoma (se pintó tal cual al menos un cuadro), se queda como está.
          if (target.getBoundingClientRect().top < alto) continue
          const hermanos = porPadre.get(target.parentElement)
          if (hermanos) hermanos.push(target)
          else porPadre.set(target.parentElement, [target])
        }
        if (porPadre.size === 0 || !hayMovimiento()) return
        porPadre.forEach((grupo) => {
          const paso = grupo.length > 1 ? Math.min(PASO, (DURA - 400) / (grupo.length - 1)) : 0
          const duration = DURA - paso * (grupo.length - 1)
          grupo.forEach((el, i) => {
            if (typeof el.animate !== 'function') return
            // Quien espera su turno sostiene su primer cuadro solo durante la espera; al terminar no queda nada puesto.
            el.animate(CUADROS, { duration, delay: paso * i, easing: 'ease', fill: i > 0 ? 'backwards' : 'none' })
          })
        })
      },
      { rootMargin: `0px 0px ${MARGEN}px 0px` },
    )

    /** Vigila lo que casa con el mapa y todavía no se conoce (también lo que llega después: las tarjetas que pide el navegador). */
    const registrar = () => {
      const limite = window.innerHeight + MARGEN
      bloques.forEach((selector, renglon) => {
        raiz.querySelectorAll(selector).forEach((el, lugar) => {
          if (conocidos.has(el)) return
          conocidos.add(el)
          const llave = `${clave}|${renglon}|${lugar}`
          // Ya tuvo su turno en esta carga (aunque este nodo sea nuevo): no se vigila.
          if (decididos.has(llave)) return
          // En la primera pantalla, a un paso de ella o más arriba al llegar: tampoco; se queda como está para siempre.
          if (el.getBoundingClientRect().top < limite) {
            decididos.add(llave)
            return
          }
          llaveDe.set(el, llave)
          vigia.observe(el)
        })
      })
    }

    let cuadro = 0
    const cambios = new MutationObserver(() => {
      if (cuadro !== 0) return
      cuadro = window.requestAnimationFrame(() => {
        cuadro = 0
        registrar()
      })
    })
    registrar()
    cambios.observe(raiz, { childList: true, subtree: true })

    return () => {
      window.cancelAnimationFrame(cuadro)
      cambios.disconnect()
      vigia.disconnect()
    }
  }, [clave])

  return null
}
