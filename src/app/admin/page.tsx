'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  TrendingUp,
  Clock,
  Users,
  Inbox,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico, formatFechaHoraMexico, mesMexico } from '@/lib/dates'
import { aviso } from '@/components/ui/Avisos'
import { primeraRutaPermitida } from './components/AdminSidebar'
import { useMisRoles } from './components/MisRolesContext'

import LiveClock from './components/dashboard/LiveClock'
import KpiCard from './components/dashboard/KpiCard'
import ChartIngresos, {
  type IngresoMes,
} from './components/dashboard/ChartIngresos'
import ChartReservasPorExperiencia, {
  type ReservaPorExperiencia,
} from './components/dashboard/ChartReservasPorExperiencia'
import TopVendedorasList, {
  type Vendedora,
} from './components/dashboard/TopVendedorasList'
import ProximosEventosList, {
  type EventoProximo,
} from './components/dashboard/ProximosEventosList'
import Heatmap, {
  type HeatmapDia,
} from './components/dashboard/Heatmap'

// ─── Types (contrato de endpoints /api/admin/dashboard/*) ─────────────

interface Kpis {
  reservas_activas: { value: number; trend_pct: number }
  ingresos_mes: { value: number; proyeccion: number; trend_pct: number }
  anticipos_pendientes: { monto: number; reservas_count: number }
  manifest_manana: { reservas_count: number; invitados_count: number }
  leads_sin_procesar: { value: number; nuevos_hoy: number }
  tasa_conversion: { value_pct: number; trend_pct: number }
  generated_at: string
}

interface VendedoraApi {
  vendedor_id: string
  nombre: string
  reservas_count: number
  ingresos: number
}

interface HeatmapResp {
  mes: string
  dias_en_mes: number
  dias: HeatmapDia[]
}

// ─── Helpers ──────────────────────────────────────────────────────────

/** $312K / $95K / $0 — formato compacto en miles para dinero. */
function fmtK(n: number): string {
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n)}`
}

function saludoPorHora(d: Date): string {
  const h = parseInt(
    new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      hour12: false,
    }).format(d),
    10,
  )
  if (h >= 5 && h < 12) return 'Buenos días'
  if (h >= 12 && h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function capitalizar(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// B4 (R8): nombre de cada una de las 6 llamadas, para decir cuál falló (en el orden del Promise.allSettled).
const PARTES_DASHBOARD = [
  'indicadores',
  'ingresos por mes',
  'reservas por experiencia',
  'top vendedoras',
  'próximos eventos',
  'densidad del mes',
] as const

// B4 (R8): a dónde lleva cada KPI y qué permiso pide esa pantalla (sin el permiso, la tarjeta no es liga).
const DESTINO_KPI: Record<string, { href: string; permiso: string; pantalla: string }> = {
  reservas: { href: '/admin/reservas', permiso: 'reservas', pantalla: 'Ver reservas' },
  ingresos: { href: '/admin/reportes', permiso: 'reportes', pantalla: 'Ver reportes' },
  anticipos: { href: '/admin/reservas', permiso: 'reservas', pantalla: 'Ver reservas' },
  manifest: { href: '/admin/reservas', permiso: 'reservas', pantalla: 'Ver reservas y el manifest' },
  leads: { href: '/admin/leads', permiso: 'leads', pantalla: 'Ver leads' },
  conversion: { href: '/admin/leads', permiso: 'leads', pantalla: 'Ver leads' },
}

// ─── Component ────────────────────────────────────────────────────────

export default function AdminDashboardEjecutivo() {
  const { data: session } = useSession()
  const router = useRouter()

  // M3/B4 (R8, DR22): quien no tiene `dashboard` (guía, cocina) entra directo a su primera pantalla permitida (Mi día),
  // ANTES de pedir los 6 GET: nunca ve «No se pudo cargar el dashboard». Mientras mis-roles carga no se pide nada.
  // `permisos` = permisos_activos de mis-roles (la misma lista que filtra el menú). estadoRoles 'error' = no se supo el
  // rol: se pide el dashboard como antes (el backend decide con su 403).
  const { estadoRoles, permisos: permisosCtx, rolActivo } = useMisRoles()
  const permisos = permisosCtx ?? rolActivo?.permisos ?? []
  const tieneDashboard = permisos.includes('dashboard')
  const puedeCargar = estadoRoles === 'error' || (estadoRoles === 'listo' && tieneDashboard)
  const sinDashboard = estadoRoles === 'listo' && !tieneDashboard
  const rutaAlterna = sinDashboard ? primeraRutaPermitida(permisos) : null

  useEffect(() => {
    if (rutaAlterna) router.replace(rutaAlterna)
  }, [rutaAlterna, router])

  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [ingresosMes, setIngresosMes] = useState<IngresoMes[]>([])
  const [reservasPorExp, setReservasPorExp] = useState<ReservaPorExperiencia[]>([])
  const [topVendedoras, setTopVendedoras] = useState<Vendedora[]>([])
  const [proximosEventos, setProximosEventos] = useState<EventoProximo[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapResp | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<Date | null>(null)

  // Reloj/saludo: se resuelve post-montaje para evitar hydration mismatch.
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const load = useCallback(
    async (signal: AbortSignal, first: boolean) => {
      const token = session?.accessToken
      if (!token || !puedeCargar) return
      const headers = { Authorization: `Bearer ${token}` }
      const base = `${API_URL}/api/admin/dashboard`
      const mes = mesMexico() // TZ1: YYYY-MM de México (UTC ya era el mes siguiente el último día desde las 18:00)

      const getJson = async <T,>(path: string): Promise<T> => {
        const res = await fetch(`${base}${path}`, { headers, signal })
        if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`)
        return res.json() as Promise<T>
      }

      const results = await Promise.allSettled([
        getJson<Kpis>('/kpis').then(setKpis),
        getJson<IngresoMes[]>('/ingresos-mes?n=6').then(setIngresosMes),
        getJson<ReservaPorExperiencia[]>(
          `/reservas-por-experiencia?mes=${mes}`,
        ).then(setReservasPorExp),
        getJson<VendedoraApi[]>('/top-vendedoras?limite=5').then((d) =>
          setTopVendedoras(
            d.map((v) => ({
              id: v.vendedor_id,
              nombre: v.nombre,
              reservas_count: v.reservas_count,
              ingresos: v.ingresos,
            })),
          ),
        ),
        getJson<EventoProximo[]>('/proximos-eventos?dias=3').then(
          setProximosEventos,
        ),
        getJson<HeatmapResp>(`/heatmap?mes=${mes}`).then(setHeatmap),
      ])

      if (signal.aborted) return

      if (first) {
        const ok = results.filter((r) => r.status === 'fulfilled').length
        setError(
          ok === 0 ? 'No se pudieron cargar los datos del dashboard.' : null,
        )
        // B4 (R8): si falló una parte (no todas: eso ya lo dice la tarjeta de error), un aviso UNA vez por carga.
        // El refresco de cada 60 s (first = false) no avisa.
        if (ok > 0 && ok < results.length) {
          const fallaron = results
            .map((r, i) => (r.status === 'rejected' ? PARTES_DASHBOARD[i] : null))
            .filter((p): p is (typeof PARTES_DASHBOARD)[number] => p !== null)
          aviso.error(
            `No se pudo cargar: ${fallaron.join(', ')}. Lo demás del dashboard está al día.`,
          )
        }
        setLoading(false)
      }
    },
    [session?.accessToken, puedeCargar],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal, true)
    const id = setInterval(() => load(controller.signal, false), 60_000)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [load])

  const reload = useCallback(() => {
    const controller = new AbortController()
    setLoading(true)
    load(controller.signal, true)
  }, [load])

  // ─── Derived ────────────────────────────────────────────────────────

  // B4 (R8): sin nombre en la sesión, saludo sin nombre (antes decía «Sof» a cualquiera).
  const primerNombre = session?.user?.name?.trim().split(/\s+/)[0] ?? ''
  const saludo = now ? saludoPorHora(now) : 'Hola'
  const saludoCompleto = primerNombre ? `${saludo}, ${primerNombre}` : saludo
  const fechaHoy = now
    ? capitalizar(
        formatFechaMexico(now, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      )
    : ''
  const manifestCount = kpis?.manifest_manana.reservas_count ?? 0
  const leadsCount = kpis?.leads_sin_procesar.value ?? 0
  const mesActual = mesMexico()

  /** Props de liga de un KPI: solo si el rol tiene la pantalla de destino. */
  const ligaKpi = (clave: string, titulo: string, valor: string | number) => {
    const d = DESTINO_KPI[clave]
    const conLiga = d && permisos.includes(d.permiso)
    return {
      testId: `kpi-${clave}`,
      href: conLiga ? d.href : undefined,
      ariaLabel: conLiga ? `${titulo}: ${valor}. ${d.pantalla}` : undefined,
    }
  }

  // ─── Entrada sin `dashboard` (M3/B4, R8) ─────────────────────────────

  if (sinDashboard && !rutaAlterna) {
    return (
      <div className="p-6">
        <div
          data-testid="dashboard-sin-pantallas"
          className="bg-white border border-neutro-borde rounded-lg p-6 flex items-start gap-3 max-w-xl"
        >
          <AlertTriangle
            className="h-5 w-5 text-amarillo flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h1 className="mb-0 text-lg font-semibold text-verde">Sin pantallas asignadas</h1>
            <p className="text-sm text-verde-tipografia mt-1">
              Tu rol no tiene pantallas asignadas; pide acceso a un administrador.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!puedeCargar) {
    // Cargando el rol o llevando a la primera pantalla permitida: nada de error ni de datos del dashboard.
    return (
      <div className="p-6" data-testid="dashboard-cargando-rol" aria-busy="true">
        <h1 className="sr-only">Dashboard ejecutivo — Arca Tierra</h1>
        <div className="h-24 max-w-xl rounded-xl bg-white border border-neutro-borde animate-pulse" />
      </div>
    )
  }

  // ─── Error total (primer load, todo falló) ──────────────────────────

  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="bg-rojo-bg border border-rojo/30 rounded-lg p-6 flex items-start gap-3 max-w-xl">
          <AlertTriangle
            className="h-5 w-5 text-rojo flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h1 className="mb-0 text-lg font-semibold text-rojo">
              No se pudo cargar el dashboard
            </h1>
            <p className="text-sm text-verde-tipografia mt-1">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-3 text-sm bg-terracota text-white px-4 py-2 rounded-lg hover:bg-terracota-dark"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="sr-only">Dashboard ejecutivo — Arca Tierra</h1>

      {/* 1 · Welcome banner */}
      <section className="relative overflow-hidden rounded-xl p-6 md:p-7 text-white bg-gradient-to-br from-verde to-terracota">
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div className="relative flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {saludoCompleto}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              {now ? (
                <>
                  Hoy es <strong>{fechaHoy}</strong>. Tienes{' '}
                  <strong>{manifestCount} eventos</strong> mañana y{' '}
                  <strong>{leadsCount} leads</strong> sin procesar.
                </>
              ) : (
                'Cargando resumen del día…'
              )}
            </p>
          </div>
          <LiveClock />
        </div>
      </section>

      {/* 2 · KPI grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading || !kpis
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-neutro-borde p-4 animate-pulse"
              >
                <div className="w-9 h-9 rounded-lg bg-neutral-200 mb-3" />
                <div className="h-2.5 bg-neutral-200 rounded w-24 mb-2" />
                <div className="h-6 bg-neutral-200 rounded w-16 mb-2" />
                <div className="h-2.5 bg-neutral-200 rounded w-20" />
              </div>
            ))
          : [
              <KpiCard
                key="reservas"
                icon={Calendar}
                iconColor="terracota"
                title="Reservas activas"
                value={kpis.reservas_activas.value}
                {...ligaKpi('reservas', 'Reservas activas', kpis.reservas_activas.value)}
                trend={kpis.reservas_activas.trend_pct}
                detail="vs mes anterior"
              />,
              <KpiCard
                key="ingresos"
                icon={TrendingUp}
                iconColor="verde"
                title="Ingresos del mes"
                value={fmtK(kpis.ingresos_mes.value)}
                {...ligaKpi('ingresos', 'Ingresos del mes', fmtK(kpis.ingresos_mes.value))}
                trend={kpis.ingresos_mes.trend_pct}
                detail={`proyección ${fmtK(kpis.ingresos_mes.proyeccion)}`}
                leyenda="Lo vendido: reservas confirmadas, pagadas o realizadas con experiencia este mes."
              />,
              <KpiCard
                key="anticipos"
                icon={Clock}
                iconColor="amarillo"
                title="Anticipos pendientes"
                value={fmtK(kpis.anticipos_pendientes.monto)}
                {...ligaKpi('anticipos', 'Anticipos pendientes', fmtK(kpis.anticipos_pendientes.monto))}
                detail={`${kpis.anticipos_pendientes.reservas_count} reservas tentativas`}
              />,
              <KpiCard
                key="manifest"
                icon={Users}
                iconColor="azul"
                title="Manifest mañana"
                value={kpis.manifest_manana.reservas_count}
                {...ligaKpi('manifest', 'Manifest mañana', kpis.manifest_manana.reservas_count)}
                detail={`${kpis.manifest_manana.invitados_count} invitados`}
              />,
              <KpiCard
                key="leads"
                icon={Inbox}
                iconColor="morado"
                title="Leads sin procesar"
                value={kpis.leads_sin_procesar.value}
                {...ligaKpi('leads', 'Leads sin procesar', kpis.leads_sin_procesar.value)}
                detail={`${kpis.leads_sin_procesar.nuevos_hoy} nuevos hoy`}
              />,
              <KpiCard
                key="conversion"
                icon={CreditCard}
                iconColor="rosa"
                title="Tasa de conversión"
                value={`${kpis.tasa_conversion.value_pct}%`}
                {...ligaKpi('conversion', 'Tasa de conversión', `${kpis.tasa_conversion.value_pct}%`)}
                trend={kpis.tasa_conversion.trend_pct}
              />,
            ]}
      </section>

      {/* 3 · Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartIngresos data={ingresosMes} loading={loading} />
        <ChartReservasPorExperiencia data={reservasPorExp} loading={loading} />
      </section>

      {/* 4 · Widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopVendedorasList items={topVendedoras} loading={loading} />
        <ProximosEventosList items={proximosEventos} loading={loading} />
      </section>

      {/* 5 · Heatmap */}
      <section>
        {loading ? (
          <div className="bg-white rounded-xl border border-neutro-borde p-5 shadow-soft">
            <div className="h-4 bg-neutral-200 rounded w-56 mb-4 animate-pulse" />
            <div className="h-16 bg-neutral-200 rounded animate-pulse" />
          </div>
        ) : (
          <Heatmap
            data={heatmap?.dias ?? []}
            mes={heatmap?.mes ?? mesActual}
          />
        )}
      </section>

      {kpis && (
        <p className="text-[11px] text-verde-suave text-right">
          Actualizado: {formatFechaHoraMexico(kpis.generated_at)}
        </p>
      )}
    </div>
  )
}
