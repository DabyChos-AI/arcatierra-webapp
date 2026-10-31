import type { Metadata } from 'next'
import ConfirmacionSuscripcion from '@/components/sitio-nuevo/tienda/ConfirmacionSuscripcion'

// R15 v2 · F3 (tienda, sesión 61): la confirmación de la suscripción del sitio nuevo en `/suscripciones/confirmacion` (D-F3-04). La de
// hoy (src/app/suscripciones/confirmacion/page.tsx) es estática y lee `?status=` en el navegador: igual aquí (D-F3-24 T-19), con el lector
// dentro de <Suspense> en el componente. Su título hoy es el del layout raíz (`title.default`, src/app/layout.tsx:52): el mismo, `absolute`.

export const metadata: Metadata = {
  title: { absolute: 'Arca Tierra | Agricultura regenerativa, chinampas y alimentos agroecológicos' },
}

export default function ConfirmacionNueva() {
  return <ConfirmacionSuscripcion />
}
