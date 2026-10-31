import { Suspense } from 'react'
import ResultadoPago from '@/components/sitio-nuevo/carrito/ResultadoPago'

// R15 · F3 v2 (carrito, sesión 61): `/checkout/failure` del sitio nuevo (D-F3-04). Lee los parámetros de MercadoPago con `useSearchParams`
// dentro de `<Suspense>`, como la página de hoy (`src/app/checkout/failure/page.tsx`).
export default function Page() {
  return (
    <Suspense fallback={<main data-testid="sn-checkout-fallo" className="min-h-[60vh] bg-sn-warm" />}>
      <ResultadoPago tipo="fallo" />
    </Suspense>
  )
}
