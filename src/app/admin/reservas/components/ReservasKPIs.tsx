'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertCircle, Calendar, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatMXN, type ReservaStats } from '@/types/reservas'

interface ReservasKPIsProps {
  refreshKey: number
}

type CardAccent = 'amarillo' | 'verde' | 'terracota' | 'azul'

interface KPICardProps {
  label: string
  value: string | number
  sub?: React.ReactNode
  icon: React.ReactNode
  accent: CardAccent
  loading: boolean
  error: boolean
}

const ACCENT_BORDER: Record<CardAccent, string> = {
  amarillo: 'border-l-amarillo',
  verde: 'border-l-verde',
  terracota: 'border-l-terracota',
  azul: 'border-l-azul',
}

const ACCENT_ICON_WRAP: Record<CardAccent, string> = {
  amarillo: 'bg-amarillo-bg text-amarillo',
  verde: 'bg-verde/10 text-verde',
  terracota: 'bg-terracota/10 text-terracota',
  azul: 'bg-azul-bg text-azul',
}

function KPICard({ label, value, sub, icon, accent, loading, error }: KPICardProps) {
  return (
    <div
      className={`bg-white border border-neutro-borde rounded-lg p-4 shadow-soft border-l-4 ${ACCENT_BORDER[accent]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${ACCENT_ICON_WRAP[accent]}`} aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-verde-suave">{label}</p>
          {loading ? (
            <>
              <div className="mt-1 h-7 w-20 bg-neutro-light rounded animate-pulse" />
              <div className="mt-2 h-3 w-32 bg-neutro-light rounded animate-pulse" />
            </>
          ) : error ? (
            <p className="mt-1 text-sm text-verde-suave">Error al cargar</p>
          ) : (
            <>
              <p className="mt-1 text-2xl font-display font-semibold text-verde tabular-nums">
                {value}
              </p>
              {sub && <div className="mt-1 text-xs text-verde-suave">{sub}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReservasKPIs({ refreshKey }: ReservasKPIsProps) {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<ReservaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchStats = useCallback(async () => {
    const token = session?.accessToken as string | undefined
    if (!token) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: ReservaStats = await res.json()
      setStats(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setError(true)
    }
  }, [status, refreshKey, fetchStats])

  const delta = stats?.delta_pct_confirmadas ?? 0
  const deltaText = `${delta > 0 ? '+' : ''}${delta.toFixed(1)}% vs mes anterior`
  const deltaClass = delta > 0 ? 'text-verde' : delta < 0 ? 'text-rojo' : 'text-verde-suave'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Tentativas pendientes"
        value={stats?.tentativas ?? 0}
        sub={stats ? `${formatMXN(stats.tentativas_monto_anticipos)} anticipos esperados` : null}
        icon={<Clock className="h-5 w-5" />}
        accent="amarillo"
        loading={loading}
        error={error}
      />
      <KPICard
        label="Confirmadas mes"
        value={stats?.confirmadas_mes ?? 0}
        sub={stats ? <span className={deltaClass}>{deltaText}</span> : null}
        icon={<CheckCircle2 className="h-5 w-5" />}
        accent="verde"
        loading={loading}
        error={error}
      />
      <KPICard
        label="Ingresos del mes"
        value={stats ? formatMXN(stats.ingresos_mes) : formatMXN(0)}
        sub="MXN totales este mes"
        icon={<DollarSign className="h-5 w-5" />}
        accent="terracota"
        loading={loading}
        error={error}
      />
      <KPICard
        label="Manifest manana"
        value={`${stats?.manifest_manana_eventos ?? 0} eventos`}
        sub={stats ? `${stats.manifest_manana_invitados} invitados` : null}
        icon={
          stats && stats.manifest_manana_eventos === 0 ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <Calendar className="h-5 w-5" />
          )
        }
        accent="azul"
        loading={loading}
        error={error}
      />
    </div>
  )
}
