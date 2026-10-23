'use client'

// Pestaña «Newsletter» de la bandeja (WF11, R11b, DR71): los correos que se suscribieron con su consentimiento. Filtro,
// búsqueda, páginas de 50, «Dar de baja» / «Reactivar» (con `confirmar`; candado por fila ANTES del await) y «Exportar CSV»
// (solo activos; lo arma el backend con el nombre `newsletter-AAAA-MM-DD.csv`). Un cambio actualiza la fila en su lugar.

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Download, Mail, Search } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { ErrorPanel, pedirAlPanel, pedirArchivoAlPanel } from '@/lib/fetchPanel'
import { descargar } from '@/lib/descargas'
import { hoyMexico } from '@/lib/dates'
import { aviso, confirmar } from '@/components/ui/Avisos'
import type {
  CambiarEstadoSuscriptor,
  EstadoSuscriptor,
  NewsletterRespuesta,
  SuscriptorNewsletter,
} from '@/types/mensajes'
import { ETIQUETA_ORIGEN, POR_PAGINA_NEWSLETTER, fechaHora, normalizarNewsletter, normalizarSuscriptor, plural } from './mensajes'

interface Props {
  token: string
}

const ESPERA_BUSQUEDA_MS = 400

function mensajeDe(e: unknown, porDefecto: string): string {
  return e instanceof ErrorPanel ? e.mensaje : porDefecto
}

export default function TabNewsletter({ token }: Props) {
  const [estado, setEstado] = useState<EstadoSuscriptor | ''>('')
  const [buscar, setBuscar] = useState('')
  const [q, setQ] = useState('')
  const [pagina, setPagina] = useState(1)
  const [datos, setDatos] = useState<NewsletterRespuesta | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportando, setExportando] = useState(false)
  const [enCurso, setEnCurso] = useState<ReadonlySet<string>>(new Set())
  const enCursoRef = useRef<Set<string>>(new Set())
  const exportandoRef = useRef(false)
  const pedidoRef = useRef(0)

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(buscar.trim())
      setPagina(1)
    }, ESPERA_BUSQUEDA_MS)
    return () => window.clearTimeout(t)
  }, [buscar])

  const cargar = useCallback(async () => {
    const n = ++pedidoRef.current
    setCargando(true)
    setError(null)
    const params = new URLSearchParams({
      estado,
      q,
      page: String(pagina),
      limit: String(POR_PAGINA_NEWSLETTER),
    })
    try {
      const cuerpo = await pedirAlPanel<unknown>(`${API_URL}/api/admin/newsletter?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (n !== pedidoRef.current) return
      setDatos(normalizarNewsletter(cuerpo))
    } catch (e) {
      if (n !== pedidoRef.current) return
      setError(mensajeDe(e, 'No se pudo cargar la lista del newsletter.'))
    } finally {
      if (n === pedidoRef.current) setCargando(false)
    }
  }, [token, estado, q, pagina])

  useEffect(() => {
    void cargar()
  }, [cargar])

  function soltar(id: string) {
    enCursoRef.current.delete(id)
    setEnCurso(new Set(enCursoRef.current))
  }

  async function cambiarEstado(s: SuscriptorNewsletter) {
    if (enCursoRef.current.has(s.id)) return
    // Candado ANTES del await de `confirmar` (s48): un doble clic no manda dos PATCH.
    enCursoRef.current.add(s.id)
    setEnCurso(new Set(enCursoRef.current))
    try {
      const nuevo: EstadoSuscriptor = s.estado === 'activo' ? 'baja' : 'activo'
      const ok = await confirmar(
        nuevo === 'baja'
          ? {
              titulo: 'Dar de baja',
              mensaje: `${s.email} deja de recibir el newsletter y sale del CSV. Puedes reactivarlo después.`,
              textoAceptar: 'Sí, dar de baja', // no repite el nombre del botón de la fila (s48)
              peligro: true,
            }
          : {
              titulo: 'Reactivar suscriptor',
              mensaje: `${s.email} vuelve a la lista del newsletter y al CSV. Hazlo solo si la persona lo pidió.`,
              textoAceptar: 'Sí, reactivar',
            },
      )
      if (!ok) return
      const body: CambiarEstadoSuscriptor = { estado: nuevo }
      const cuerpo = await pedirAlPanel<unknown>(`${API_URL}/api/admin/newsletter/${encodeURIComponent(s.id)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const actualizado = normalizarSuscriptor(cuerpo) ?? { ...s, estado: nuevo }
      setDatos((prev) => {
        if (!prev) return prev
        const delta = (s.estado === 'activo' ? -1 : 0) + (actualizado.estado === 'activo' ? 1 : 0)
        return {
          ...prev,
          items: prev.items.map((it) => (it.id === s.id ? actualizado : it)),
          activos: Math.max(0, prev.activos + delta),
        }
      })
      aviso.exito(actualizado.estado === 'baja' ? 'Suscriptor dado de baja.' : 'Suscriptor reactivado.')
    } catch (e) {
      aviso.error(mensajeDe(e, 'No se pudo cambiar el estado del suscriptor.'))
    } finally {
      soltar(s.id)
    }
  }

  async function exportar() {
    if (exportandoRef.current) return
    exportandoRef.current = true
    setExportando(true)
    try {
      const res = await pedirArchivoAlPanel(`${API_URL}/api/admin/newsletter/csv`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await descargar(res, `newsletter-${hoyMexico()}.csv`)
    } catch (e) {
      aviso.error(mensajeDe(e, 'No se pudo descargar el CSV.'))
    } finally {
      exportandoRef.current = false
      setExportando(false)
    }
  }

  const totalPaginas = datos ? Math.max(1, Math.ceil(datos.total / POR_PAGINA_NEWSLETTER)) : 1

  return (
    <section aria-label="Suscriptores del newsletter" className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label htmlFor="newsletter-buscar" className="block text-xs text-verde-suave">
            Buscar
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-verde-suave" aria-hidden="true" />
            <input
              id="newsletter-buscar"
              data-testid="newsletter-buscar"
              type="search"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Correo"
              className="min-h-[44px] w-full rounded-lg border border-neutro-borde bg-white pl-9 pr-3 text-sm text-verde-tipografia"
            />
          </div>
        </div>
        <div>
          <label htmlFor="newsletter-filtro-estado" className="block text-xs text-verde-suave">
            Estado
          </label>
          <select
            id="newsletter-filtro-estado"
            data-testid="newsletter-filtro-estado"
            value={estado}
            onChange={(e) => {
              const v = e.target.value
              setEstado(v === 'activo' || v === 'baja' ? v : '')
              setPagina(1)
            }}
            className="mt-1 min-h-[44px] rounded-lg border border-neutro-borde bg-white px-3 text-sm text-verde"
          >
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="baja">Dados de baja</option>
          </select>
        </div>
        <button
          type="button"
          data-testid="newsletter-exportar"
          onClick={() => void exportar()}
          disabled={exportando}
          className="ml-auto inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-verde px-4 text-sm font-semibold text-white hover:bg-verde-claro disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {exportando ? 'Descargando…' : 'Exportar CSV'}
        </button>
      </div>
      {datos && (
        <p data-testid="newsletter-activos" className="text-sm text-verde-suave">
          {plural(datos.activos, 'suscriptor activo', 'suscriptores activos')} · el CSV trae solo los activos.
        </p>
      )}

      {error && (
        <div data-testid="newsletter-panel-error" role="alert" className="rounded-xl border border-rojo/30 bg-rojo-bg p-4">
          <p className="flex items-start gap-2 text-sm text-rojo">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
          <button
            type="button"
            data-testid="newsletter-panel-reintentar"
            onClick={() => void cargar()}
            className="mt-3 min-h-[44px] rounded-lg bg-terracota px-4 text-sm font-semibold text-white hover:bg-terracota-dark"
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && !datos ? (
        <p data-testid="newsletter-panel-cargando" aria-busy="true" className="text-sm text-verde-suave">
          Cargando suscriptores…
        </p>
      ) : datos && datos.items.length === 0 && !error ? (
        <div
          data-testid="newsletter-panel-vacio"
          className="flex flex-col items-center gap-2 rounded-xl border border-neutro-borde bg-white p-8 text-center text-verde-suave"
        >
          <Mail className="h-8 w-8" aria-hidden="true" />
          <p>{q || estado ? 'Ningún correo coincide con el filtro.' : 'Todavía nadie se suscribe al newsletter.'}</p>
        </div>
      ) : datos ? (
        <ul
          data-testid="newsletter-lista"
          aria-busy={cargando}
          className={`divide-y divide-neutro-borde overflow-hidden rounded-xl border border-neutro-borde bg-white ${cargando ? 'opacity-60' : ''}`}
        >
          {datos.items.map((s) => {
            const activo = s.estado === 'activo'
            return (
              <li
                key={s.id}
                data-testid={`suscriptor-${s.id}`}
                data-estado={s.estado}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className={`break-all text-sm ${activo ? 'text-verde' : 'text-verde-suave line-through'}`}>{s.email}</p>
                  <p className="text-xs text-verde-suave">
                    {ETIQUETA_ORIGEN[s.origen]} · aceptó el {fechaHora(s.consentido_en)}
                    {!activo && s.baja_en ? ` · baja el ${fechaHora(s.baja_en)}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  data-testid={`suscriptor-accion-${s.id}`}
                  data-accion={activo ? 'baja' : 'activo'}
                  disabled={enCurso.has(s.id)}
                  onClick={() => void cambiarEstado(s)}
                  className={`min-h-[40px] shrink-0 rounded-lg border px-3 text-sm font-medium disabled:opacity-50 ${
                    activo
                      ? 'border-terracota/40 text-terracota hover:bg-terracota/10'
                      : 'border-neutro-borde text-verde hover:bg-neutro-light'
                  }`}
                >
                  {activo ? 'Dar de baja' : 'Reactivar'}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {datos && datos.total > POR_PAGINA_NEWSLETTER && (
        <nav aria-label="Páginas del newsletter" className="flex items-center justify-end gap-2 text-sm text-verde">
          <button
            type="button"
            data-testid="newsletter-pagina-anterior"
            aria-label="Página anterior"
            disabled={pagina <= 1 || cargando}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutro-borde bg-white disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            type="button"
            data-testid="newsletter-pagina-siguiente"
            aria-label="Página siguiente"
            disabled={pagina >= totalPaginas || cargando}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutro-borde bg-white disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </section>
  )
}
