'use client'

// R15 · F2 (WF3, sesión 55): «¿Llegamos a tu colonia?» (`#colonia-form` de la maqueta), con las zonas REALES.
// La misma llamada que hoy usan el alta de suscripción y el checkout: `GET ${API_URL}/api/zonas-entrega/{cp}` directo a la
// API (SubscriptionCheckoutForm.tsx:95, checkout/DireccionEntrega.tsx:88): 200 = hay zona (colonia, alcaldía y días de la
// base), 404 = sin cobertura. `/validar/{cp}` solo dice sí/no y no la usa ninguna página pública de hoy: no se usa.
// Los días salen de la zona; el horario es el texto de C7. Nada de «Próxima entrega: lunes» de la maqueta.
import { useRef, useState } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'
import { diasDeZona, esZonaTienda, HORARIO_ENTREGA, type ZonaTienda } from './tipos'

type Resultado =
  | { estado: 'vacio' }
  | { estado: 'revisando' }
  | { estado: 'invalido' }
  | { estado: 'si'; zona: ZonaTienda }
  | { estado: 'no'; cp: string }
  | { estado: 'error' }

export default function Colonia({ onZona }: { onZona: (zona: ZonaTienda | null) => void }) {
  const [cp, setCp] = useState('')
  const [resultado, setResultado] = useState<Resultado>({ estado: 'vacio' })
  const pedidoRef = useRef(0)

  const validar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{5}$/.test(cp)) {
      setResultado({ estado: 'invalido' })
      return
    }
    const pedido = ++pedidoRef.current
    setResultado({ estado: 'revisando' })
    try {
      const r = await fetch(`${API_URL}/api/zonas-entrega/${cp}`)
      if (pedido !== pedidoRef.current) return
      if (r.status === 404) {
        setResultado({ estado: 'no', cp })
        onZona(null)
        return
      }
      const zona: unknown = r.ok ? await r.json().catch(() => null) : null
      if (pedido !== pedidoRef.current) return
      if (esZonaTienda(zona)) {
        setResultado({ estado: 'si', zona })
        onZona(zona)
      } else {
        setResultado({ estado: 'error' })
      }
    } catch {
      if (pedido === pedidoRef.current) setResultado({ estado: 'error' })
    }
  }

  return (
    <section
      id="colonia"
      data-testid="sn-tienda-colonia"
      aria-labelledby="sn-tienda-colonia-titulo"
      className="scroll-mt-28 border-y border-sn-borde bg-sn-crema/60 px-6 py-sn-3"
    >
      <form
        onSubmit={validar}
        noValidate
        data-testid="sn-tienda-colonia-form"
        className="mx-auto flex w-full max-w-[720px] flex-col items-stretch gap-3 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-center"
      >
        <h2 id="sn-tienda-colonia-titulo" className="font-sn-titulos text-2xl leading-tight text-sn-tinta min-[640px]:mr-2">
          <label htmlFor="sn-tienda-colonia-cp">¿Llegamos a tu colonia?</label>
        </h2>
        <div className="flex min-w-0 items-center rounded-sn-pildora border border-sn-borde bg-white p-1">
          <input
            id="sn-tienda-colonia-cp"
            data-testid="sn-tienda-colonia-cp"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="Tu código postal"
            value={cp}
            onChange={(e) => setCp(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="min-w-0 flex-1 bg-transparent px-4 py-2 font-sn-mono text-sm text-sn-tinta outline-none placeholder:text-sn-gris"
          />
          <button
            type="submit"
            data-testid="sn-tienda-colonia-validar"
            className="shrink-0 rounded-sn-pildora bg-sn-terra px-4 py-2 font-sn-mono text-xs font-medium uppercase tracking-[1.2px] text-sn-calido transition-colors hover:bg-sn-tinta"
          >
            Revisar →
          </button>
        </div>
      </form>

      <div
        data-testid="sn-tienda-colonia-resultado"
        data-estado={resultado.estado}
        aria-live="polite"
        className="mx-auto mt-3 max-w-[720px] text-center text-sm leading-[1.6] text-sn-tinta"
      >
        {resultado.estado === 'revisando' && <p>Revisando tu código postal…</p>}
        {resultado.estado === 'invalido' && (
          <p role="alert" className="font-medium text-sn-terra">
            Escribe un código postal de 5 dígitos.
          </p>
        )}
        {resultado.estado === 'si' && (
          <p>
            <span className="font-medium text-sn-bosque">Sí llegamos</span> a {resultado.zona.colonia}, {resultado.zona.municipio}.{' '}
            {diasDeZona(resultado.zona) ? (
              <>
                Entregamos ahí los <span data-testid="sn-tienda-colonia-dias">{diasDeZona(resultado.zona)}</span>,{' '}
                {HORARIO_ENTREGA}.
              </>
            ) : (
              <>Entregamos {HORARIO_ENTREGA}.</>
            )}
          </p>
        )}
        {resultado.estado === 'no' && (
          <p>
            <span className="font-medium text-sn-terra">Aún no llegamos</span> al código postal {resultado.cp}.{' '}
            <Link href="/contacto" data-testid="sn-tienda-colonia-contacto" className="font-medium text-sn-terra underline">
              Escríbenos →
            </Link>
          </p>
        )}
        {resultado.estado === 'error' && (
          <p role="alert">No pudimos revisar tu código postal en este momento. Intenta de nuevo en un minuto.</p>
        )}
      </div>
    </section>
  )
}
