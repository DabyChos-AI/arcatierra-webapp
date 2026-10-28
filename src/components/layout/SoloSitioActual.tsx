'use client'

// R15 · F0 (sesión 53, 28-oct-2026): la cinta, la cabecera y el pie de hoy no se pintan en el sitio nuevo (R15-CONTRATO §3.3).
//
// En el link de revisión el middleware reescribe la dirección pública (`/`) a la página de src/app/nuevo/…, así que
// `usePathname()` no sirve para decidir (en el navegador ve `/`). Lo que decide es el segmento de la ruta: en el layout raíz,
// `useSelectedLayoutSegment()` es 'nuevo' en el servidor y en el navegador. En producción nunca es 'nuevo' (el middleware
// responde 404 a /nuevo directo): ahí este componente solo pinta a sus hijos, igual que antes.
//
// Los hijos pueden ser componentes de servidor (Footer): se renderizan en el servidor y aquí solo se decide si se muestran.
import { useSelectedLayoutSegment } from 'next/navigation'
import { SEGMENTO_SITIO_NUEVO } from '@/lib/sitio-nuevo'

export default function SoloSitioActual({ children }: { children: React.ReactNode }) {
  const segmento = useSelectedLayoutSegment()
  if (segmento === SEGMENTO_SITIO_NUEVO) return null
  return <>{children}</>
}
