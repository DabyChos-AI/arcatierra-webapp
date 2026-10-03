'use client'

import { CreditCard, ExternalLink } from 'lucide-react'
import type { PortalPago } from '@/types/portal'
import { dinero, textoVence } from './textos'

// R9-c (David, 3-oct): total, pagado y saldo; «Pagar saldo» SOLO con el link de MercadoPago VIGENTE que manda la API
// (pendiente y no vencido). El portal nunca genera un link. Sin montos en reservas de reseller ni del Sheet: ahí la API
// manda `pago: null` y esta sección no se pinta.

export default function PagoReserva({ pago }: { pago: PortalPago }) {
  const moneda = pago.moneda || 'MXN'
  const saldo = Number(pago.saldo)
  const link = pago.link_pago
  const vence = link ? textoVence(link.vence_en) : ''

  return (
    <section
      data-testid="portal-pago"
      data-estado-pago={pago.estado_pago}
      aria-labelledby="portal-pago-titulo"
      className="rounded-2xl border border-neutro-borde bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 id="portal-pago-titulo" className="mb-3 flex items-center gap-2 font-heading text-xl text-verde">
        <CreditCard className="h-5 w-5 text-terracota" aria-hidden="true" />
        Pago
      </h2>

      <dl className="mb-0 space-y-2 text-base text-verde-tipografia">
        <div className="flex items-baseline justify-between gap-3">
          <dt>Total</dt>
          <dd data-testid="portal-pago-total" className="mb-0 font-semibold tabular-nums">
            {dinero(pago.total, moneda)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt>Pagado</dt>
          <dd data-testid="portal-pago-pagado" className="mb-0 font-semibold tabular-nums">
            {dinero(pago.pagado, moneda)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-neutro-borde pt-2">
          <dt className="font-semibold">Saldo</dt>
          <dd
            data-testid="portal-pago-saldo"
            className={`mb-0 text-lg font-bold tabular-nums ${Number.isFinite(saldo) && saldo > 0 ? 'text-terracota' : 'text-verde'}`}
          >
            {dinero(pago.saldo, moneda)}
          </dd>
        </div>
        {pago.estado_pago_texto && (
          <div className="flex items-baseline justify-between gap-3">
            <dt>Estado del pago</dt>
            <dd data-testid="portal-pago-estado" className="mb-0 text-right font-medium">
              {pago.estado_pago_texto}
            </dd>
          </div>
        )}
      </dl>

      {link && link.url && (
        <div className="mt-4">
          <a
            data-testid="portal-pagar-saldo"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-terracota px-5 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-terracota-oscuro hover:text-white"
          >
            Pagar saldo
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <p data-testid="portal-pago-link" className="mb-0 mt-2 text-center text-sm text-verde-suave">
            Monto del link: {dinero(link.monto, moneda)}
            {vence && (
              <>
                {' · '}
                <span data-testid="portal-pago-vence">{vence}</span>
              </>
            )}
          </p>
        </div>
      )}
    </section>
  )
}
