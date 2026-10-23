'use client'

// Bandeja «Mensajes» del panel (WF11, R11b, DR71; permiso `mensajes`). Contrato: R11B-CONTRATO.md §4.3 y §4.6.
// - «Contacto»: los mensajes de /contacto (detalle, «Responder por correo» y cambio de estado a mano).
// - «Newsletter»: los correos suscritos desde los pies, con su consentimiento; dar de baja / reactivar y exportar CSV.
// Nada de esto manda correos. La campana abre `?mensaje_id=<id>` (contacto) o `?tab=newsletter`: los lee
// `LectorParametros`, el ÚNICO que llama `useSearchParams()`, dentro de <Suspense> (como Pedidos y Mi día), y limpia la URL.

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Inbox, Mail, MessageSquare } from 'lucide-react'
import AdminTopbar from '../components/AdminTopbar'
import TabContacto from './components/TabContacto'
import TabNewsletter from './components/TabNewsletter'

type Pestana = 'contacto' | 'newsletter'

const PESTANAS: { key: Pestana; etiqueta: string; Icono: typeof Mail }[] = [
  { key: 'contacto', etiqueta: 'Contacto', Icono: MessageSquare },
  { key: 'newsletter', etiqueta: 'Newsletter', Icono: Mail },
]

function LectorParametros({ onLeer }: { onLeer: (tab: Pestana | null, mensajeId: string | null) => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab')
  const mensajeId = (searchParams.get('mensaje_id') ?? '').trim()
  useEffect(() => {
    if (!tab && !mensajeId) return
    onLeer(tab === 'newsletter' ? 'newsletter' : tab === 'contacto' ? 'contacto' : null, mensajeId || null)
    router.replace('/admin/mensajes', { scroll: false })
  }, [tab, mensajeId, onLeer, router])
  return null
}

export default function MensajesPage() {
  const { data: session, status } = useSession()
  const token = session?.accessToken
  const [pestana, setPestana] = useState<Pestana>('contacto')
  const [mensajeInicial, setMensajeInicial] = useState<string | null>(null)

  const leerParametros = useCallback((tab: Pestana | null, mensajeId: string | null) => {
    if (mensajeId) {
      setPestana('contacto')
      setMensajeInicial(mensajeId)
    } else if (tab) {
      setPestana(tab)
    }
  }, [])

  const mensajeInicialUsado = useCallback(() => setMensajeInicial(null), [])

  return (
    <div className="flex h-full flex-col">
      <AdminTopbar />
      <div className="flex-1 space-y-6 overflow-auto p-4 sm:p-6">
        <header className="flex items-start gap-3">
          <div className="rounded-lg bg-terracota/10 p-2">
            <Inbox className="h-6 w-6 text-terracota" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="mb-0 font-display text-3xl text-verde">Mensajes</h1>
            <p className="text-sm text-verde-suave">
              Lo que llega del formulario de contacto y los correos del newsletter. Desde aquí no se manda ningún correo.
            </p>
          </div>
        </header>

        <div role="tablist" aria-label="Bandeja" className="flex gap-1 overflow-x-auto border-b border-neutro-borde">
          {PESTANAS.map(({ key, etiqueta, Icono }) => {
            const activa = key === pestana
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activa}
                data-testid={`mensajes-tab-${key}`}
                onClick={() => setPestana(key)}
                className={`-mb-px flex min-h-[44px] items-center gap-2 whitespace-nowrap border-b-2 px-4 text-sm transition-colors ${
                  activa
                    ? 'border-terracota font-semibold text-terracota'
                    : 'border-transparent text-verde-suave hover:text-verde'
                }`}
              >
                <Icono className="h-4 w-4" aria-hidden="true" />
                {etiqueta}
              </button>
            )
          })}
        </div>

        {!token ? (
          <p className="text-sm text-verde-suave" aria-busy={status === 'loading'}>
            {status === 'loading' ? 'Cargando…' : 'Tu sesión expiró. Vuelve a iniciar sesión.'}
          </p>
        ) : pestana === 'contacto' ? (
          <TabContacto token={token} mensajeInicial={mensajeInicial} onMensajeInicialUsado={mensajeInicialUsado} />
        ) : (
          <TabNewsletter token={token} />
        )}
      </div>
      <Suspense fallback={null}>
        <LectorParametros onLeer={leerParametros} />
      </Suspense>
    </div>
  )
}
