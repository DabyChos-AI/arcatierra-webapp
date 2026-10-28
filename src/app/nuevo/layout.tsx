import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { connection } from 'next/server'
import Cabecera from '@/components/sitio-nuevo/Cabecera'
import Pie from '@/components/sitio-nuevo/Pie'
import AnuncioEmergente from '@/components/sitio-nuevo/AnuncioEmergente'
import { leerContenidoSitio } from '@/lib/sitio-nuevo-contenido'
import './sitio-nuevo.css'

// R15 · F0 (sesión 53) + F1 (sesión 54, WF1), 28-oct-2026: layout del sitio nuevo (R15-CONTRATO §3, §9 C16).
//
// Las páginas de esta carpeta NO se ven en /nuevo (el middleware responde 404 a /nuevo directo): se ven en su dirección pública
// de siempre (`/`, …) y solo en el link de revisión (contenedor con ARCA_SITIO_NUEVO=1), con la reescritura de
// src/middleware.ts y la lista de src/lib/sitio-nuevo.ts. La cinta, la cabecera y el pie de hoy no se pintan aquí
// (SoloSitioActual en el layout raíz); el carrito lateral, los avisos y la burbuja de WhatsApp sí (son los de siempre).
//
// F1: la cabecera, la cinta, el pie y el anuncio emergente de la maqueta, y las letras libres (DR62): se cargan con
// next/font/local SOLO aquí, así que producción no las descarga. Cambiar a Cahuenga y Akkurat = cambiar los archivos de estas
// tres variables (src/fonts/sitio-nuevo/LEEME.md); las clases font-sn-titulos|texto|mono no cambian.
//
// Regla para F1–F4: aquí dentro no se decide nada visible con usePathname() en el primer render (el servidor ve /nuevo y el
// navegador /); el enlace activo del menú sale de useSelectedLayoutSegments() o de un efecto.
//
// F2 (sesión 55, P1): la cinta sale del layout y la pinta la portada en su lugar de la maqueta (2.º, debajo del hero): en la
// maqueta la cinta y la frase de arriba solo viven en la home (`data-page="home"`). Una sola cinta, ninguna página la duplica.

const titulos = localFont({
  src: [
    { path: '../../fonts/sitio-nuevo/DMSerifDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/sitio-nuevo/DMSerifDisplay-Italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--sn-fuente-titulos',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

const texto = localFont({
  src: [{ path: '../../fonts/sitio-nuevo/InterVariable.woff2', weight: '100 900', style: 'normal' }],
  variable: '--sn-fuente-texto',
  display: 'swap',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
})

const mono = localFont({
  src: [
    { path: '../../fonts/sitio-nuevo/DMMono-Light.woff2', weight: '300', style: 'normal' },
    { path: '../../fonts/sitio-nuevo/DMMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/sitio-nuevo/DMMono-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--sn-fuente-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
})

export const metadata: Metadata = {
  // Fuera de Google mientras se construye (Traefik además manda X-Robots-Tag: noindex, nofollow en el link de revisión).
  robots: { index: false, follow: false },
}

export default async function SitioNuevoLayout({ children }: { children: React.ReactNode }) {
  // Se arma en cada petición (no al compilar la imagen, donde no hay API); la lectura tiene su caché corta de Next.
  await connection()
  const { contenido, respondio } = await leerContenidoSitio()

  return (
    <div
      data-sitio-nuevo=""
      data-contenido={respondio ? 'api' : 'sin-respuesta'}
      className={`${titulos.variable} ${texto.variable} ${mono.variable} flex min-h-screen w-full flex-col bg-sn-calido font-sn-texto text-base leading-[1.55] tracking-[-0.3px] text-sn-tinta antialiased`}
    >
      <a
        href="#sn-contenido"
        className="sr-only z-[960] rounded-sn-boton bg-sn-tinta px-4 py-2 font-sn-mono text-xs uppercase tracking-[1.2px] text-white hover:text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <Cabecera />
      <div id="sn-contenido" className="flex-1">
        {children}
      </div>
      <Pie />
      <AnuncioEmergente anuncio={contenido.anuncio} />
    </div>
  )
}
