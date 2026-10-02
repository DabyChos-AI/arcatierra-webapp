'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  AlertTriangle,
  CalendarOff,
  Edit2,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { hoyMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type { DiaNoHabilAdmin, ListaDiasNoHabilesAdmin, ResultadoDiaNoHabil } from '@/types/datos-cliente'
import ModalDiaSinEntrega from './components/ModalDiaSinEntrega'
import ResultadoDiaSinEntrega from './components/ResultadoDiaSinEntrega'
import {
  ETIQUETA_ORIGEN,
  conDiaGuardado,
  diaDeLaSemana,
  fechaLarga,
  normalizarLista,
  normalizarResultado,
  textoUltimoCambio,
} from './components/dias-sin-entrega'

type Filtro = 'proximos' | 'todos'

type EstadoCarga =
  | { tipo: 'cargando' }
  | { tipo: 'ok' }
  | { tipo: 'sin_permiso'; mensaje: string }
  | { tipo: 'error'; mensaje: string }

/**
 * R6 · M10 — Días sin entrega (DR19, M10-a, M10-b; sesión 46, 2-oct-2026).
 * Feriados de ley (LFT art. 74, cargados hasta 2030) + los que agregue el equipo. Un día ACTIVO = no se entrega: las
 * canastas de suscripción se corren solas al siguiente día hábil y los pedidos de la tienda NO se mueven (al guardar
 * se listan para avisarles). Ven quienes tienen `entregas`; solo edita quien tiene `dias_sin_entrega` (`puede_editar`).
 * API: GET/POST `/api/admin/dias-no-habiles`, PATCH `/api/admin/dias-no-habiles/{fecha}` (Bearer, como el resto del panel).
 */
export default function DiasSinEntregaPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [lista, setLista] = useState<ListaDiasNoHabilesAdmin | null>(null)
  const [carga, setCarga] = useState<EstadoCarga>({ tipo: 'cargando' })
  const [filtro, setFiltro] = useState<Filtro>('proximos')
  // Modal: undefined = cerrado, null = agregar, un día = editar su motivo
  const [modal, setModal] = useState<DiaNoHabilAdmin | null | undefined>(undefined)
  const [resultado, setResultado] = useState<ResultadoDiaNoHabil | null>(null)
  const [cambiando, setCambiando] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const peticionRef = useRef(0)

  const hoy = hoyMexico()

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!token) return
      const id = ++peticionRef.current
      if (!silencioso) setCarga({ tipo: 'cargando' })
      try {
        const res = await fetch(`${API_URL}/api/admin/dias-no-habiles`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload: unknown = await res.json().catch(() => null)
        if (id !== peticionRef.current) return
        if (res.status === 401 || res.status === 403) {
          setLista(null)
          setCarga({ tipo: 'sin_permiso', mensaje: extraerMensajeError(payload, res.status) })
          return
        }
        if (!res.ok) {
          setCarga({ tipo: 'error', mensaje: extraerMensajeError(payload, res.status) })
          return
        }
        const datos = normalizarLista(payload)
        if (!datos) {
          setCarga({ tipo: 'error', mensaje: 'respuesta inesperada del servidor' })
          return
        }
        setLista(datos)
        setCarga({ tipo: 'ok' })
      } catch {
        if (id === peticionRef.current) setCarga({ tipo: 'error', mensaje: 'sin conexión con el servidor' })
      }
    },
    [token],
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  const puedeEditar = lista?.puede_editar === true

  const visibles = useMemo(() => {
    const dias = lista?.dias ?? []
    return filtro === 'proximos' ? dias.filter((d) => d.fecha >= hoy) : dias
  }, [lista, filtro, hoy])

  const aplicarResultado = useCallback((r: ResultadoDiaNoHabil) => {
    setLista((prev) => (prev ? { ...prev, dias: conDiaGuardado(prev.dias, r.dia) } : prev))
    setResultado(r)
  }, [])

  const alGuardar = useCallback(
    (r: ResultadoDiaNoHabil) => {
      setModal(undefined)
      setErrorAccion(null)
      aplicarResultado(r)
    },
    [aplicarResultado],
  )

  const cerrarModal = useCallback(() => setModal(undefined), [])

  // Activar = no se entrega ese día; desactivar = sí se entrega. Solo se manda `activo` (el motivo no cambia).
  async function cambiarActivo(dia: DiaNoHabilAdmin) {
    if (!token || cambiando) return
    setCambiando(dia.fecha)
    setErrorAccion(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/dias-no-habiles/${encodeURIComponent(dia.fecha)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !dia.activo }),
      })
      const payload: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        setErrorAccion(
          `No se pudo ${dia.activo ? 'desactivar' : 'activar'} el ${fechaLarga(dia.fecha)}: ${extraerMensajeError(payload, res.status)}`,
        )
        return
      }
      const r = normalizarResultado(payload)
      if (!r) {
        setErrorAccion('Se guardó, pero la respuesta no trae el resultado. Pulsa «Actualizar» para ver la lista.')
        return
      }
      aplicarResultado(r)
    } catch {
      setErrorAccion('Sin conexión con el servidor. Intenta de nuevo.')
    } finally {
      setCambiando(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado: a 390 el botón baja de renglón (flex-wrap + gap) */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-terracota/10 shrink-0">
            <CalendarOff className="h-6 w-6 text-terracota" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl text-verde m-0">Días sin entrega</h1>
            <p className="text-sm text-verde-suave mt-1">
              Feriados de ley y los días que agregue el equipo. Las canastas de suscripción se corren al siguiente
              día hábil; los pedidos de la tienda no se mueven.
            </p>
          </div>
        </div>
        {puedeEditar && (
          <button
            type="button"
            data-testid="dsn-agregar"
            onClick={() => setModal(null)}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg shadow-terracota transition-colors font-medium"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar día sin entrega
          </button>
        )}
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-neutro-borde bg-white p-1" role="group" aria-label="Qué días mostrar">
          {(
            [
              ['proximos', 'Próximos'],
              ['todos', 'Todos (desde hace un mes)'],
            ] as const
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              data-testid={`dsn-filtro-${valor}`}
              aria-pressed={filtro === valor}
              onClick={() => setFiltro(valor)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                filtro === valor ? 'bg-verde text-white font-medium' : 'text-verde hover:bg-neutro-light'
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
        <button
          type="button"
          data-testid="dsn-actualizar"
          onClick={() => cargar()}
          aria-label="Actualizar días sin entrega"
          className="inline-flex items-center gap-2 px-3 py-2 border border-neutro-borde rounded-lg text-sm text-verde bg-white hover:bg-neutro-light"
        >
          <RefreshCw className={`h-4 w-4 ${carga.tipo === 'cargando' ? 'animate-spin' : ''}`} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {carga.tipo === 'ok' && !puedeEditar && (
        <p
          data-testid="dsn-solo-lectura"
          className="flex items-start gap-2 text-sm text-verde-suave bg-neutro-light border border-neutro-borde rounded-lg p-3"
        >
          <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          Solo un administrador puede agregar o cambiar días sin entrega. Aquí puedes consultarlos.
        </p>
      )}

      {resultado && <ResultadoDiaSinEntrega resultado={resultado} onCerrar={() => setResultado(null)} />}

      {errorAccion && (
        <div
          role="alert"
          data-testid="dsn-error-accion"
          className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 flex items-start gap-2 text-sm text-rojo"
        >
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 min-w-0">{errorAccion}</span>
          <button
            type="button"
            onClick={() => setErrorAccion(null)}
            aria-label="Cerrar aviso"
            className="p-1 rounded hover:bg-rojo/10 shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {carga.tipo === 'sin_permiso' && (
        <div
          role="alert"
          data-testid="dsn-sin-permiso"
          className="bg-rojo-bg border border-rojo/30 rounded-lg p-4 flex items-start gap-2 text-sm text-rojo"
        >
          <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            No tienes permiso para ver los días sin entrega (se necesita el permiso «Entregas»). {carga.mensaje}
          </span>
        </div>
      )}

      {carga.tipo === 'error' && (
        <div
          role="alert"
          data-testid="dsn-error"
          className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 flex flex-wrap items-center gap-2 text-sm text-rojo"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 min-w-0">No se pudo cargar la lista ({carga.mensaje}).</span>
          <button
            type="button"
            data-testid="dsn-reintentar"
            onClick={() => cargar()}
            className="text-xs bg-rojo/10 px-2 py-1 rounded hover:bg-rojo/20 shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}

      {carga.tipo !== 'sin_permiso' && (
        <div className="bg-white rounded-lg border border-neutro-borde overflow-hidden">
          {carga.tipo === 'cargando' && !lista ? (
            <div data-testid="dsn-cargando" role="status" className="flex items-center justify-center px-4 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-terracota" aria-hidden="true" />
              <span className="ml-3 text-sm text-verde-suave">Cargando días sin entrega…</span>
            </div>
          ) : visibles.length === 0 ? (
            <div data-testid="dsn-vacio" className="px-4 py-12 text-center text-verde-suave">
              <CalendarOff className="h-10 w-10 mx-auto text-neutro-gris mb-3" aria-hidden="true" />
              <p className="font-medium">
                {carga.tipo === 'error'
                  ? 'No se pudo cargar la lista.'
                  : filtro === 'proximos'
                    ? 'No hay días sin entrega próximos.'
                    : 'No hay días sin entrega.'}
              </p>
            </div>
          ) : (
            // Una sola tabla: desde md es tabla; a 390 cada fila es una tarjeta (sin desplazamiento lateral)
            <table data-testid="dsn-lista" className="w-full text-sm">
              <thead className="hidden md:table-header-group">
                <tr className="bg-neutro-light border-b border-neutro-borde text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Fecha</th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Día</th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Motivo</th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Origen</th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Estado</th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Último cambio</th>
                  {puedeEditar && (
                    <th scope="col" className="px-4 py-3 font-medium text-verde text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {visibles.map((dia) => {
                  const pasado = dia.fecha < hoy
                  const ocupado = cambiando === dia.fecha
                  return (
                    <tr
                      key={dia.fecha}
                      data-testid={`dsn-fila-${dia.fecha}`}
                      data-activo={dia.activo ? '1' : '0'}
                      data-origen={dia.origen}
                      className={`block md:table-row border-b border-neutro-borde last:border-b-0 px-4 py-3 md:p-0 ${
                        dia.activo ? '' : 'bg-neutro-light/50'
                      }`}
                    >
                      <td className="block md:table-cell md:px-4 md:py-3">
                        <span data-testid="dsn-fecha-larga" className="font-medium text-verde md:whitespace-nowrap">
                          {fechaLarga(dia.fecha)}
                        </span>
                        {pasado && (
                          <span className="ml-2 inline-block rounded-full text-xs px-2 py-0.5 bg-neutro-borde text-verde-suave">
                            Ya pasó
                          </span>
                        )}
                      </td>
                      <td className="block md:table-cell md:px-4 md:py-3 text-verde">
                        <span data-testid="dsn-dia">{diaDeLaSemana(dia)}</span>
                      </td>
                      <td className="block md:table-cell md:px-4 md:py-3 text-verde break-words mt-1 md:mt-0">
                        <span className="md:hidden text-xs text-verde-suave">Motivo: </span>
                        <span data-testid="dsn-motivo">{dia.motivo}</span>
                      </td>
                      <td className="inline-block md:table-cell md:px-4 md:py-3 mt-2 md:mt-0 mr-2 md:mr-0">
                        <span
                          data-testid="dsn-origen"
                          className={`inline-block rounded-full text-xs px-2 py-0.5 whitespace-nowrap ${
                            dia.origen === 'lft' ? 'bg-azul-bg text-azul' : 'bg-terracota/10 text-terracota-dark'
                          }`}
                        >
                          {ETIQUETA_ORIGEN[dia.origen]}
                        </span>
                      </td>
                      <td className="inline-block md:table-cell md:px-4 md:py-3 mt-2 md:mt-0">
                        <span
                          data-testid="dsn-estado"
                          className={`inline-block rounded-full text-xs px-2 py-0.5 whitespace-nowrap ${
                            dia.activo ? 'bg-rojo-bg text-rojo' : 'bg-verde/10 text-verde'
                          }`}
                        >
                          {dia.activo ? 'Activo · no se entrega' : 'Inactivo · sí se entrega'}
                        </span>
                      </td>
                      <td className="block md:table-cell md:px-4 md:py-3 text-xs text-verde-suave mt-2 md:mt-0">
                        <span className="md:hidden">Último cambio: </span>
                        <span data-testid="dsn-ultimo-cambio">{textoUltimoCambio(dia)}</span>
                      </td>
                      {puedeEditar && (
                        <td className="block md:table-cell md:px-4 md:py-3 mt-2 md:mt-0">
                          {pasado ? (
                            <span className="text-xs text-verde-suave">—</span>
                          ) : (
                            <div className="flex flex-wrap items-center md:justify-end gap-2">
                              <button
                                type="button"
                                data-testid={`dsn-editar-${dia.fecha}`}
                                onClick={() => setModal(dia)}
                                disabled={ocupado}
                                aria-label={`Editar el motivo del ${fechaLarga(dia.fecha)}`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-verde border border-neutro-borde hover:bg-neutro-light disabled:opacity-50"
                              >
                                <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Editar motivo
                              </button>
                              <button
                                type="button"
                                data-testid={`dsn-activar-${dia.fecha}`}
                                data-accion={dia.activo ? 'desactivar' : 'activar'}
                                onClick={() => cambiarActivo(dia)}
                                disabled={cambiando !== null}
                                aria-pressed={dia.activo}
                                title={
                                  dia.activo
                                    ? 'Desactivar: ese día SÍ se entrega (las canastas regresan a su día).'
                                    : 'Activar: ese día NO se entrega (las canastas se corren al siguiente día hábil).'
                                }
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs disabled:opacity-50 ${
                                  dia.activo
                                    ? 'bg-verde/10 text-verde hover:bg-verde/20'
                                    : 'bg-terracota/10 text-terracota-dark hover:bg-terracota/20'
                                }`}
                              >
                                {ocupado ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                ) : dia.activo ? (
                                  <ToggleRight className="h-3.5 w-3.5" aria-hidden="true" />
                                ) : (
                                  <ToggleLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                {dia.activo ? 'Desactivar (sí entregar)' : 'Activar (no entregar)'}
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {lista && visibles.length > 0 && (
            <p
              data-testid="dsn-contador"
              className="px-4 py-3 bg-neutro-light border-t border-neutro-borde text-sm text-verde-suave m-0"
            >
              {visibles.length} {visibles.length === 1 ? 'día' : 'días'}
              {filtro === 'proximos' ? ' desde hoy' : ' desde hace un mes'}
            </p>
          )}
        </div>
      )}

      {modal !== undefined && token && (
        <ModalDiaSinEntrega
          key={modal?.fecha ?? 'nuevo'}
          token={token}
          dia={modal}
          onClose={cerrarModal}
          onSaved={alGuardar}
        />
      )}
    </div>
  )
}
