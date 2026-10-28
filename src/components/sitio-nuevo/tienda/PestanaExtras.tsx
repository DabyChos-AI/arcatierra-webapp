'use client'

// R15 · F2 (WF3, sesión 55, C8/C12): «Agrega extras a tu canasta», sobre lo que ya existe (SU1/SU2). La MISMA llamada que el
// checkout de hoy: `GET ${API_URL}/api/subscriptions/extras-disponibles` con `Authorization: Bearer <accessToken>`
// (src/app/checkout/page.tsx:88). Pide sesión: sin sesión se explica cómo entrar (nunca una lista inventada).
// El mecanismo no cambia: los extras se agregan al carrito de siempre y en el checkout se elige «Entregar con mi canasta»
// (ConMiCanasta); el backend decide envío, plazo y cobro (services/extras_suscripcion.py).
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'

type Estado = { fase: 'cargando' } | { fase: 'listo'; entregas: CanastaExtras[] } | { fase: 'error' }

const LARGO: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: undefined }
const ENTRAR = `/auth/signin?callbackUrl=${encodeURIComponent('/tienda?pestana=extras')}`
const BOTON =
  'inline-block rounded-sn-boton bg-sn-terra px-5 py-3 font-sn-mono text-xs font-medium uppercase tracking-[1.2px] text-sn-calido transition-colors hover:bg-sn-tinta hover:text-sn-calido'
const BOTON_CLARO =
  'inline-block rounded-sn-boton border border-sn-tinta px-5 py-3 font-sn-mono text-xs font-medium uppercase tracking-[1.2px] text-sn-tinta transition-colors hover:bg-sn-tinta hover:text-sn-calido'

export default function PestanaExtras({ onIr }: { onIr: (pestana: 'suelto' | 'canasta') => void }) {
  const { data: session, status } = useSession()
  const accessToken = session?.accessToken
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!accessToken) return
    let vigente = true
    setEstado({ fase: 'cargando' })
    fetch(`${API_URL}/api/subscriptions/extras-disponibles`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status))
        const d = await r.json()
        if (vigente) setEstado({ fase: 'listo', entregas: Array.isArray(d?.entregas) ? d.entregas : [] })
      })
      .catch(() => {
        if (vigente) setEstado({ fase: 'error' })
      })
    return () => {
      vigente = false
    }
  }, [accessToken, intento])

  const fase = status === 'loading' ? 'cargando' : !accessToken ? 'sin-sesion' : estado.fase
  const entregas = estado.fase === 'listo' ? estado.entregas : []
  const abiertas = entregas.filter((c) => c.abierta)
  const cerradas = entregas.filter((c) => !c.abierta)

  return (
    <div data-testid="sn-tienda-extras" data-estado={fase === 'listo' ? (entregas.length ? 'con-canasta' : 'sin-canasta') : fase}>
      <h2 className="font-sn-titulos text-[36px] leading-none tracking-[-1px] min-[861px]:text-[48px]">Agrega extras a tu canasta.</h2>
      <p className="mt-3 max-w-[640px] text-sm leading-[1.6] text-sn-tinta/80">
        Si tienes una suscripción, puedes sumar productos sueltos a tu próxima canasta: los agregas a tu carrito y, al pagar,
        eliges «Entregar con mi canasta». Llegan el mismo día, con envío gratis.
      </p>

      <div className="mt-8 max-w-[720px]">
        {fase === 'cargando' && (
          <p role="status" className="text-sm text-sn-tinta/80">
            Revisando tu suscripción…
          </p>
        )}

        {fase === 'sin-sesion' && (
          <div data-testid="sn-tienda-extras-sin-sesion" className="rounded-sn-tarjeta border border-sn-borde bg-white p-6">
            <p className="text-sm leading-[1.6]">Entra con tu cuenta para ver tu próxima canasta y hasta cuándo puedes sumarle extras.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={ENTRAR} data-testid="sn-tienda-extras-entrar" className={BOTON}>
                Entrar a mi cuenta
              </Link>
              <button type="button" onClick={() => onIr('canasta')} className={BOTON_CLARO}>
                Aún no tengo canasta
              </button>
            </div>
          </div>
        )}

        {fase === 'error' && (
          <p role="alert" data-testid="sn-tienda-extras-error" className="text-sm">
            No pudimos consultar tu próxima canasta. Intenta de nuevo.{' '}
            <button type="button" onClick={() => setIntento((n) => n + 1)} className="font-medium text-sn-terra underline">
              Reintentar
            </button>
          </p>
        )}

        {fase === 'listo' && entregas.length === 0 && (
          <div data-testid="sn-tienda-extras-sin-canasta" className="rounded-sn-tarjeta border border-sn-borde bg-white p-6">
            <p className="text-sm leading-[1.6]">No tienes una canasta programada para sumarle extras.</p>
            <div className="mt-4">
              <button type="button" onClick={() => onIr('canasta')} className={BOTON}>
                Elegir mi canasta →
              </button>
            </div>
          </div>
        )}

        {fase === 'listo' && entregas.length > 0 && (
          <div className="space-y-3">
            {abiertas.map((c) => (
              <div key={c.entrega_id} data-testid="sn-tienda-extras-canasta" data-abierta="1" className="rounded-sn-tarjeta border border-sn-bosque/40 bg-white p-5">
                <p className="font-medium">
                  {c.nombre_suscripcion}: llega el {formatFechaMexico(c.fecha_entrega, LARGO)}
                </p>
                <p className="mt-1 text-sm text-sn-tinta/80">
                  Puedes agregar extras hasta el {formatFechaMexico(c.ultimo_dia_para_pagar, LARGO)} · envío gratis · se pagan al
                  hacer el pedido.
                </p>
              </div>
            ))}
            {cerradas.map((c) => (
              <div key={c.entrega_id} data-testid="sn-tienda-extras-canasta" data-abierta="0" className="rounded-sn-tarjeta border border-sn-borde bg-white p-5">
                <p className="font-medium">
                  {c.nombre_suscripcion}: llega el {formatFechaMexico(c.fecha_entrega, LARGO)}
                </p>
                <p className="mt-1 text-sm text-sn-tinta/80">
                  Ya no se le pueden sumar extras (se podía hasta el {formatFechaMexico(c.ultimo_dia_para_pagar, LARGO)}).
                </p>
              </div>
            ))}
            {abiertas.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-3">
                <button type="button" data-testid="sn-tienda-extras-elegir" onClick={() => onIr('suelto')} className={BOTON}>
                  Elegir productos →
                </button>
                <Link href="/checkout" data-testid="sn-tienda-extras-pagar" className={BOTON_CLARO}>
                  Ir a pagar
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
