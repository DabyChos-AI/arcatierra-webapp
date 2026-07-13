'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Warehouse, Package, AlertTriangle, DollarSign,
  Search, ChevronLeft, ChevronRight, X, History,
  Save, Loader2, BarChart3
} from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'

// --- Tipos ---

interface ProductoInventario {
  itemcode: string
  nombre: string
  categoria: string
  precio_unitario: number
  stock_actual: number
  unidad_medida: string
  imagen_url: string | null
  visible_web: boolean
}

interface Metricas {
  total_productos: number
  sin_stock: number
  stock_bajo: number
  valor_inventario: number
  categorias_count: number
}

interface Movimiento {
  id: number
  cantidad_anterior: number
  cantidad_nueva: number
  motivo: string
  usuario_id: string | null
  created_at: string
}

// --- Componente principal ---

export default function AdminInventarioPage() {
  // Estado principal
  const [items, setItems] = useState<ProductoInventario[]>([])
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Paginacion
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 20

  // Filtros
  const [filtro, setFiltro] = useState<'todos' | 'sin_stock' | 'stock_bajo'>('todos')
  const [categoria, setCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaInput, setBusquedaInput] = useState('')

  // Modal de ajuste
  const [modalOpen, setModalOpen] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoInventario | null>(null)
  const [cantidadNueva, setCantidadNueva] = useState<number>(0)
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  // Historial de movimientos
  const [verHistorial, setVerHistorial] = useState(false)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loadingMovimientos, setLoadingMovimientos] = useState(false)

  // Categorias unicas extraidas de items
  const categoriasUnicas = Array.from(new Set(items.map(i => i.categoria).filter(Boolean))).sort()

  // --- Fetch metricas ---
  const fetchMetricas = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inventario/metricas')
      if (!res.ok) throw new Error('Error al cargar metricas')
      const data = await res.json()
      setMetricas(data)
    } catch {
      // silencioso, metricas son secundarias
    }
  }, [])

  // --- Fetch items ---
  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (filtro !== 'todos') params.set('filtro', filtro)
      if (categoria) params.set('categoria', categoria)
      if (busqueda) params.set('search', busqueda)

      const res = await fetch(`/api/admin/inventario?${params}`)
      if (!res.ok) throw new Error('Error al cargar inventario')
      const data = await res.json()
      setItems(data.items || [])
      setTotalCount(data.total || 0)
      setTotalPages(data.pages || 1)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, filtro, categoria, busqueda])

  useEffect(() => {
    fetchItems()
    fetchMetricas()
  }, [fetchItems, fetchMetricas])

  // Reset page al cambiar filtros
  useEffect(() => {
    setPage(1)
  }, [filtro, categoria, busqueda])

  // --- Busqueda con debounce ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusqueda(busquedaInput)
    }, 400)
    return () => clearTimeout(timer)
  }, [busquedaInput])

  // --- Abrir modal ---
  const abrirModal = (producto: ProductoInventario) => {
    setProductoSeleccionado(producto)
    setCantidadNueva(producto.stock_actual)
    setMotivo('')
    setErrorModal(null)
    setVerHistorial(false)
    setMovimientos([])
    setModalOpen(true)
  }

  // --- Guardar ajuste ---
  const guardarAjuste = async () => {
    if (!productoSeleccionado) return
    if (!motivo.trim()) {
      setErrorModal('El motivo es obligatorio')
      return
    }
    setGuardando(true)
    setErrorModal(null)
    try {
      const res = await fetch(`/api/admin/inventario/${productoSeleccionado.itemcode}/ajuste`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad_nueva: cantidadNueva, motivo: motivo.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Error al guardar ajuste')
      }
      setModalOpen(false)
      fetchItems()
      fetchMetricas()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setErrorModal(message)
    } finally {
      setGuardando(false)
    }
  }

  // --- Cargar historial ---
  const cargarHistorial = async () => {
    if (!productoSeleccionado) return
    setLoadingMovimientos(true)
    setVerHistorial(true)
    try {
      const res = await fetch(`/api/admin/inventario/${productoSeleccionado.itemcode}/movimientos?limit=20`)
      if (!res.ok) throw new Error('Error al cargar historial')
      const data = await res.json()
      setMovimientos(data.movimientos || [])
    } catch {
      setMovimientos([])
    } finally {
      setLoadingMovimientos(false)
    }
  }

  // --- Badge de estado de stock ---
  const stockBadge = (stock: number) => {
    if (stock === 0) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Sin stock</span>
    if (stock <= 5) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Bajo</span>
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">OK</span>
  }

  // --- Formato moneda ---
  const formatMXN = (valor: number) =>
    valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Titulo */}
      <div className="flex items-center gap-3">
        <Warehouse className="h-7 w-7 text-[#33503E]" />
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">
                {metricas ? metricas.total_productos.toLocaleString('es-MX') : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sin Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {metricas ? metricas.sin_stock.toLocaleString('es-MX') : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-600">
                {metricas ? metricas.stock_bajo.toLocaleString('es-MX') : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900">
                {metricas ? formatMXN(metricas.valor_inventario) : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Botones de filtro */}
          <div className="flex gap-2">
            {(['todos', 'sin_stock', 'stock_bajo'] as const).map((f) => {
              const labels = { todos: 'Todos', sin_stock: 'Sin Stock', stock_bajo: 'Stock Bajo' }
              return (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filtro === f
                      ? 'bg-[#33503E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {labels[f]}
                </button>
              )
            })}
          </div>

          {/* Dropdown categoria */}
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
          >
            <option value="">Todas las categorias</option>
            {categoriasUnicas.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Busqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#33503E] animate-spin" />
            <span className="ml-3 text-gray-500">Cargando inventario...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-600">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>{error}</p>
            <button
              onClick={fetchItems}
              className="mt-3 px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Reintentar
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Package className="h-8 w-8 mb-2" />
            <p>No se encontraron productos con los filtros actuales</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr
                      key={item.itemcode}
                      onClick={() => abrirModal(item)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.imagen_url ? (
                            <img
                              src={item.imagen_url}
                              alt={item.nombre}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
                            <p className="text-xs text-gray-500">{item.itemcode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.categoria || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                        {item.stock_actual.toLocaleString('es-MX')} {item.unidad_medida || ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {formatMXN(item.precio_unitario)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {stockBadge(item.stock_actual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginacion */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {totalCount.toLocaleString('es-MX')} producto{totalCount !== 1 ? 's' : ''} en total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Pagina {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de ajuste */}
      {modalOpen && productoSeleccionado && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setModalOpen(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{productoSeleccionado.nombre}</h2>
                  <p className="text-sm text-gray-500">{productoSeleccionado.itemcode}</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {!verHistorial ? (
                  <>
                    {/* Info actual */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Stock actual</p>
                        <p className="text-xl font-bold text-gray-900">
                          {productoSeleccionado.stock_actual.toLocaleString('es-MX')} {productoSeleccionado.unidad_medida || ''}
                        </p>
                      </div>
                      {stockBadge(productoSeleccionado.stock_actual)}
                    </div>

                    {/* Input cantidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva cantidad
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={cantidadNueva}
                        onChange={(e) => setCantidadNueva(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33503E] focus:border-transparent"
                      />
                    </div>

                    {/* Motivo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Recepcion de mercancia, ajuste por inventario fisico..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33503E] focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Error */}
                    {errorModal && (
                      <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                        {errorModal}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-3">
                      <button
                        onClick={guardarAjuste}
                        disabled={guardando}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#33503E] text-white rounded-lg hover:bg-[#2a4233] disabled:opacity-50 font-medium transition-colors"
                      >
                        {guardando ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Guardar ajuste
                      </button>
                      <button
                        onClick={cargarHistorial}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        <History className="h-4 w-4" />
                        Ver historial
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Vista historial */}
                    <button
                      onClick={() => setVerHistorial(false)}
                      className="text-sm text-[#33503E] hover:underline font-medium"
                    >
                      &larr; Volver al ajuste
                    </button>

                    <h3 className="text-sm font-semibold text-gray-700">Historial de movimientos</h3>

                    {loadingMovimientos ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 text-[#33503E] animate-spin" />
                      </div>
                    ) : movimientos.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">
                        No hay movimientos registrados
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {movimientos.map((mov) => {
                          const diff = mov.cantidad_nueva - mov.cantidad_anterior
                          return (
                            <div
                              key={mov.id}
                              className="p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {diff >= 0 ? '+' : ''}{diff}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatFechaHoraMexico(mov.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">
                                {mov.cantidad_anterior} &rarr; {mov.cantidad_nueva}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{mov.motivo}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
