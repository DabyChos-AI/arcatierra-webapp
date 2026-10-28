import type { Metadata } from 'next'

// R15 · F0 (sesión 53, 28-oct-2026): layout del sitio nuevo (R15-CONTRATO §3).
//
// Las páginas de esta carpeta NO se ven en /nuevo (el middleware responde 404 a /nuevo directo): se ven en su dirección pública
// de siempre (`/`, …) y solo en el link de revisión (contenedor con ARCA_SITIO_NUEVO=1), con la reescritura de
// src/middleware.ts y la lista de src/lib/sitio-nuevo.ts. La cinta, la cabecera y el pie de hoy no se pintan aquí
// (SoloSitioActual en el layout raíz); la cabecera y el pie nuevos llegan en F1.
//
// Regla para F1–F4: aquí dentro no se decide nada visible con usePathname() en el primer render (el servidor ve /nuevo y el
// navegador /); el enlace activo del menú sale de useSelectedLayoutSegments() o de un efecto.

export const metadata: Metadata = {
  // Fuera de Google mientras se construye (Traefik además manda X-Robots-Tag: noindex, nofollow en el link de revisión).
  robots: { index: false, follow: false },
}

export default function SitioNuevoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-sitio-nuevo="" className="w-full">
      {children}
    </div>
  )
}
