'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  AlertTriangle,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Tags,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type {
  ItemCatalogo,
  ItemCatalogoPatch,
  ListaCatalogo,
  ResultadoBorrarCatalogo,
  TipoCatalogo,
} from '@/types/planeacion'
import AdminTopbar from '../components/AdminTopbar'
import ModalItemCatalogo from './components/ModalItemCatalogo'
import { CATALOGOS, NOMBRE_SINGULAR, etiquetaTipo } from './components/catalogo-config'

// Catálogos de reservas (PS1, 30-sep): fuentes (canales y personas que traen la
// reserva), chinampas y cocinas/chefs. Los usan el asistente de reservas, el
// detalle y la planeación semanal. Con uso, borrar ARCHIVA (activo=false).
export default function CatalogosPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [tipo, setTipo] = useState<TipoCatalogo>('fuentes')
  const [mostrarArchivados, setMostrarArchivados] = useState(false)
  const [items, setItems] = useState<ItemCatalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // Modal crear/editar: undefined = cerrado, null = crear
  const [editando, setEditando] = useState<ItemCatalogo | null | undefined>(undefined)
  const [toggling, setToggling] = useState<string | null>(null)
  // Confirmación de borrado dentro de la página (el visor no muestra confirm())
  const [porBorrar, setPorBorrar] = useState<ItemCatalogo | null>(null)
  const [borrando, setBorrando] = useState(false)
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null)

  // Descarta respuestas viejas si cambian pestaña o filtro a media carga
  const peticionRef = useRef(0)

  const fetchItems = useCallback(
    async (silent = false) => {
      if (!token) return
      const id = ++peticionRef.current
      if (!silent) setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ incluir_inactivos: String(mostrarArchivados) })
        const res = await fetch(`${API_URL}/api/admin/catalogos/${tipo}?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(extraerMensajeError(payload, res.status))
        }
        const data = (await res.json()) as ListaCatalogo
        if (id === peticionRef.current) setItems(data.items ?? [])
      } catch (err) {
        if (id === peticionRef.current) {
          setError(err instanceof Error ? err.message : 'Error al cargar el catálogo')
          if (!silent) setItems([])
        }
      } finally {
        if (id === peticionRef.current && !silent) setLoading(false)
      }
    },
    [token, tipo, mostrarArchivados],
  )

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const cambiarTipo = (nuevo: TipoCatalogo) => {
    if (nuevo === tipo) return
    setTipo(nuevo)
    setItems([])
    setMensaje(null)
  }

  const ordenSugerido = useMemo(
    () => (items.length > 0 ? Math.max(...items.map((i) => i.orden)) + 1 : 1),
    [items],
  )

  const handleToggleActivo = async (item: ItemCatalogo) => {
    if (!token) return
    setToggling(item.id)
    setError(null)
    try {
      const patch: ItemCatalogoPatch = { activo: !item.activo }
      const res = await fetch(`${API_URL}/api/admin/catalogos/${tipo}/${item.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      // Se actualiza en su fila, sin recargar: aunque «Mostrar archivados» esté
      // apagado, el item no desaparece de golpe y se puede volver a encender.
      const actualizado = (await res.json()) as ItemCatalogo
      setItems((prev) => prev.map((i) => (i.id === item.id ? actualizado : i)))
      setMensaje(
        actualizado.activo
          ? `«${actualizado.nombre}» activo: ya se ofrece al capturar reservas.`
          : `«${actualizado.nombre}» archivado: ya no se ofrece. Lo guardado en reservas se conserva.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado')
    } finally {
      setToggling(null)
    }
  }

  const handleGuardado = (guardado: ItemCatalogo, creado: boolean) => {
    setEditando(undefined)
    setMensaje(creado ? `«${guardado.nombre}» creado.` : `«${guardado.nombre}» actualizado.`)
    if (creado) {
      // El orden lo decide el backend (orden, nombre): recarga silenciosa
      fetchItems(true)
    } else {
      setItems((prev) => prev.map((i) => (i.id === guardado.id ? guardado : i)))
    }
  }

  const abrirBorrar = (item: ItemCatalogo) => {
    setErrorBorrar(null)
    setPorBorrar(item)
  }

  const confirmarBorrar = async () => {
    if (!token || !porBorrar) return
    setBorrando(true)
    setErrorBorrar(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/catalogos/${tipo}/${porBorrar.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data = (await res.json()) as ResultadoBorrarCatalogo
      const id = porBorrar.id
      if (data.eliminado) {
        setItems((prev) => prev.filter((i) => i.id !== id))
      } else if (data.archivado) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, activo: false } : i)))
      }
      setMensaje(data.mensaje || (data.eliminado ? 'Eliminado.' : 'Archivado.'))
      setPorBorrar(null)
    } catch (err) {
      setErrorBorrar(err instanceof Error ? err.message : 'Error al borrar')
    } finally {
      setBorrando(false)
    }
  }

  const conTipo = tipo !== 'chinampas'
  const conPersona = tipo === 'fuentes'
  const columnas = 5 + (conTipo ? 1 : 0) + (conPersona ? 1 : 0)
  const singular = NOMBRE_SINGULAR[tipo]
  const etiquetaCatalogo = CATALOGOS.find((c) => c.tipo === tipo)?.label ?? tipo

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-terracota/10">
              <Tags className="h-6 w-6 text-terracota" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-verde">Catálogos de reservas</h1>
              <p className="text-sm text-verde-suave mt-1">
                Fuentes, chinampas y cocinas que se eligen al capturar una reserva
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditando(null)}
            data-testid="catalogos-nuevo"
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg shadow-terracota transition-colors font-medium"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva {singular}
          </button>
        </header>

        {/* Pestañas */}
        <div className="border-b border-neutro-borde flex gap-1 overflow-x-auto" role="tablist">
          {CATALOGOS.map((c) => {
            const activa = tipo === c.tipo
            return (
              <button
                key={c.tipo}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => cambiarTipo(c.tipo)}
                data-testid={`catalogos-tab-${c.tipo}`}
                className={`px-4 py-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  activa
                    ? 'border-terracota text-terracota font-semibold'
                    : 'border-transparent text-verde-suave hover:text-verde'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <label
            htmlFor="catalogos-archivados"
            className="flex items-center gap-2 text-sm text-verde cursor-pointer whitespace-nowrap"
          >
            <input
              id="catalogos-archivados"
              type="checkbox"
              checked={mostrarArchivados}
              onChange={(e) => setMostrarArchivados(e.target.checked)}
              data-testid="catalogos-archivados"
              className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
            />
            Mostrar archivados
          </label>
          <button
            type="button"
            onClick={() => fetchItems()}
            aria-label={`Actualizar ${etiquetaCatalogo.toLowerCase()}`}
            className="inline-flex items-center gap-2 px-3 py-2 border border-neutro-borde rounded-lg text-sm text-verde hover:bg-neutro-light"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        {mensaje && (
          <div
            role="status"
            data-testid="catalogos-mensaje"
            className="bg-verde/10 border border-verde/30 rounded-lg p-3 flex items-center gap-2 text-sm text-verde"
          >
            <span>{mensaje}</span>
            <button
              type="button"
              onClick={() => setMensaje(null)}
              className="ml-auto p-1 rounded hover:bg-verde/10"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            data-testid="catalogos-error"
            className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 flex items-center gap-2 text-sm text-rojo"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchItems()}
              className="ml-auto text-xs bg-rojo/10 px-2 py-1 rounded hover:bg-rojo/20"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-lg border border-neutro-borde overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="catalogos-tabla">
              <thead>
                <tr className="bg-neutro-light border-b border-neutro-borde text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-verde">
                    Nombre
                  </th>
                  {conTipo && (
                    <th scope="col" className="px-4 py-3 font-medium text-verde">
                      Tipo
                    </th>
                  )}
                  {conPersona && (
                    <th scope="col" className="px-4 py-3 font-medium text-verde">
                      Persona ligada
                    </th>
                  )}
                  <th scope="col" className="px-4 py-3 font-medium text-verde text-center">
                    En uso
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde text-center">
                    Activo
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde text-center">
                    Orden
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columnas} className="px-4 py-12">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-terracota" aria-hidden="true" />
                        <span className="ml-3 text-sm text-verde-suave">
                          Cargando {etiquetaCatalogo.toLowerCase()}...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnas}
                      className="px-4 py-12 text-center text-verde-suave"
                      data-testid="catalogos-vacio"
                    >
                      <Tags className="h-10 w-10 mx-auto text-neutro-gris mb-3" aria-hidden="true" />
                      <p className="font-medium">
                        {error
                          ? 'No se pudo cargar el catálogo.'
                          : mostrarArchivados
                            ? `No hay ${etiquetaCatalogo.toLowerCase()} todavía.`
                            : `No hay ${etiquetaCatalogo.toLowerCase()} activas.`}
                      </p>
                      {!error && (
                        <button
                          type="button"
                          onClick={() => setEditando(null)}
                          className="mt-3 text-sm text-terracota underline hover:text-terracota-dark"
                        >
                          Crear la primera {singular}
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      data-testid={`catalogos-fila-${item.id}`}
                      className={`border-b border-neutro-borde hover:bg-neutro-light/50 ${
                        item.activo ? '' : 'bg-neutro-light/40'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className={`font-medium ${item.activo ? 'text-verde' : 'text-verde-suave'}`}>
                          {item.nombre}
                        </span>
                        {!item.activo && (
                          <span className="ml-2 inline-block rounded-full text-xs px-2 py-0.5 bg-neutro-borde text-verde-suave">
                            Archivado
                          </span>
                        )}
                      </td>
                      {conTipo && (
                        <td className="px-4 py-3 text-verde">{etiquetaTipo(tipo, item.tipo)}</td>
                      )}
                      {conPersona && (
                        <td className="px-4 py-3 text-verde-suave">
                          {item.tipo === 'persona'
                            ? item.personal_nombre ?? <span className="italic">Sin ligar</span>
                            : '—'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center tabular-nums text-verde">
                        {item.en_uso}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActivo(item)}
                          disabled={toggling === item.id}
                          aria-label={`${item.activo ? 'Archivar' : 'Activar'} ${item.nombre}`}
                          aria-pressed={item.activo}
                          title={
                            item.activo
                              ? 'Se ofrece al capturar reservas. Clic para archivarlo.'
                              : 'No se ofrece. Clic para volver a ofrecerlo.'
                          }
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs disabled:opacity-50 ${
                            item.activo
                              ? 'bg-verde/10 text-verde hover:bg-verde/20'
                              : 'bg-neutro-light text-verde-suave hover:bg-neutro-borde/40'
                          }`}
                        >
                          {toggling === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : item.activo ? (
                            <ToggleRight className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                          )}
                          {item.activo ? 'Activo' : 'Archivado'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums text-verde-suave">
                        {item.orden}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditando(item)}
                            aria-label={`Editar ${item.nombre}`}
                            className="p-2 text-verde hover:bg-verde/10 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirBorrar(item)}
                            aria-label={`Borrar ${item.nombre}`}
                            className="p-2 text-rojo hover:bg-rojo/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && items.length > 0 && (
            <div className="px-4 py-3 bg-neutro-light border-t border-neutro-borde text-sm text-verde-suave">
              {items.length} {items.length === 1 ? singular : etiquetaCatalogo.toLowerCase()}
              {mostrarArchivados ? ' (incluye archivadas)' : ''}
            </div>
          )}
        </div>
      </div>

      {editando !== undefined && (
        <ModalItemCatalogo
          key={`${tipo}-${editando?.id ?? 'nuevo'}`}
          tipoCatalogo={tipo}
          item={editando}
          ordenSugerido={ordenSugerido}
          onClose={() => setEditando(undefined)}
          onSaved={handleGuardado}
        />
      )}

      {porBorrar && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-32 pb-8 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !borrando) setPorBorrar(null)
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="catalogos-borrar-titulo"
            aria-describedby="catalogos-borrar-texto"
            data-testid="catalogos-confirmar-borrar"
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="px-6 py-4 border-b border-neutro-borde flex items-center justify-between">
              <h2
                id="catalogos-borrar-titulo"
                className="font-display text-xl text-verde flex items-center gap-2"
              >
                <AlertTriangle className="h-5 w-5 text-rojo" aria-hidden="true" />
                Borrar «{porBorrar.nombre}»
              </h2>
              <button
                type="button"
                onClick={() => setPorBorrar(null)}
                disabled={borrando}
                aria-label="Cerrar confirmación"
                className="p-2 hover:bg-neutro-light rounded-lg"
              >
                <X className="h-5 w-5 text-verde-suave" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p id="catalogos-borrar-texto" className="text-sm text-verde">
                {porBorrar.en_uso > 0
                  ? `Está en uso en ${porBorrar.en_uso} ${porBorrar.en_uso === 1 ? 'registro' : 'registros'}: no se borra, se archiva (deja de ofrecerse y lo guardado se conserva).`
                  : 'No está en uso: se borrará definitivamente.'}
              </p>
              {errorBorrar && (
                <div
                  role="alert"
                  className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo"
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{errorBorrar}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutro-borde">
              <button
                type="button"
                onClick={() => setPorBorrar(null)}
                disabled={borrando}
                className="px-4 py-2 text-verde border border-neutro-borde rounded-lg text-sm hover:bg-neutro-light disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarBorrar}
                disabled={borrando}
                data-testid="catalogos-confirmar-borrar-si"
                className="inline-flex items-center gap-2 bg-rojo hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {borrando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {porBorrar.en_uso > 0 ? 'Archivar' : 'Borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
