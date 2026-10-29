import type { Metadata } from 'next'
import Cabecera from '@/components/sitio-nuevo/armazon/Cabecera'
import Pie from '@/components/sitio-nuevo/armazon/Pie'
import Anuncio from '@/components/sitio-nuevo/armazon/Anuncio'
import { E } from '@/components/sitio-nuevo/armazon/estilos'
import { clasesFuentesSitioNuevo } from '@/components/sitio-nuevo/fuentes'

// R15 · F0 (sesión 53, 28-oct-2026) y F1 v2 (sesión 58, 29-oct): layout del sitio nuevo (R15-CONTRATO-V2 §7, §9 C20–C26).
//
// Las páginas de esta carpeta NO se ven en /nuevo (el middleware responde 404 a /nuevo directo): se ven en su dirección pública
// de siempre (`/`, …) y solo en el link de revisión (contenedor con ARCA_SITIO_NUEVO=1), con la reescritura de
// src/middleware.ts y la lista de src/lib/sitio-nuevo.ts. La cinta, la cabecera y el pie de hoy no se pintan aquí
// (SoloSitioActual en el layout raíz); el carrito lateral, los avisos y la burbuja de WhatsApp sí (son los de siempre).
//
// F1: el armazón (src/components/sitio-nuevo/armazon/): cabecera, cinta, pie con el boletín y el popup, con los originales del sitio
// de hoy y la marca donde no existe nada. Sin <main>: lo trae cada página.
//
// Regla para F1–F4: aquí dentro no se decide nada visible con usePathname() en el primer render (el servidor ve /nuevo y el
// navegador /); el enlace activo del menú sale de useSelectedLayoutSegments() o de un efecto.

export const metadata: Metadata = {
  // Fuera de Google mientras se construye (Traefik además manda X-Robots-Tag: noindex, nofollow en el link de revisión).
  robots: { index: false, follow: false },
}

export default function SitioNuevoLayout({ children }: { children: React.ReactNode }) {
  return (
    // Las letras del sitio nuevo (base, C14/C15): solo aquí; redefinen --font-body y --font-heading dentro del envoltorio.
    <div data-sitio-nuevo="" className={`${clasesFuentesSitioNuevo} ${E.raiz}`}>
      <a href="#sn-contenido" data-testid="sn-saltar" className={E.saltar}>
        Saltar al contenido
      </a>
      <Cabecera />
      <div id="sn-contenido" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </div>
      <Pie />
      <Anuncio />
    </div>
  )
}
