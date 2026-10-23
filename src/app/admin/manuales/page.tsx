'use client'

// Manuales del panel (MANP1, R11b, DR74). Contrato: R11B-CONTRATO.md §4.4 y §4.6.
// GET /api/admin/manuales trae SOLO los que el rol activo puede ver (guías: «Mi día»; Experiencias: los tres). Cada
// manual se ABRE en otra pestaña por el proxy de Next con la cookie de sesión (`urlManual()`): nunca en un iframe
// (X-Frame-Options DENY) ni con liga pública. El backend vuelve a revisar el permiso de cada archivo (403).

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, BookOpen, Download, FileText, Globe } from 'lucide-react'
import AdminTopbar from '../components/AdminTopbar'
import { API_URL } from '@/lib/api'
import { ErrorPanel, pedirAlPanel } from '@/lib/fetchPanel'
import { formatFechaMexico } from '@/lib/dates'
import { urlManual, type IdManual, type Manual, type ManualesRespuesta } from '@/types/manuales'

const IDS: IdManual[] = ['guia-panel', 'manual-experiencias', 'mi-dia']

function normalizarManuales(cuerpo: unknown): ManualesRespuesta {
  const c = (cuerpo && typeof cuerpo === 'object' ? cuerpo : {}) as Partial<ManualesRespuesta>
  const items = Array.isArray(c.items) ? c.items : []
  return {
    items: items
      .filter((m): m is Manual => !!m && typeof m === 'object' && (IDS as string[]).includes((m as Manual).id))
      .map((m) => ({
        ...m,
        titulo: typeof m.titulo === 'string' ? m.titulo : m.id,
        descripcion: typeof m.descripcion === 'string' ? m.descripcion : '',
        revision: typeof m.revision === 'string' ? m.revision : '',
        fecha: typeof m.fecha === 'string' ? m.fecha : '',
        paginas: Number.isFinite(Number(m.paginas)) && m.paginas !== null ? Number(m.paginas) : null,
        tamano_pdf: Number(m.tamano_pdf) || 0,
        tiene_web: m.tiene_web === true,
      })),
  }
}

/** «1.2 MB» / «340 KB». */
function tamano(bytes: number): string {
  if (bytes <= 0) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toLocaleString('es-MX', { maximumFractionDigits: 1 })} MB`
}

const CLASE_BOTON =
  'inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors'

export default function ManualesPage() {
  const { data: session, status } = useSession()
  const token = session?.accessToken
  const [manuales, setManuales] = useState<Manual[] | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (!token) return
    setCargando(true)
    setError(null)
    try {
      const cuerpo = await pedirAlPanel<unknown>(`${API_URL}/api/admin/manuales`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      setManuales(normalizarManuales(cuerpo).items)
    } catch (e) {
      // 403 = el rol no tiene ningún permiso de manuales: es lo mismo que una lista vacía.
      if (e instanceof ErrorPanel && e.codigo === 403) setManuales([])
      else setError(e instanceof ErrorPanel ? e.mensaje : 'No se pudieron cargar los manuales.')
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    void cargar()
  }, [cargar])

  return (
    <div className="flex h-full flex-col">
      <AdminTopbar />
      <div className="flex-1 space-y-6 overflow-auto p-4 sm:p-6">
        <header className="flex items-start gap-3">
          <div className="rounded-lg bg-terracota/10 p-2">
            <BookOpen className="h-6 w-6 text-terracota" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="mb-0 font-display text-3xl text-verde">Manuales</h1>
            <p className="text-sm text-verde-suave">Se abren en otra pestaña. Solo ves los de tu rol.</p>
          </div>
        </header>

        {error && (
          <div data-testid="manuales-error" role="alert" className="rounded-xl border border-rojo/30 bg-rojo-bg p-4">
            <p className="flex items-start gap-2 text-sm text-rojo">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
            <button
              type="button"
              data-testid="manuales-reintentar"
              onClick={() => void cargar()}
              className="mt-3 min-h-[44px] rounded-lg bg-terracota px-4 text-sm font-semibold text-white hover:bg-terracota-dark"
            >
              Reintentar
            </button>
          </div>
        )}

        {!token && status !== 'loading' ? (
          <p className="text-sm text-verde-suave">Tu sesión expiró. Vuelve a iniciar sesión.</p>
        ) : manuales === null ? (
          !error && (
            <p data-testid="manuales-cargando" aria-busy={cargando} className="text-sm text-verde-suave">
              Cargando manuales…
            </p>
          )
        ) : manuales.length === 0 ? (
          <p
            data-testid="manuales-vacio"
            className="rounded-xl border border-neutro-borde bg-white p-8 text-center text-verde-suave"
          >
            No tienes manuales para tu rol.
          </p>
        ) : (
          <ul data-testid="manuales-lista" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {manuales.map((m) => {
              const detalles = [
                m.revision ? `Revisión ${m.revision}` : '',
                m.fecha ? formatFechaMexico(m.fecha, { day: 'numeric', month: 'long', year: 'numeric' }) : '',
                m.paginas ? `${m.paginas} ${m.paginas === 1 ? 'página' : 'páginas'}` : '',
                tamano(m.tamano_pdf),
              ].filter((t) => t && t !== '-')
              return (
                <li
                  key={m.id}
                  data-testid={`manual-${m.id}`}
                  className="flex flex-col rounded-xl border border-neutro-borde bg-white p-4 shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-6 w-6 shrink-0 text-terracota" aria-hidden="true" />
                    <div className="min-w-0">
                      <h2 className="mb-0 font-display text-xl leading-snug text-verde">{m.titulo}</h2>
                      {detalles.length > 0 && <p className="mt-0.5 text-xs text-verde-suave">{detalles.join(' · ')}</p>}
                      {m.descripcion && <p className="mt-2 text-sm text-verde-tipografia">{m.descripcion}</p>}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={urlManual(m.id, 'pdf')}
                      target="_blank"
                      rel="noopener"
                      data-testid={`manual-pdf-${m.id}`}
                      className={`${CLASE_BOTON} bg-terracota text-white hover:bg-terracota-dark hover:text-white`}
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Abrir PDF
                    </a>
                    <a
                      href={urlManual(m.id, 'pdf', true)}
                      target="_blank"
                      rel="noopener"
                      data-testid={`manual-descargar-${m.id}`}
                      className={`${CLASE_BOTON} border border-neutro-borde bg-white text-verde hover:bg-neutro-light hover:text-verde`}
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Descargar
                    </a>
                    {m.tiene_web && (
                      <a
                        href={urlManual(m.id, 'web')}
                        target="_blank"
                        rel="noopener"
                        data-testid={`manual-web-${m.id}`}
                        className={`${CLASE_BOTON} border border-neutro-borde bg-white text-verde hover:bg-neutro-light hover:text-verde`}
                      >
                        <Globe className="h-4 w-4" aria-hidden="true" />
                        Ver en el navegador
                      </a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
