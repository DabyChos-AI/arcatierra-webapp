'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Plus, FileText, Calendar as CalendarIcon, Table as TableIcon, Phone } from 'lucide-react'
import AdminTopbar from '../components/AdminTopbar'
import ReservasKPIs from './components/ReservasKPIs'

type TabActiva = 'tabla' | 'calendario' | 'manifest'

const ReservasTabla = dynamic(() => import('./components/ReservasTabla'), {
  loading: () => <SkeletonBlock label="Cargando tabla..." />,
})

const ReservasCalendario = dynamic(() => import('./components/ReservasCalendario'), {
  loading: () => <SkeletonBlock label="Cargando calendario..." />,
  ssr: false,
})

const ManifestDelDia = dynamic(() => import('./components/ManifestDelDia'), {
  loading: () => <SkeletonBlock label="Cargando manifest..." />,
})

const ModalNuevaReserva = dynamic(() => import('./components/ModalNuevaReserva'), {
  ssr: false,
})

const ModalDetalleReserva = dynamic(() => import('./components/ModalDetalleReserva'), {
  ssr: false,
})

function SkeletonBlock({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center h-64 bg-neutro-light rounded-lg border border-neutro-borde animate-pulse"
      aria-busy="true"
      aria-label={label}
    >
      <span className="text-sm text-verde-suave">{label}</span>
    </div>
  )
}

function ReservasPageInner() {
  const [tab, setTab] = useState<TabActiva>('tabla')
  const [showNueva, setShowNueva] = useState(false)
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // C33: apertura directa del modal de detalle vía ?reserva_id=<uuid>
  // (deep-link desde el dashboard ejecutivo → Próximos eventos).
  const searchParams = useSearchParams()
  useEffect(() => {
    const rid = searchParams.get('reserva_id')
    if (rid) setDetalleId(rid)
  }, [searchParams])

  const handleCreated = useCallback((id: string, bookingId: string) => {
    setShowNueva(false)
    setRefreshKey((k) => k + 1)
    setDetalleId(id)
  }, [])

  const handleClose = useCallback(() => setShowNueva(false), [])

  const handleCloseDetalle = useCallback(() => setDetalleId(null), [])

  const handleDetalleUpdated = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        {/* Header con titulo + boton + Nueva Reserva */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-verde">Reservas Privadas</h1>
            <p className="text-sm text-verde-suave mt-1">
              Gestion completa de reservas de experiencias privadas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNueva(true)}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg shadow-terracota transition-colors font-medium"
            aria-label="Crear nueva reserva"
          >
            <Plus className="h-4 w-4" />
            Nueva Reserva
          </button>
        </header>

        <ReservasKPIs refreshKey={refreshKey} />

        {/* Tabs */}
        <div className="border-b border-neutro-borde">
          <nav className="flex gap-2" role="tablist" aria-label="Vistas de reservas">
            <TabButton
              active={tab === 'tabla'}
              onClick={() => setTab('tabla')}
              icon={<TableIcon className="h-4 w-4" />}
              label="Tabla"
            />
            <TabButton
              active={tab === 'calendario'}
              onClick={() => setTab('calendario')}
              icon={<CalendarIcon className="h-4 w-4" />}
              label="Calendario"
            />
            <TabButton
              active={tab === 'manifest'}
              onClick={() => setTab('manifest')}
              icon={<FileText className="h-4 w-4" />}
              label="Manifest del dia"
            />
          </nav>
        </div>

        {/* Tab content */}
        <div role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === 'tabla' && (
            <ReservasTabla
              refreshKey={refreshKey}
              onRowClick={(id) => setDetalleId(id)}
            />
          )}
          {tab === 'calendario' && (
            <ReservasCalendario
              refreshKey={refreshKey}
              onEventClick={(id) => setDetalleId(id)}
              onSlotClick={() => setShowNueva(true)}
            />
          )}
          {tab === 'manifest' && (
            <ManifestDelDia
              refreshKey={refreshKey}
              onRowClick={(id) => setDetalleId(id)}
            />
          )}
        </div>
      </div>

      {showNueva && (
        <ModalNuevaReserva onClose={handleClose} onCreated={handleCreated} />
      )}
      {detalleId && (
        <ModalDetalleReserva
          reservaId={detalleId}
          onClose={handleCloseDetalle}
          onUpdated={handleDetalleUpdated}
        />
      )}
    </div>
  )
}

// useSearchParams() en Next.js 15 exige un boundary <Suspense> o el build falla.
export default function ReservasPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <ReservasPageInner />
    </Suspense>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active
          ? 'border-terracota text-terracota'
          : 'border-transparent text-verde-suave hover:text-verde'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
