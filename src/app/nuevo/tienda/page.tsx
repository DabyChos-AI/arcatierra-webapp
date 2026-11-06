import type { Metadata } from 'next'
import Tienda from '@/components/sitio-nuevo/tienda/Tienda'
import { METADATA_TIENDA } from '@/components/sitio-nuevo/google/metadatos'

// R15 v2 · F3 (tienda, sesión 61): la tienda del sitio nuevo en la dirección `/tienda` (la reescritura y el matcher son de ficha, D-F3-04).
// D-F3-24 T-19: página ESTÁTICA como la de hoy (src/app/tienda/page.tsx:1894-1908). La pestaña (`?pestana=`) y la categoría (`?categoria=`)
// las lee el navegador dentro de <Suspense> (patrón de R9, frontend-v11 L1063-1065); el HTML del servidor no trae datos de la API.
// Título: el de hoy de `/tienda` (src/app/tienda/layout.tsx:7 con la plantilla del layout raíz, src/app/layout.tsx:53), como `absolute`.

export const metadata: Metadata = METADATA_TIENDA

export default function TiendaNueva() {
  return <Tienda />
}
