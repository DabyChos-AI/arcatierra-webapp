'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  Eye,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Loader2,
  Star,
  Tag,
  TrendingUp,
  Truck,
  Upload,
  Users,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import ModalImportarCorte from './components/ModalImportarCorte'
import ModalPreviewReporte from './components/ModalPreviewReporte'
import type {
  CatalogoResponse,
  EstadoImport,
  FiltrosGlobales,
  HistorialResponse,
  OrigenCorte,
  ReporteSpec,
} from '@/types/reportes'
import { ETIQUETA_ORIGEN } from '@/types/reportes'

/** Icono y color por reporte. Si aparece uno nuevo, cae al genérico. */
const ESTILO: Record<string, { icono: typeof Truck; color: string }> = {
  corte_dia: { icono: Truck, color: 'bg-verde' },
  etiquetas: { icono: Tag, color: 'bg-terracota' },
  forecast_ingresos: { icono: TrendingUp, color: 'bg-verde-claro' },
  ranking_experiencias: { icono: Star, color: 'bg-amarillo' },
  conversion_leads_vendedora: { icono: Users, color: 'bg-morado' },
  pagos: { icono: CreditCard, color: 'bg-rosa' },
  manifest_historico: { icono: FileText, color: 'bg-azul' },
  dashboard_ejecutivo: { icono: LayoutDashboard, color: 'bg-terracota-medio' },
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function haceDias(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

function pesoLegible(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function ReportesPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [catalogo, setCatalogo] = useState<CatalogoResponse | null>(null)
  const [historial, setHistorial] = useState<HistorialResponse | null>(null)
  const [estadoImport, setEstadoImport] = useState<EstadoImport | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<FiltrosGlobales>({
    fecha_entrega: hoyISO(),
    origen: '',
    desde: haceDias(30),
    hasta: hoyISO(),
  })

  const [reporteAbierto, setReporteAbierto] = useState<ReporteSpec | null>(null)
  const [importAbierto, setImportAbierto] = useState(false)

  const cabecera = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token])

  /** Silent refetch: nunca vacía el estado, así los modales no se desmontan. */
  const cargarHistorial = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/api/admin/reportes/historial?per_page=10`, {
        headers: cabecera(),
      })
      if (res.ok) setHistorial(await res.json())
    } catch {
      /* el historial es accesorio: si falla, la página sigue sirviendo */
    }
  }, [token, cabecera])

  const cargarEstadoImport = useCallback(
    async (fecha: string) => {
      if (!token) return
      try {
        const res = await fetch(`${API_URL}/api/admin/reportes/corte/import/${fecha}`, {
          headers: cabecera(),
        })
        if (res.ok) setEstadoImport(await res.json())
      } catch {
        /* idem */
      }
    },
    [token, cabecera]
  )

  useEffect(() => {
    if (!token) return
    let cancelado = false
    const cargar = async () => {
      setError(null)
      try {
        const res = await fetch(`${API_URL}/api/admin/reportes`, { headers: cabecera() })
        const data = await res.json()
        if (cancelado) return
        if (!res.ok) throw new Error(data?.detail || 'No se pudo cargar el catálogo')
        setCatalogo(data)
        setFiltros((f) => ({ ...f, fecha_entrega: data.proximo_dia_habil || f.fecha_entrega }))
      } catch (e) {
        if (!cancelado) setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    cargarHistorial()
    return () => {
      cancelado = true
    }
  }, [token, cabecera, cargarHistorial])

  useEffect(() => {
    cargarEstadoImport(filtros.fecha_entrega)
  }, [filtros.fecha_entrega, cargarEstadoImport])

  const canastas = catalogo?.reportes.filter((r) => r.grupo === 'canastas') || []
  const ejecutivos = catalogo?.reportes.filter((r) => r.grupo === 'ejecutivo') || []

  const Tarjeta = ({ reporte }: { reporte: ReporteSpec }) => {
    const estilo = ESTILO[reporte.key] || { icono: BarChart3, color: 'bg-verde-suave' }
    const Icono = estilo.icono
    return (
      <div className="relative flex flex-col gap-2 rounded-xl border border-neutro-borde bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${estilo.color} text-white`}
        >
          <Icono className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold text-verde-tipografia">{reporte.nombre}</h3>
        <p className="flex-1 text-xs leading-relaxed text-verde-suave">{reporte.descripcion}</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => setReporteAbierto(reporte)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-verde px-3 py-2 text-xs font-semibold text-white transition hover:bg-verde-claro"
          >
            <Eye className="h-3.5 w-3.5" />
            Vista previa
          </button>
          <span className="flex items-center gap-1 rounded-md border border-neutro-borde px-2 py-1.5 text-[11px] text-verde-suave">
            {reporte.formatos.includes('xlsx') && <FileSpreadsheet className="h-3 w-3" />}
            {reporte.formatos.includes('pdf') && <FileText className="h-3 w-3" />}
            {reporte.formatos.map((f) => f.toUpperCase()).join(' · ')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="font-heading text-2xl font-bold text-verde">Reportes</h1>
      <p className="mt-1 text-sm text-verde-suave">
        Genera, previsualiza y exporta los reportes de logística y de dirección.
      </p>

      {/* FILTROS GLOBALES */}
      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-neutro-borde bg-neutro-light px-5 py-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="f-dia"
            className="text-xs font-semibold uppercase tracking-wide text-verde-suave"
          >
            Día de entrega
          </label>
          <input
            id="f-dia"
            type="date"
            value={filtros.fecha_entrega}
            onChange={(e) => setFiltros((f) => ({ ...f, fecha_entrega: e.target.value }))}
            className="rounded-lg border border-neutro-borde bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="f-origen"
            className="text-xs font-semibold uppercase tracking-wide text-verde-suave"
          >
            Origen
          </label>
          <select
            id="f-origen"
            value={filtros.origen}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, origen: e.target.value as OrigenCorte }))
            }
            className="rounded-lg border border-neutro-borde bg-white px-3 py-2 text-sm"
          >
            {(Object.keys(ETIQUETA_ORIGEN) as OrigenCorte[]).map((o) => (
              <option key={o} value={o}>
                {ETIQUETA_ORIGEN[o]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="f-desde"
            className="text-xs font-semibold uppercase tracking-wide text-verde-suave"
          >
            Desde
          </label>
          <input
            id="f-desde"
            type="date"
            value={filtros.desde}
            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
            className="rounded-lg border border-neutro-borde bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="f-hasta"
            className="text-xs font-semibold uppercase tracking-wide text-verde-suave"
          >
            Hasta
          </label>
          <input
            id="f-hasta"
            type="date"
            value={filtros.hasta}
            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
            className="rounded-lg border border-neutro-borde bg-white px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => setImportAbierto(true)}
          className="ml-auto flex items-center gap-2 rounded-lg bg-verde px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-verde-claro"
        >
          <Upload className="h-4 w-4" />
          Subir corte del día
        </button>
      </div>

      {estadoImport && (
        <p className="mt-2 text-xs text-verde-suave">
          {estadoImport.hay_corte ? (
            <>
              El {estadoImport.fecha_entrega} tiene <strong>{estadoImport.filas} entregas</strong>{' '}
              cargadas
              {estadoImport.con_avisos > 0 && ` · ${estadoImport.con_avisos} con avisos`}.
            </>
          ) : (
            <>
              El {estadoImport.fecha_entrega} todavía no tiene corte cargado. Si la venta aún no
              pasa por la plataforma, súbelo con el botón de arriba.
            </>
          )}
        </p>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-rojo/30 bg-rojo-bg px-4 py-3 text-sm text-rojo">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="flex items-center justify-center gap-2 py-20 text-verde-suave">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando reportes…
        </div>
      ) : (
        <>
          {/* LOGÍSTICA DE CANASTAS */}
          {canastas.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-base font-bold text-verde">Logística de canastas</h2>
                <span className="rounded-full bg-terracota px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide text-white">
                  NUEVO
                </span>
                <span className="ml-auto text-xs text-verde-suave">
                  Corte Lun–Vie · entrega del próximo día hábil
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {canastas.map((r) => (
                  <Tarjeta key={r.key} reporte={r} />
                ))}
                <button
                  onClick={() => setImportAbierto(true)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutro-borde bg-neutro-light/60 p-5 text-center transition hover:border-terracota"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutro-gris text-verde">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-verde-tipografia">¿Aún sin migrar?</span>
                  <span className="text-xs text-verde-suave">
                    Sube el export de tu sistema actual y genera el corte igual.
                  </span>
                </button>
              </div>
            </section>
          )}

          {/* REPORTES EJECUTIVOS */}
          {ejecutivos.length > 0 && (
            <section className="mt-10">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-base font-bold text-verde">Reportes ejecutivos</h2>
                <span className="ml-auto text-xs text-verde-suave">
                  Experiencias · reservas · pagos
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ejecutivos.map((r) => (
                  <Tarjeta key={r.key} reporte={r} />
                ))}
              </div>
            </section>
          )}

          {/* HISTORIAL */}
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-base font-bold text-verde">Historial de exports</h2>
              <span className="ml-auto text-xs text-verde-suave">
                {historial?.total_count ?? 0} exports en total
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-neutro-borde bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-neutro-light">
                    {[
                      'Reporte',
                      'Formato',
                      'Filtros',
                      'Generado por',
                      'Fecha',
                      'Tamaño',
                      'Estado',
                    ].map((c) => (
                      <th
                        key={c}
                        className="whitespace-nowrap px-4 py-2.5 text-left font-bold text-verde"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!historial || historial.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-verde-suave">
                        Todavía no se ha generado ningún reporte.
                      </td>
                    </tr>
                  ) : (
                    historial.items.map((h) => (
                      <tr key={h.id} className="border-t border-neutro-borde/60">
                        <td className="px-4 py-2.5 text-verde-tipografia">
                          {catalogo?.reportes.find((r) => r.key === h.reporte_key)?.nombre ||
                            h.reporte_key}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              h.formato === 'xlsx'
                                ? 'bg-verde/10 text-verde'
                                : 'bg-terracota/10 text-terracota'
                            }`}
                          >
                            {h.formato.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-verde-suave">
                          {Object.entries(h.filtros || {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ') || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-verde-suave">{h.generado_por_nombre}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-verde-suave">
                          {new Date(h.fecha_creacion).toLocaleString('es-MX', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="px-4 py-2.5 text-verde-suave">
                          {pesoLegible(h.tamano_bytes)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              h.estado === 'completado'
                                ? 'bg-verde/10 text-verde'
                                : h.estado === 'fallido'
                                  ? 'bg-rojo-bg text-rojo'
                                  : 'bg-amarillo-bg text-amarillo'
                            }`}
                            title={h.error_mensaje || undefined}
                          >
                            {h.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {reporteAbierto && (
        <ModalPreviewReporte
          reporte={reporteAbierto}
          filtrosGlobales={filtros}
          onCerrar={() => setReporteAbierto(null)}
          onExportado={cargarHistorial}
        />
      )}

      {importAbierto && (
        <ModalImportarCorte
          fechaEntrega={filtros.fecha_entrega}
          onCerrar={() => setImportAbierto(false)}
          onImportado={() => cargarEstadoImport(filtros.fecha_entrega)}
        />
      )}
    </div>
  )
}
