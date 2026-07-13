'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ChevronDown, ChevronUp, Loader2, Phone, Printer } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type {
  ManifestDelDia as ManifestDelDiaType,
  ManifestInvitado,
  Reserva,
} from '@/types/reservas'

interface ManifestDelDiaProps {
  refreshKey: number
  onRowClick: (id: string) => void
}

type RangoDias = 1 | 2 | 7

const RANGOS: { value: RangoDias; label: string }[] = [
  { value: 1, label: 'Hoy' },
  { value: 2, label: 'Manana' },
  { value: 7, label: 'Proximos 7 dias' },
]

function formatearFechaDia(fechaISO: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(`${fechaISO}T00:00:00`))
  } catch {
    return fechaISO
  }
}

function ordenarPorHora(a: Reserva, b: Reserva): number {
  return a.hora_inicio.localeCompare(b.hora_inicio)
}

function FilaInvitados({ invitados, minimo }: { invitados: ManifestInvitado[] | undefined; minimo: number }) {
  if (!invitados || invitados.length === 0) {
    return (
      <ul className="text-xs text-verde-suave space-y-0.5">
        {Array.from({ length: minimo }).map((_, i) => (
          <li key={i}>Guest {i + 1}</li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="text-xs text-verde space-y-0.5">
      {invitados.map((g, i) => (
        <li key={i}>
          <span className="font-medium">{g.nombre ?? `Guest ${i + 1}`}</span>
          {g.edad ? ` · ${g.edad}a` : ''}
          {g.idioma ? ` · ${g.idioma.toUpperCase()}` : ''}
          {g.alergias ? (
            <span className="text-rojo"> · {g.alergias}</span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default function ManifestDelDia({ refreshKey, onRowClick }: ManifestDelDiaProps) {
  const { data: session, status } = useSession()
  const [rango, setRango] = useState<RangoDias>(2)
  const [data, setData] = useState<ManifestDelDiaType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({})

  const fetchManifest = useCallback(async () => {
    const token = session?.accessToken as string | undefined
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/manifest-del-dia?dias=${rango}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json = await res.json()
      const arr: ManifestDelDiaType[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.items)
        ? json.items
        : []
      setData(arr)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [rango, session?.accessToken])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchManifest()
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setError('Sesion no autenticada')
    }
  }, [status, refreshKey, fetchManifest])

  const toggleExpand = (id: string) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <div className="space-y-4">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>

      {/* Selector + Acciones */}
      <div className="bg-white border border-neutro-borde rounded-lg p-4 flex flex-wrap items-center gap-3 no-print">
        <div
          className="inline-flex rounded-lg border border-neutro-borde overflow-hidden"
          role="radiogroup"
          aria-label="Rango de dias"
        >
          {RANGOS.map((r) => {
            const active = rango === r.value
            return (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRango(r.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-verde text-white'
                    : 'bg-white text-verde hover:bg-neutro-light'
                }`}
              >
                {r.label}
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-neutro-borde rounded-lg text-verde hover:bg-neutro-light"
            aria-label="Imprimir manifest"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Imprimir
          </button>
          <button
            type="button"
            disabled
            title="Disponible en Fase D"
            aria-label="Exportar PDF (disponible en Fase D)"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-neutro-borde rounded-lg text-verde-suave opacity-50 cursor-not-allowed"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Estado de error */}
      {error && (
        <div className="bg-rojo-bg border border-rojo/30 rounded-lg p-4 flex items-center gap-3 no-print">
          <span className="text-sm text-rojo flex-1">Error: {error}</span>
          <button
            type="button"
            onClick={fetchManifest}
            className="text-sm bg-white text-rojo border border-rojo/30 px-3 py-1 rounded hover:bg-rojo/10"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-neutro-borde rounded-lg p-6 inline-flex items-center gap-2 text-verde-suave">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando manifest...
        </div>
      )}

      {/* Empty */}
      {!loading && !error && data.length === 0 && (
        <div className="bg-white border border-neutro-borde rounded-lg p-8 text-center text-verde-suave">
          <p className="text-lg font-medium text-verde">Sin eventos en el rango seleccionado</p>
          <p className="text-sm mt-1">Cuando haya reservas confirmadas para estas fechas, apareceran aqui.</p>
        </div>
      )}

      {/* Bloques por dia */}
      {!loading &&
        !error &&
        data.map((dia) => {
          const reservasOrdenadas = [...dia.reservas].sort(ordenarPorHora)
          return (
            <section
              key={dia.fecha}
              aria-labelledby={`dia-${dia.fecha}`}
              className="bg-white border border-neutro-borde rounded-lg overflow-hidden"
            >
              <header
                id={`dia-${dia.fecha}`}
                className="bg-verde text-white px-4 py-3 font-semibold flex flex-wrap items-center gap-x-4 gap-y-1"
              >
                <span className="capitalize">{formatearFechaDia(dia.fecha)}</span>
                <span className="text-sm font-normal opacity-90">
                  · {dia.total_eventos} eventos · {dia.total_invitados} invitados · {dia.guias_unicos} guias
                </span>
              </header>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutro-light border-b border-neutro-borde">
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde whitespace-nowrap">
                        Hora
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Booking
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Experiencia
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Cliente
                      </th>
                      <th scope="col" className="text-center px-3 py-2 font-medium text-verde">
                        Inv.
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Manifest
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Guias
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Tel
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Chinampa
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Idioma
                      </th>
                      <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                        Alergias
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasOrdenadas.map((r) => {
                      const expanded = expandidos[r.id] ?? false
                      const cliente = r.reseller_nombre ?? r.usuario_nombre ?? '—'
                      const invitados =
                        r.numero_invitados_max && r.numero_invitados_max !== r.numero_invitados_min
                          ? `${r.numero_invitados_min}-${r.numero_invitados_max}`
                          : String(r.numero_invitados_min)
                      const guiasText =
                        r.guias && r.guias.length > 0
                          ? r.guias.map((g) => g.nombre).join(', ')
                          : '—'
                      return (
                        <tr key={r.id} className="border-b border-neutro-borde align-top">
                          <td className="px-3 py-2 text-verde whitespace-nowrap font-medium">
                            {r.hora_inicio.slice(0, 5)}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => onRowClick(r.id)}
                              className="font-mono text-xs text-terracota underline hover:text-terracota-dark"
                              aria-label={`Ver detalle de ${r.booking_id}`}
                            >
                              {r.booking_id}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-verde max-w-[180px]">
                            {r.experiencia_nombre ?? '—'}
                          </td>
                          <td className="px-3 py-2 text-verde">{cliente}</td>
                          <td className="px-3 py-2 text-center text-verde tabular-nums">{invitados}</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(r.id)}
                              aria-expanded={expanded}
                              aria-label={
                                expanded ? `Ocultar manifest de ${r.booking_id}` : `Ver manifest de ${r.booking_id}`
                              }
                              className="inline-flex items-center gap-1 text-xs text-verde hover:text-terracota"
                            >
                              {expanded ? (
                                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                              {expanded ? 'Ocultar' : 'Ver'} ({r.manifest_invitados?.length ?? r.numero_invitados_min})
                            </button>
                            {expanded && (
                              <div className="mt-2 p-2 bg-neutro-light/60 rounded">
                                <FilaInvitados
                                  invitados={r.manifest_invitados}
                                  minimo={r.numero_invitados_min}
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-verde text-xs">{guiasText}</td>
                          <td className="px-3 py-2">
                            {r.usuario_telefono ? (
                              <a
                                href={`tel:${r.usuario_telefono}`}
                                aria-label={`Llamar a cliente ${cliente}`}
                                className="inline-flex items-center gap-1 text-terracota hover:text-terracota-dark text-xs"
                              >
                                <Phone className="h-3 w-3" aria-hidden="true" />
                                {r.usuario_telefono}
                              </a>
                            ) : (
                              <span className="text-verde-suave">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-verde">{r.chinampa_asignada ?? '—'}</td>
                          <td className="px-3 py-2 text-verde">
                            {r.idioma === 'en' ? 'EN' : 'ES'}
                          </td>
                          <td className="px-3 py-2 text-rojo text-xs max-w-[160px]">
                            {r.notas_alergias || (
                              <span className="text-verde-suave">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}
    </div>
  )
}
