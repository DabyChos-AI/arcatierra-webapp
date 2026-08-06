'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Download, FileSpreadsheet, FileText, Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type {
  FiltrosGlobales,
  FormatoReporte,
  PreviewResponse,
  ReporteSpec,
} from '@/types/reportes'

interface Props {
  reporte: ReporteSpec
  filtrosGlobales: FiltrosGlobales
  onCerrar: () => void
  onExportado: () => void
}

/** Etiquetas legibles para las claves del bloque meta que devuelve el backend. */
const META_ETIQUETAS: Record<string, string> = {
  total_entregas: 'Entregas',
  total_etiquetas: 'Etiquetas',
  total_filas: 'Filas',
  con_adicionales: 'Con adicionales',
  ingreso_total: 'Ingreso total',
  total_ponderado: 'Ponderado',
  total_nominal: 'Nominal',
  conversion_global: 'Conversión',
  monto_bruto: 'Bruto',
  comision_total: 'Comisión MP',
  monto_neto: 'Neto',
  invitados_totales: 'Invitados',
  con_alergias: 'Con alergias',
  reservas: 'Reservas',
  ingreso_confirmado: 'Confirmado',
  por_cobrar: 'Por cobrar',
  experiencias_con_reservas: 'Experiencias',
  vendedoras: 'Vendedoras',
  aprobados: 'Aprobados',
}

export default function ModalPreviewReporte({
  reporte,
  filtrosGlobales,
  onCerrar,
  onExportado,
}: Props) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportando, setExportando] = useState<FormatoReporte | null>(null)
  const [incluirAdicionales, setIncluirAdicionales] = useState(false)
  const [meses, setMeses] = useState(6)

  const usaDiaEntrega = reporte.filtros.some((f) => f.nombre === 'fecha_entrega')
  const usaMeses = reporte.filtros.some((f) => f.nombre === 'meses')
  const usaRango = reporte.filtros.some((f) => f.nombre === 'desde')
  const usaAdicionales = reporte.filtros.some((f) => f.nombre === 'incluir_adicionales')
  const usaOrigen = reporte.filtros.some((f) => f.nombre === 'origen')

  const queryFiltros = useCallback(() => {
    const q = new URLSearchParams()
    if (usaDiaEntrega) q.set('fecha_entrega', filtrosGlobales.fecha_entrega)
    // '' = todos los orígenes; el backend espera que el parámetro no venga.
    if (usaOrigen && filtrosGlobales.origen) q.set('origen', filtrosGlobales.origen)
    if (usaRango) {
      q.set('desde', filtrosGlobales.desde)
      q.set('hasta', filtrosGlobales.hasta)
    }
    if (usaMeses) q.set('meses', String(meses))
    q.set('limite', '20')
    return q.toString()
  }, [usaDiaEntrega, usaOrigen, usaRango, usaMeses, filtrosGlobales, meses])

  const cuerpoFiltros = useCallback((): Record<string, unknown> => {
    const f: Record<string, unknown> = {}
    if (usaDiaEntrega) f.fecha_entrega = filtrosGlobales.fecha_entrega
    if (usaOrigen && filtrosGlobales.origen) f.origen = filtrosGlobales.origen
    if (usaRango) {
      f.desde = filtrosGlobales.desde
      f.hasta = filtrosGlobales.hasta
    }
    if (usaMeses) f.meses = meses
    if (usaAdicionales) f.incluir_adicionales = incluirAdicionales
    return f
  }, [
    usaDiaEntrega,
    usaOrigen,
    usaRango,
    usaMeses,
    usaAdicionales,
    filtrosGlobales,
    meses,
    incluirAdicionales,
  ])

  useEffect(() => {
    if (!token) return
    let cancelado = false
    const cargar = async () => {
      // Silent refetch: no desmontar la tabla mientras recarga (patrón sesión 24)
      setError(null)
      try {
        const res = await fetch(
          `${API_URL}/api/admin/reportes/${reporte.key}/preview?${queryFiltros()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        if (cancelado) return
        if (!res.ok) throw new Error(data?.detail || 'No se pudo cargar la vista previa')
        setPreview(data)
      } catch (e) {
        if (!cancelado) setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [token, reporte.key, queryFiltros])

  const exportar = async (formato: FormatoReporte) => {
    if (!token) return
    setExportando(formato)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/reportes/${reporte.key}/exportar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ formato, filtros: cuerpoFiltros() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.detail || `El servidor respondió ${res.status}`)
      }
      const blob = await res.blob()
      const cd = res.headers.get('content-disposition') || ''
      const nombre =
        /filename="?([^"]+)"?/.exec(cd)?.[1] ||
        `arcatierra_${reporte.key}.${formato}`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nombre
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      onExportado()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo exportar')
    } finally {
      setExportando(null)
    }
  }

  const metaVisible = Object.entries(preview?.meta || {}).filter(
    ([k, v]) => META_ETIQUETAS[k] && typeof v !== 'object'
  )

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="my-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 bg-verde px-5 py-4 text-white">
          <div>
            <h2 className="text-base font-bold">{reporte.nombre}</h2>
            <p className="text-xs text-white/80">{reporte.descripcion}</p>
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar vista previa"
            className="ml-auto rounded-full bg-white/15 p-2 transition hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {(usaMeses || usaAdicionales) && (
          <div className="flex flex-wrap items-end gap-4 border-b border-neutro-borde bg-neutro-light px-5 py-3">
            {usaMeses && (
              <div className="flex flex-col gap-1">
                <label htmlFor="meses-proyeccion" className="text-xs font-semibold text-verde-suave">
                  Meses de proyección
                </label>
                <select
                  id="meses-proyeccion"
                  value={meses}
                  onChange={(e) => setMeses(Number(e.target.value))}
                  className="rounded-lg border border-neutro-borde bg-white px-3 py-1.5 text-sm"
                >
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                </select>
              </div>
            )}
            {usaAdicionales && (
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-verde-tipografia">
                <input
                  type="checkbox"
                  checked={incluirAdicionales}
                  onChange={(e) => setIncluirAdicionales(e.target.checked)}
                  className="h-4 w-4 accent-verde"
                />
                Incluir adicionales en la etiqueta
              </label>
            )}
          </div>
        )}

        <div className="max-h-[55vh] overflow-auto px-5 py-4">
          {metaVisible.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {metaVisible.map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full bg-neutro-light px-3 py-1 text-xs text-verde-suave"
                >
                  {META_ETIQUETAS[k]}: <strong className="text-verde">{String(v)}</strong>
                </span>
              ))}
            </div>
          )}

          {cargando && !preview ? (
            <div className="flex items-center justify-center gap-2 py-16 text-verde-suave">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando vista previa…
            </div>
          ) : error && !preview ? (
            <p className="py-12 text-center text-sm text-rojo">{error}</p>
          ) : preview && preview.filas.length === 0 ? (
            <p className="py-12 text-center text-sm text-verde-suave">
              No hay datos para los filtros seleccionados. Puedes cambiar la fecha o el rango
              y volver a intentar.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutro-borde">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {preview?.columnas.map((c) => (
                      <th
                        key={c}
                        className="sticky top-0 whitespace-nowrap bg-verde px-3 py-2 text-left font-semibold text-white"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview?.filas.map((fila, i) => (
                    <tr key={i} className="even:bg-neutro-light/60">
                      {fila.map((celda, j) => (
                        <td
                          key={j}
                          className="whitespace-nowrap border-b border-neutro-borde/60 px-3 py-1.5 text-verde-tipografia"
                        >
                          {celda === null || celda === '' ? '—' : String(celda)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && preview && <p className="mt-3 text-sm text-rojo">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutro-borde bg-neutro-light px-5 py-3">
          <button
            onClick={onCerrar}
            className="rounded-lg border border-neutro-borde px-4 py-2 text-sm text-verde-suave transition hover:bg-white"
          >
            Cerrar
          </button>
          {reporte.formatos.includes('xlsx') && (
            <button
              onClick={() => exportar('xlsx')}
              disabled={exportando !== null}
              className="flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-semibold text-white transition hover:bg-verde-claro disabled:opacity-60"
            >
              {exportando === 'xlsx' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Exportar Excel
            </button>
          )}
          {reporte.formatos.includes('pdf') && (
            <button
              onClick={() => exportar('pdf')}
              disabled={exportando !== null}
              className="flex items-center gap-2 rounded-lg bg-terracota px-4 py-2 text-sm font-semibold text-white transition hover:bg-terracota-dark disabled:opacity-60"
            >
              {exportando === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Exportar PDF
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
