'use client'

// Fase 4b de PLAN-EXP-SIN-FALLAS (sesión 40, 1-oct-2026) · RS1: comisiones del reseller en su ficha (F4).
// Contrato: EXP-FASE4B-CONTRATO.md §C7/§F4. El % se guardó EN CADA RESERVA al crearla (D16-3): cambiar la comisión del
// reseller no toca lo ya vendido. La comisión no se resta del precio al cliente.

import { useEffect, useState } from 'react'
import { Download, Loader2, AlertTriangle, Percent } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { hoyMexico } from '@/lib/dates'
import { descargar } from '@/lib/descargas'
import { ErrorPanel, pedirAlPanel, pedirArchivoAlPanel } from '@/lib/fetchPanel'
import { formatMXN } from '@/types/reservas'
import { urlComisionesCsv, type ComisionesReseller } from '@/types/catalogos'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** 'YYYY-MM' → «Enero». */
function nombreMes(mes: string): string {
  return MESES[Number(mes.slice(5, 7)) - 1] ?? mes
}

const formatoPct = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

function mensajeDe(e: unknown, porDefecto: string): string {
  return e instanceof ErrorPanel ? e.mensaje : porDefecto
}

interface Props {
  token: string | undefined
  resellerId: string
}

export default function FichaComisiones({ token, resellerId }: Props) {
  // Año de México (no el del navegador): el 31-dic a las 19:00 en CDMX ya es año nuevo en UTC.
  const [anioActual] = useState(() => Number(hoyMexico().slice(0, 4)))
  const [anio, setAnio] = useState(anioActual)
  const [datos, setDatos] = useState<ComisionesReseller | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [descargando, setDescargando] = useState(false)

  // Del año siguiente (reservas futuras) a tres años atrás.
  const anios = Array.from({ length: 5 }, (_, i) => anioActual + 1 - i)

  useEffect(() => {
    if (!token) return
    let cancelado = false
    setCargando(true)
    setError(null)
    pedirAlPanel<ComisionesReseller>(
      `${API_URL}/api/admin/resellers/${encodeURIComponent(resellerId)}/comisiones?anio=${anio}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((d) => {
        if (!cancelado) setDatos(d)
      })
      .catch((e: unknown) => {
        if (cancelado) return
        setDatos(null)
        setError(mensajeDe(e, 'No se pudieron cargar las comisiones.'))
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [token, resellerId, anio])

  const descargarCsv = async () => {
    if (!token || descargando) return
    setDescargando(true)
    setError(null)
    try {
      const res = await pedirArchivoAlPanel(urlComisionesCsv(API_URL, resellerId, anio), {
        headers: { Authorization: `Bearer ${token}` },
      })
      await descargar(res, `comisiones-${anio}.csv`)
    } catch (e) {
      setError(mensajeDe(e, 'No se pudo descargar el CSV.'))
    } finally {
      setDescargando(false)
    }
  }

  const pctActual = datos?.comision_porcentaje_actual

  return (
    <section
      data-testid="reseller-comisiones"
      aria-labelledby={`comisiones-titulo-${resellerId}`}
      className="space-y-3 rounded-lg border border-neutro-borde bg-white p-3"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            id={`comisiones-titulo-${resellerId}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-verde"
          >
            <Percent className="h-4 w-4 text-terracota" aria-hidden="true" />
            Comisiones
          </p>
          {datos && (
            <p data-testid="comisiones-actual" className="text-xs text-verde-suave">
              {pctActual != null
                ? `Comisión actual: ${formatoPct.format(pctActual)} % (se guarda en sus reservas nuevas)`
                : 'Sin comisión configurada: sus reservas nuevas no generan comisión.'}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor={`comisiones-anio-${resellerId}`} className="block text-xs text-verde-suave mb-1">
              Año
            </label>
            <select
              id={`comisiones-anio-${resellerId}`}
              data-testid="comisiones-anio"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="border border-neutro-borde rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            >
              {anios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            data-testid="comisiones-csv"
            onClick={descargarCsv}
            disabled={descargando || !token}
            className="inline-flex items-center gap-2 rounded-lg border border-neutro-borde px-3 py-1.5 text-sm text-verde hover:bg-neutro-light disabled:opacity-50"
          >
            {descargando ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Descargar CSV
          </button>
        </div>
      </div>

      <p data-testid="comisiones-nota" className="text-xs text-verde-suave">
        Cuentan las reservas Confirmadas, Pagadas y Realizadas, por mes de la experiencia; la comisión es sobre el
        total sin propina.
      </p>

      {error && (
        <p
          data-testid="comisiones-error"
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rojo/30 bg-rojo-bg p-2 text-xs text-rojo"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {cargando ? (
        <div className="flex items-center gap-2 text-sm text-verde-suave">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando comisiones...
        </div>
      ) : datos ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="text-left text-verde-suave">
                <th className="px-2 py-1 font-medium">Mes</th>
                <th className="px-2 py-1 font-medium text-right">Reservas</th>
                <th className="px-2 py-1 font-medium text-right">Personas</th>
                <th className="px-2 py-1 font-medium text-right">Total vendido</th>
                <th className="px-2 py-1 font-medium text-right">Base (sin propina)</th>
                <th className="px-2 py-1 font-medium text-right">Comisión</th>
              </tr>
            </thead>
            <tbody>
              {datos.meses.map((m) => (
                <tr
                  key={m.mes}
                  data-testid={`comisiones-mes-${m.mes}`}
                  className={`border-t border-neutro-borde ${m.reservas === 0 ? 'text-verde-suave' : 'text-verde'}`}
                >
                  <td className="px-2 py-1">{nombreMes(m.mes)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{m.reservas}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{m.personas}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{formatMXN(m.total_vendido)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{formatMXN(m.base_comision)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    {formatMXN(m.comision)}
                    {m.sin_porcentaje > 0 && (
                      <span className="block text-[11px] text-terracota">
                        {m.sin_porcentaje} sin % guardado ($0)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr
                data-testid="comisiones-total"
                className="border-t-2 border-neutro-borde font-semibold text-verde"
              >
                <td className="px-2 py-1.5">Total {datos.anio}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{datos.totales.reservas}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{datos.totales.personas}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatMXN(datos.totales.total_vendido)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatMXN(datos.totales.base_comision)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {formatMXN(datos.totales.comision)}
                  {datos.totales.sin_porcentaje > 0 && (
                    <span className="block text-[11px] font-normal text-terracota">
                      {datos.totales.sin_porcentaje} sin % guardado ($0)
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : null}
    </section>
  )
}
