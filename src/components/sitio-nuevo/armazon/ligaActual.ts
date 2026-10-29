'use client'

// R15 v2 · F1: qué liga del armazón es la de la página que se ve (aria-current). Contrato v1 §3.3: nada visible sale de usePathname()
// (el servidor ve /nuevo y el navegador /): se toma la ruta interna de useSelectedLayoutSegments(), igual en los dos, y se busca en
// RUTAS_SITIO_NUEVO al revés. En F1 la única página nueva es la portada, que no tiene liga: ninguna sale marcada.
import { useSelectedLayoutSegments } from 'next/navigation'
import { RUTAS_SITIO_NUEVO, SEGMENTO_SITIO_NUEVO } from '@/lib/sitio-nuevo'

/** La dirección pública de la página nueva que se ve, o null. Los grupos `(…)` no forman parte de la dirección. */
export function useDireccionPublica(): string | null {
  const partes = useSelectedLayoutSegments().filter((s) => !s.startsWith('('))
  const interna = ['', SEGMENTO_SITIO_NUEVO, ...partes].join('/')
  for (const [publica, ruta] of Object.entries(RUTAS_SITIO_NUEVO)) {
    if (ruta === interna) return publica
  }
  return null
}

/** La liga lleva a esa dirección o a una página debajo de ella. Una liga con `?` solo casa entera; la portada no marca ninguna. */
export function esLigaActual(href: string, publica: string | null): boolean {
  if (publica === null || publica === '/') return false
  if (href === publica) return true
  return !href.includes('?') && publica.startsWith(`${href}/`)
}
