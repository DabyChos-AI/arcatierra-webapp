// R9-b (David, 3-oct ≈01:11 UTC; contrato R9 §4.4 punto 2): el QR viejo (QRV1) se retira. Esta página ya no llama a
// la API (`/api/qr/{id}/validate` responde 410) ni finge una validación: solo dice que el código ya no se usa y dónde
// están los nuevos (la página de la reserva del cliente, cuyo QR escanea el guía desde Mi día).
// Server Component sin params ni fetch: la misma respuesta para cualquier id.

import type { Metadata } from 'next'
import Link from 'next/link'
import { QrCode } from 'lucide-react'

// El layout raíz agrega « | ArcaTierra» (template `%s | ArcaTierra`).
export const metadata: Metadata = {
  title: 'Código QR retirado',
  robots: { index: false, follow: false },
}

export default function QrRetiradoPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-neutro-light px-4 pb-16 pt-28">
      <section
        data-testid="qr-retirado"
        className="w-full max-w-md rounded-xl border border-neutro-borde bg-white p-6 text-center shadow-soft sm:p-8"
      >
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-terracota/10">
          <QrCode className="h-7 w-7 text-terracota" aria-hidden="true" />
        </div>
        <h1 className="mb-3 font-display text-2xl leading-tight text-verde sm:text-3xl">Este código QR ya no se usa</h1>
        <p className="text-base text-verde-tipografia">
          Los códigos de reserva nuevos se muestran en la página de tu reserva. Si tienes dudas, escríbenos.
        </p>
        <Link
          href="/experiencias"
          data-testid="qr-retirado-liga"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-terracota px-5 text-base font-semibold text-white hover:bg-terracota-dark"
        >
          Ver experiencias
        </Link>
      </section>
    </div>
  )
}
