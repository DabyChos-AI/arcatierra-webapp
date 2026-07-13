'use client'

import { useState, useEffect } from 'react'
import { Package, TrendingUp, AlertCircle, Plus, Search, Edit2, Trash2, Eye, Upload, X, MapPin } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface Producto {
  id: string;
  itemcode: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  activo: boolean;
  visible_web: boolean;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProductModal, setShowNewProductModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // 🆕 Estados para filtros administrativos
  const [filtros, setFiltros] = useState({
    categoria: 'todas',
    stock: 'todos', // todos, en_stock, stock_bajo, sin_stock
    estado: 'todos', // todos, activo, inactivo
    visible_web: 'todos', // todos, visible, oculto
    order_by: 'nombre', // ✅ API usa order_by
    order: 'asc' // ✅ API usa order (no direccion)
  })
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 200, // ✅ API defecto es 200, máximo 500
    total: 0
  })
  const [categorias, setCategorias] = useState<string[]>([])
  const [agricultores, setAgricultores] = useState<{id: string, nombre: string, ubicacion: string}[]>([])
  const [showNewAgricultorForm, setShowNewAgricultorForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    itemcode: '',
    nombre: '',
    descripcion: '',
    descripcion_larga: '',
    precio: '',
    stock: '',
    categoria: '',
    unidad: 'kg',
    peso: '',
    agricultor: '',
    ubicacion: '',
    direccion: '',
    cp: '',
    telefono: '',
    url_google_maps: '',
    // SEO
    meta_title: '',
    meta_description: '',
    keywords: '',
    // Métricas ambientales
    co2_impacto: '',
    agua_impacto: '',
    plastico_impacto: '',
    // Características
    caracteristicas: [] as string[],
    certificaciones: [] as string[],
    imagenes: [] as string[]
  })

  const [dragActive, setDragActive] = useState(false)
  const [newCaracteristica, setNewCaracteristica] = useState('')
  const [showProductPreview, setShowProductPreview] = useState(false)
  const [selectedProductPreview, setSelectedProductPreview] = useState<Producto | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [showNewCategoriaInput, setShowNewCategoriaInput] = useState(false)
  const [newCategoriaName, setNewCategoriaName] = useState('')
  const [showNewCategoriaInputEdit, setShowNewCategoriaInputEdit] = useState(false)
  const [newCategoriaNameEdit, setNewCategoriaNameEdit] = useState('')

  // 🆕 Estados para estadísticas globales del dashboard
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    enStock: 0,
    stockBajo: 0,
    sinStock: 0
  })

  const fetchProductos = async () => {
    try {
      setLoading(true)
      console.log('🔄 Iniciando fetchProductos con filtros:', filtros)
      
      // 🔧 SOLUCIÓN: Detectar si necesitamos filtrado local
      const needsLocalFilter = (
        filtros.stock === 'stock_bajo' || 
        filtros.stock === 'sin_stock' ||
        filtros.estado !== 'todos' ||
        filtros.visible_web !== 'todos'
      )
      
      let productosApi: Producto[] = []
      
      if (needsLocalFilter) {
        // 🚀 CARGAR TODOS LOS PRODUCTOS para filtrado local
        console.log('🔧 Filtrado local activado - cargando todos los productos...')
        
        const firstResponse = await fetch(`${API_URL}/api/products?limit=200&page=1&solo_disponibles=false&incluir_inactivos=true`)
        const firstData = await firstResponse.json()
        const totalProductos = firstData.total
        const totalPaginas = Math.ceil(totalProductos / 200)
        
        console.log(`📊 Total: ${totalProductos} productos en ${totalPaginas} páginas (incluye inactivos)`)
        
        // Cargar todas las páginas en paralelo
        const promesasPaginas = []
        for (let i = 1; i <= totalPaginas; i++) {
          promesasPaginas.push(
            fetch(`${API_URL}/api/products?limit=200&page=${i}&solo_disponibles=false&incluir_inactivos=true`)
              .then(res => res.json())
          )
        }
        
        const todasPaginas = await Promise.all(promesasPaginas)
        const todosProductos = todasPaginas.flatMap(p => p.items || [])
        
        // Mapear todos los productos
        productosApi = todosProductos.map((p: any) => ({
          id: p.itemcode,
          itemcode: p.itemcode,
          nombre: p.nombre,
          descripcion: p.descripcion || 'Sin descripción',
          precio: parseFloat(p.precio_unitario) || 0,
          stock: parseFloat(p.stock_actual || '0') || 0,
          categoria: p.categoria || 'Sin categoría',
          activo: p.visible_web !== false,
          visible_web: p.visible_web !== false
        }))
        
        console.log(`✅ Cargados ${productosApi.length} productos para filtrado local`)
        
      } else {
        // ✅ PAGINACIÓN NORMAL con API
        const params = new URLSearchParams()
        params.append('page', paginacion.pagina.toString())
        params.append('limit', paginacion.limite.toString())
        
        // Panel admin siempre incluye productos inactivos
        params.append('incluir_inactivos', 'true')
        
        // Filtro de stock
        if (filtros.stock === 'en_stock') {
          params.append('solo_disponibles', 'true')
        } else {
          params.append('solo_disponibles', 'false')
        }
        
        // Búsqueda
        if (searchTerm && searchTerm.trim()) {
          params.append('search', searchTerm.trim())
        }
        
        // Filtro categoría
        if (filtros.categoria && filtros.categoria !== 'todas') {
          params.append('categoria', filtros.categoria)
        }
        
        // Ordenamiento
        if (filtros.order_by) {
          params.append('order_by', filtros.order_by)
        }
        if (filtros.order) {
          params.append('order', filtros.order)
        }
        
        const response = await fetch(`${API_URL}/api/products?${params}`)
        
        if (!response.ok) {
          throw new Error('Error al cargar productos')
        }
        
        const data = await response.json()
        
        // Mapear productos de API
        productosApi = data.items.map((p: any) => ({
          id: p.itemcode,
          itemcode: p.itemcode,
          nombre: p.nombre,
          descripcion: p.descripcion || 'Sin descripción',
          precio: parseFloat(p.precio_unitario) || 0,
          stock: parseFloat(p.stock_actual || '0') || 0,
          categoria: p.categoria || 'Sin categoría',
          activo: p.visible_web !== false,
          visible_web: p.visible_web !== false
        }))
        
        // Usar paginación de API
        setProductos(productosApi)
        setPaginacion(prev => ({ ...prev, total: data.total || productosApi.length }))
        setLoading(false)
        return
      }
      
      if (needsLocalFilter) {
        // 🔧 FILTRADO LOCAL: Aplicar filtros no soportados por API
        let productosFiltrados = productosApi
        
        // Filtro stock bajo (1-10)
        if (filtros.stock === 'stock_bajo') {
          productosFiltrados = productosFiltrados.filter((p: Producto) => {
            const stock = Number(p.stock) || 0
            return stock >= 1 && stock <= 10
          })
        }
        
        // ✅ Filtro sin stock (stock = 0) - FIX: convertir a número
        if (filtros.stock === 'sin_stock') {
          productosFiltrados = productosFiltrados.filter((p: Producto) => {
            const stock = Number(p.stock) || 0
            return stock === 0 || stock <= 0.01 // Considerar 0 o muy cercano a 0
          })
        }
        
        // Filtro estado activo/inactivo
        if (filtros.estado === 'activo') {
          productosFiltrados = productosFiltrados.filter((p: Producto) => p.activo)
        } else if (filtros.estado === 'inactivo') {
          productosFiltrados = productosFiltrados.filter((p: Producto) => !p.activo)
        }
        
        // Filtro visible_web (true/false)
        if (filtros.visible_web === 'visible') {
          productosFiltrados = productosFiltrados.filter((p: Producto) => p.visible_web === true)
        } else if (filtros.visible_web === 'oculto') {
          productosFiltrados = productosFiltrados.filter((p: Producto) => p.visible_web === false)
        }
        
        // 🚀 PAGINACIÓN LOCAL de productos filtrados
        const totalFiltrados = productosFiltrados.length
        const inicio = (paginacion.pagina - 1) * paginacion.limite
        const fin = inicio + paginacion.limite
        const productosPagina = productosFiltrados.slice(inicio, fin)
        
        // 🐛 FIX CRÍTICO: Establecer productos filtrados en el estado
        setProductos(productosPagina)
        setPaginacion(prev => ({ ...prev, total: totalFiltrados }))
        
        console.log(`🔧 Filtrado local: ${productosPagina.length}/${totalFiltrados} productos mostrados`)
      }
      
    } catch (error) {
      console.error('⚠️ Error cargando productos:', error)
      console.log('⚠️ Error cargando productos, mostrando array vacío')
      setProductos([])
    } finally {
      setLoading(false)
      console.log('✅ fetchProductos finalizado, loading = false')
    }
  }

  // ✅ Cargar categorías desde endpoint oficial
  const fetchCategorias = async () => {
    try {
      console.log('🔄 Cargando categorías desde /api/products/categories')
      const response = await fetch(`${API_URL}/api/products/categories`)
      console.log('🌐 Response categorías:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📄 Data categorías recibida:', data)
        
        // ✅ CORRECCIÓN: La API devuelve array de objetos con propiedad 'categoria'
        const categoriasLimpias = data
          .map((item: any) => item.categoria || item.nombre || String(item))
          .filter((c: string) => c && c.trim() !== '' && c !== 'Sin categoría' && c !== 'null')
          .sort()
        
        // ✅ FORZAR RE-RENDER: Crear nuevo array para triggear useState
        const categoriasFinales = ['todas', ...categoriasLimpias]
        setCategorias([...categoriasFinales]) // Forzar nuevo array
        
        console.log(`✅ 📂 Cargadas ${categoriasLimpias.length} categorías:`, categoriasLimpias.slice(0, 5))
        console.log('🎯 Estado categorías actualizado, debe mostrar en dropdown')
      } else {
        console.error('❌ Error en response categorías:', response.status)
        setCategorias(['todas']) // Fallback con al menos "todas"
      }
    } catch (error) {
      console.error('⚠️ Error cargando categorías:', error)
      setCategorias(['todas']) // Fallback con al menos "todas"
    }
  }

  useEffect(() => {
    console.log('🔄 Inicializando componente - cargando categorías')
    fetchCategorias() // Cargar categorías una sola vez
  }, [])

  // 🔧 Cargar estadísticas globales (independiente de filtros)
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        console.log('📊 Cargando estadísticas dashboard...')
        // Obtener total y calcular páginas necesarias
        const response = await fetch(`${API_URL}/api/products?limit=1&solo_disponibles=false`)
        const data = await response.json()
        const total = data.total || 0
        const totalPaginas = Math.ceil(total / 200)
        
        console.log(`📄 Cargando ${totalPaginas} páginas de productos...`)
        
        // Cargar TODAS las páginas en paralelo
        const promesasPaginas = []
        for (let i = 1; i <= totalPaginas; i++) {
          promesasPaginas.push(
            fetch(`${API_URL}/api/products?limit=200&page=${i}&solo_disponibles=false`)
              .then(res => res.json())
          )
        }
        
        const todasPaginas = await Promise.all(promesasPaginas)
        const todosProds = todasPaginas.flatMap(p => p.items || [])
        
        console.log(`✅ Cargados ${todosProds.length} productos totales`)
        
        // Calcular estadísticas reales sobre TODOS los productos
        const conStock = todosProds.filter((p: any) => parseFloat(p.stock_actual) > 0).length
        const bajo = todosProds.filter((p: any) => {
          const stock = parseFloat(p.stock_actual)
          return stock > 0 && stock <= 10
        }).length
        const sinStock = todosProds.filter((p: any) => parseFloat(p.stock_actual) <= 0).length
        
        console.log(`✅ Estadísticas: Total=${total}, EnStock=${conStock}, StockBajo=${bajo}, SinStock=${sinStock}`)
        
        setEstadisticas({
          totalProductos: total,
          enStock: conStock,
          stockBajo: bajo,
          sinStock: sinStock
        })
      } catch (error) {
        console.error('❌ Error cargando estadísticas:', error)
      }
    }
    
    fetchEstadisticas()
  }, []) // Solo al montar el componente

  useEffect(() => {
    console.log('🔄 useEffect fetchProductos ejecutándose - filtros:', filtros)
    console.log('🔄 useEffect searchTerm:', searchTerm)
    console.log('🔄 useEffect paginacion:', paginacion.pagina, paginacion.limite)
    fetchProductos()
  }, [filtros.categoria, filtros.stock, filtros.estado, filtros.visible_web, filtros.order_by, filtros.order, searchTerm, paginacion.pagina, paginacion.limite])

  // ✅ Funciones para manejar filtros con parámetros correctos
  const handleFiltroChange = (tipo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [tipo]: valor }))
    // Reset página al cambiar filtros
    setPaginacion(prev => ({ ...prev, pagina: 1 }))
  }

  const handlePaginaChange = (nuevaPagina: number) => {
    setPaginacion(prev => ({ ...prev, pagina: nuevaPagina }))
  }

  // ✅ Los productos ya están filtrados en fetchProductos() - no necesitamos filtrado local adicional
  const productosFiltrados = productos

  const handleDeleteProduct = async (producto: Producto) => {
    if (!confirm(`¿Estás seguro de eliminar "${producto.nombre}"?\n\nEsta acción puede ser permanente.`)) {
      return
    }

    try {
      // Enviar DELETE al backend
      const response = await fetch(`/api/admin/products/${producto.itemcode}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido')
      }

      // Actualizar estado local
      setProductos(productos.filter(p => p.id !== producto.id))
      
      // Mostrar mensaje según el tipo de eliminación
      if (result.soft_delete) {
        alert(`✅ ${result.message}\n\nEl producto fue marcado como no visible porque tiene pedidos asociados.`)
      } else {
        alert(`✅ ${result.message}\n\nEl producto fue eliminado permanentemente.`)
      }
      
    } catch (error: any) {
      console.error('Error eliminando producto:', error)
      alert(`❌ Error al eliminar producto: ${error.message}`)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      // Preparar datos para actualización
      const updateData = {
        nombre: editingProduct.nombre,
        categoria: editingProduct.categoria || null,
        precio_unitario: editingProduct.precio,
        stock_actual: editingProduct.stock,
        descripcion: editingProduct.descripcion || null,
        visible_web: editingProduct.activo
      }

      // Enviar actualización al backend
      const response = await fetch(`/api/admin/products/${editingProduct.itemcode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido')
      }

      // Actualizar estado local con datos actualizados
      const updatedProducts = productos.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      )
      setProductos(updatedProducts)
      
      alert(`✅ Producto "${editingProduct.nombre}" actualizado exitosamente en la base de datos`)
      setShowEditModal(false)
      setEditingProduct(null)
      
    } catch (error: any) {
      console.error('Error actualizando producto:', error)
      alert(`❌ Error al actualizar producto: ${error.message}`)
    }
  }

  const handleCreateProduct = async () => {
    // Validaciones básicas
    if (!newProduct.itemcode || !newProduct.nombre || !newProduct.precio || !newProduct.stock) {
      alert('❌ Por favor completa todos los campos obligatorios (Código, Nombre, Precio, Stock)')
      return
    }

    // Validar que precio y stock sean números válidos
    const precio = parseFloat(newProduct.precio)
    const stock = parseFloat(newProduct.stock)
    
    if (isNaN(precio) || precio <= 0) {
      alert('❌ El precio debe ser un número válido mayor a 0')
      return
    }
    
    if (isNaN(stock) || stock < 0) {
      alert('❌ El stock debe ser un número válido mayor o igual a 0')
      return
    }

    try {
      // Por ahora vamos a usar un token mock ya que estamos en admin
      // En producción, esto debería obtener el JWT del backend admin
      const mockToken = 'admin-token-placeholder'

      // Preparar datos del producto según el schema ProductCreate
      const productoData = {
        itemcode: newProduct.itemcode,
        nombre: newProduct.nombre,
        categoria: newProduct.categoria || null,
        precio_unitario: precio,
        stock_actual: stock,
        unidad_medida: newProduct.unidad || 'kg',
        descripcion: newProduct.descripcion || null
      }

      // Enviar a la API (endpoint especial para admin)
      const createResponse = await fetch('/api/admin/products/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productoData)
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => null)
        throw new Error(errorData?.detail || `HTTP ${createResponse.status}`)
      }

      const response = await createResponse.json()
      
      // Verificar si la respuesta fue exitosa
      if (!response.success) {
        throw new Error(response.error || 'Error desconocido')
      }
      
      const nuevoProducto = response.product
      
      // Convertir respuesta API al formato del frontend
      const productoFrontend: Producto = {
        id: nuevoProducto.itemcode,
        itemcode: nuevoProducto.itemcode,
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion || '',
        precio: nuevoProducto.precio_unitario,
        stock: nuevoProducto.stock_actual,
        categoria: nuevoProducto.categoria || '',
        activo: nuevoProducto.visible_web !== false,
        visible_web: nuevoProducto.visible_web !== false
      }
      
      // Actualizar estado local
      setProductos([productoFrontend, ...productos])
      setShowNewProductModal(false)
      
      // Resetear formulario
      setNewProduct({
        itemcode: '',
        nombre: '',
        descripcion: '',
        descripcion_larga: '',
        precio: '',
        stock: '',
        categoria: '',
        unidad: 'kg',
        peso: '',
        agricultor: '',
        ubicacion: '',
        direccion: '',
        cp: '',
        telefono: '',
        url_google_maps: '',
      // SEO
      meta_title: '',
      meta_description: '',
      keywords: '',
      // Métricas ambientales
      co2_impacto: '',
      agua_impacto: '',
      plastico_impacto: '',
      // Características
      caracteristicas: [] as string[],
      certificaciones: [] as string[],
      imagenes: [] as string[]
    })
    
    alert(`✅ Producto creado exitosamente:\n${nuevoProducto.nombre}\nCódigo: ${nuevoProducto.itemcode}\nPrecio: $${nuevoProducto.precio_unitario}`)
    
    } catch (error: any) {
      console.error('Error creando producto:', error)
      alert(`❌ Error creando producto: ${error.message}`)
    }
  }

  // Drag & Drop para imágenes
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files)
    const imageUrls = fileArray.map(file => URL.createObjectURL(file))
    setNewProduct(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, ...imageUrls]
    }))
  }

  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }))
  }

  const addCaracteristica = () => {
    if (newCaracteristica.trim()) {
      setNewProduct(prev => ({
        ...prev,
        caracteristicas: [...prev.caracteristicas, newCaracteristica.trim()]
      }))
      setNewCaracteristica('')
    }
  }

  const removeCaracteristica = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter((_, i) => i !== index)
    }))
  }

  const totalCategorias = categorias.length || new Set(productos.map(p => p.categoria)).size

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 text-green-600 mr-3" />
            Gestión de Productos
          </h1>
          <p className="text-gray-600 mt-1">Administra el inventario y catálogo de productos</p>
        </div>
        <button 
          onClick={() => setShowNewProductModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.totalProductos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Stock</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.enStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.stockBajo}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-red-300 p-6 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-700">Sin Stock</p>
              <p className="text-2xl font-bold text-red-900">{estadisticas.sinStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">{totalCategorias}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 🆕 Filtros Administrativos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros Administrativos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtro por Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={filtros.categoria}
              onChange={(e) => {
                console.log('🔄 Filtro categoría cambiado a:', e.target.value)
                handleFiltroChange('categoria', e.target.value)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todas">Todas las categorías ({categorias.length - 1})</option>
              {categorias.length <= 1 ? (
                <option value="" disabled>Cargando categorías...</option>
              ) : (
                categorias.filter(cat => cat !== 'todas').map((categoria, index) => (
                  <option key={`${categoria}-${index}`} value={categoria}>
                    {categoria} 
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Filtro por Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
            <select
              value={filtros.stock}
              onChange={(e) => handleFiltroChange('stock', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todos">Todos los stocks</option>
              <option value="en_stock">En stock ({'>'}0)</option>
              <option value="stock_bajo">Stock bajo (1-10)</option>
              <option value="sin_stock">Sin stock (0)</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          {/* Filtro por Visible Web */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visible Web</label>
            <select
              value={filtros.visible_web}
              onChange={(e) => handleFiltroChange('visible_web', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="visible">✅ Visible (tienda)</option>
              <option value="oculto">❌ Oculto</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
            <select
              value={filtros.order_by}
              onChange={(e) => handleFiltroChange('order_by', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="nombre">Nombre</option>
              <option value="precio_unitario">Precio</option>
              <option value="stock_actual">Stock</option>
              <option value="created_at">Fecha creación</option>
            </select>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <select
              value={filtros.order}
              onChange={(e) => handleFiltroChange('order', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="asc">Ascendente ↑</option>
              <option value="desc">Descendente ↓</option>
            </select>
          </div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setFiltros({ categoria: 'todas', stock: 'todos', estado: 'todos', visible_web: 'todos', order_by: 'nombre', order: 'asc' })}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Limpiar filtros
          </button>
          <button
            onClick={() => handleFiltroChange('stock', 'stock_bajo')}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Stock bajo
          </button>
          <button
            onClick={() => handleFiltroChange('estado', 'inactivo')}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
          >
            Inactivos
          </button>
        </div>
      </div>

      {/* 🆕 Paginación Mejorada con Controles */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Información y controles izquierda */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-700">
              Mostrando {Math.min((paginacion.pagina - 1) * paginacion.limite + 1, paginacion.total)} a {Math.min(paginacion.pagina * paginacion.limite, paginacion.total)} de {paginacion.total} productos
            </div>
            
            {/* Selector de límite por página */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Por página:</span>
              <select
                value={paginacion.limite}
                onChange={(e) => setPaginacion(prev => ({ ...prev, limite: Number(e.target.value), pagina: 1 }))}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500 (máximo API)</option>
              </select>
              {/* 🙅‍♂️ Botón "Mostrar Todos" eliminado temporalmente 
              <button
                onClick={() => {
                  const limiteSeguro = Math.min(paginacion.total, 1000)
                  setPaginacion(prev => ({ ...prev, limite: limiteSeguro, pagina: 1 }))
                }}
                className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              >
                Mostrar Todos
              </button>
              */}
            </div>
          </div>
          
          {/* Navegación de páginas */}
          {paginacion.total > paginacion.limite && (
            <div className="flex space-x-2">
              <button
                onClick={() => handlePaginaChange(paginacion.pagina - 1)}
                disabled={paginacion.pagina === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {/* Números de página */}
              {Array.from({ length: Math.ceil(paginacion.total / paginacion.limite) }, (_, i) => i + 1)
                .filter(page => Math.abs(page - paginacion.pagina) <= 2)
                .map(page => (
                  <button
                    key={page}
                    onClick={() => handlePaginaChange(page)}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 ${
                      page === paginacion.pagina ? 'bg-green-500 text-white hover:bg-green-600' : ''
                    }`}
                  >
                    {page}
                  </button>
                ))}
              
              <button
                onClick={() => handlePaginaChange(paginacion.pagina + 1)}
                disabled={paginacion.pagina >= Math.ceil(paginacion.total / paginacion.limite)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Productos ({productosFiltrados.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Cargando productos...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto: Producto) => (
                  <tr 
                    key={producto.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      console.log('🔍 Abriendo modal preview para:', producto.nombre)
                      setSelectedProductPreview(producto)
                      setShowProductPreview(true)
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        <div className="text-sm text-gray-500">{producto.itemcode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${producto.precio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producto.stock <= 10 
                          ? 'bg-red-100 text-red-800' 
                          : producto.stock <= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {producto.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producto.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('👁️ Botón Ver clickeado para:', producto.nombre)
                          setSelectedProductPreview(producto)
                          setShowProductPreview(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingProduct(producto)
                          setShowEditModal(true)
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProduct(producto)
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Producto - ESTRUCTURA JSX LIMPIA */}
      {showNewProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Nuevo Producto</h3>
                <button
                  onClick={() => setShowNewProductModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Información Básica */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">📦 Información Básica</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Código del producto *"
                      value={newProduct.itemcode}
                      onChange={(e) => setNewProduct({...newProduct, itemcode: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text" 
                      placeholder="Nombre del producto *"
                      value={newProduct.nombre}
                      onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  
                  {/* Precio y Stock - CAMPOS OBLIGATORIOS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Unitario * <span className="text-red-500">($)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="19.99"
                        value={newProduct.precio}
                        onChange={(e) => setNewProduct({...newProduct, precio: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Disponible * <span className="text-green-600">(unidades)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="100"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Categoría */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    {!showNewCategoriaInput ? (
                      <select
                        value={newProduct.categoria}
                        onChange={(e) => {
                          if (e.target.value === '__nueva__') {
                            setShowNewCategoriaInput(true)
                            setNewCategoriaName('')
                          } else {
                            setNewProduct({...newProduct, categoria: e.target.value})
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.filter(c => c !== 'todas').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__nueva__">➕ Crear nueva categoría...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoriaName}
                          onChange={(e) => setNewCategoriaName(e.target.value)}
                          placeholder="Nombre de la nueva categoría"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCategoriaName.trim()) {
                              setNewProduct({...newProduct, categoria: newCategoriaName.trim()})
                              setShowNewCategoriaInput(false)
                            }
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoriaInput(false)
                            setNewCategoriaName('')
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Descripción */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      rows={3}
                      placeholder="Descripción del producto..."
                      value={newProduct.descripcion}
                      onChange={(e) => setNewProduct({...newProduct, descripcion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Información del Agricultor */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">🚜 Información del Agricultor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={newProduct.agricultor}
                      onChange={(e) => {
                        if (e.target.value === 'nuevo') {
                          setShowNewAgricultorForm(true)
                        } else {
                          setShowNewAgricultorForm(false)
                          setNewProduct({...newProduct, agricultor: e.target.value})
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Seleccionar agricultor</option>
                      <option value="nuevo">➕ Agregar nuevo</option>
                    </select>
                    
                    {showNewAgricultorForm && (
                      <input
                        type="text"
                        placeholder="Nombre del nuevo agricultor"
                        value={newProduct.agricultor}
                        onChange={(e) => setNewProduct({...newProduct, agricultor: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Unidad y Peso */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">📦 Información del Producto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Unidad</label>
                      <select
                        value={newProduct.unidad}
                        onChange={(e) => setNewProduct({...newProduct, unidad: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      >
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="g">Gramos (g)</option>
                        <option value="L">Litros (L)</option>
                        <option value="ml">Mililitros (ml)</option>
                        <option value="pieza">Pieza</option>
                        <option value="paquete">Paquete</option>
                        <option value="caja">Caja</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Peso (opcional)</label>
                      <input
                        type="number"
                        placeholder="1.5"
                        value={newProduct.peso}
                        onChange={(e) => setNewProduct({...newProduct, peso: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Teléfono Agricultor</label>
                      <input
                        type="tel"
                        placeholder="+52 123 456 7890"
                        value={newProduct.telefono}
                        onChange={(e) => setNewProduct({...newProduct, telefono: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Métricas Ambientales */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">🌱 Métricas Ambientales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">CO2 (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.5"
                        value={newProduct.co2_impacto}
                        onChange={(e) => setNewProduct({...newProduct, co2_impacto: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Agua (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="10.0"
                        value={newProduct.agua_impacto}
                        onChange={(e) => setNewProduct({...newProduct, agua_impacto: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Plástico (%)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newProduct.plastico_impacto}
                        onChange={(e) => setNewProduct({...newProduct, plastico_impacto: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Drag & Drop Imágenes */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">📸 Imágenes del Producto</h4>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Arrastra imágenes aquí
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        O haz clic para seleccionar archivos
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                      >
                        Seleccionar Imágenes
                      </label>
                    </div>
                  </div>
                  
                  {newProduct.imagenes.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {newProduct.imagenes.map((imagen, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imagen}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sección SEO */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">🔍 SEO Data</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Meta Title</label>
                      <input
                        type="text"
                        placeholder="Título optimizado para SEO"
                        value={newProduct.meta_title}
                        onChange={(e) => setNewProduct({...newProduct, meta_title: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Meta Description</label>
                      <textarea
                        placeholder="Descripción para motores de búsqueda (150-160 caracteres)"
                        value={newProduct.meta_description}
                        onChange={(e) => setNewProduct({...newProduct, meta_description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1 h-20 resize-none"
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newProduct.meta_description.length}/160 caracteres
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Keywords</label>
                      <input
                        type="text"
                        placeholder="palabra1, palabra2, palabra3"
                        value={newProduct.keywords}
                        onChange={(e) => setNewProduct({...newProduct, keywords: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separa con comas las palabras clave
                      </p>
                    </div>
                  </div>
                </div>

                {/* Características del Producto */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">⭐ Características Destacadas</h4>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Ej: Sin pesticidas, Producción local, etc."
                        value={newCaracteristica}
                        onChange={(e) => setNewCaracteristica(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        onKeyPress={(e) => e.key === 'Enter' && addCaracteristica()}
                      />
                      <button
                        type="button"
                        onClick={addCaracteristica}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                    </div>
                    
                    {newProduct.caracteristicas.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newProduct.caracteristicas.map((caracteristica, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            ✓ {caracteristica}
                            <button
                              onClick={() => removeCaracteristica(index)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowNewProductModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateProduct}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Crear Producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Producto Como Card Real */}
      {showProductPreview && selectedProductPreview && (
        <>
          {console.log('🚀 Renderizando modal para:', selectedProductPreview.nombre)}
        </>
      )}
      {showProductPreview && selectedProductPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Vista Preview - Como se ve en el E-commerce</h3>
                <button
                  onClick={() => setShowProductPreview(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Card Producto - Estilo E-commerce Real */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Imagen Principal */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gradient-to-br from-orange-50 to-green-50 rounded-lg overflow-hidden relative">
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Disponible
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Imagen placeholder realista */}
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm text-gray-500">Imagen del producto</p>
                        <p className="text-xs text-gray-400">{selectedProductPreview.nombre}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Miniaturas */}
                  <div className="flex space-x-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-transparent hover:border-green-500 cursor-pointer">
                        <div className="w-full h-full bg-gradient-to-br from-orange-50 to-green-50 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Información del Producto */}
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>Agricultor Local, México</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProductPreview.nombre}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[1,2,3,4,5].map((star) => (
                          <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">4.5 (0)</span>
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${selectedProductPreview.precio.toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500">/ {selectedProductPreview.categoria === 'Frutas' ? 'KGM' : 'unidad'}</span>
                  </div>

                  {/* Estado Stock */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-green-600">
                      ● En stock ({selectedProductPreview.stock} disponibles)
                    </span>
                  </div>

                  {/* Descripción */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedProductPreview.descripcion}. Descubre la versatilidad del producto 100% puro, 
                      un producto comestible de sabor, color y olor neutral, ideal para cocinar. Gracias a su alto 
                      punto de humo, es perfecto para freír, asegurando que tus platillos queden crujientes y deliciosos.
                    </p>
                  </div>

                  {/* Características Destacadas */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Características destacadas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Sin pesticidas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Producción local</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Comercio justo</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Empaque eco-friendly</span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas Ambientales */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Trazabilidad del Producto</h3>
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">0kg CO2</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">0L</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">0% plástico</span>
                      </div>
                    </div>
                  </div>

                  {/* Cantidad y Botones */}
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Cantidad</h3>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center border rounded-lg">
                        <button className="p-2 hover:bg-gray-50">-</button>
                        <span className="px-4 py-2 border-x">1</span>
                        <button className="p-2 hover:bg-gray-50">+</button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-semibold">
                        🛒 Añadir al carrito
                      </button>
                      <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Producto ecológico y sostenible</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Sin químicos dañinos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Costo de envío: $100 | GRATIS en compras mayores a $1,000</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Envío desde México</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUCTO */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Editar Producto</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false)
                  setEditingProduct(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del Producto
                  </label>
                  <input
                    type="text"
                    value={editingProduct.itemcode}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">El código no se puede modificar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.nombre}
                    onChange={(e) => setEditingProduct({...editingProduct, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.precio}
                    onChange={(e) => setEditingProduct({...editingProduct, precio: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  {!showNewCategoriaInputEdit ? (
                    <select
                      value={editingProduct.categoria}
                      onChange={(e) => {
                        if (e.target.value === '__nueva__') {
                          setShowNewCategoriaInputEdit(true)
                          setNewCategoriaNameEdit('')
                        } else {
                          setEditingProduct({...editingProduct, categoria: e.target.value})
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sin categoría</option>
                      {categorias.filter(c => c !== 'todas').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__nueva__">➕ Crear nueva categoría...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoriaNameEdit}
                        onChange={(e) => setNewCategoriaNameEdit(e.target.value)}
                        placeholder="Nombre de la nueva categoría"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoriaNameEdit.trim()) {
                            setEditingProduct({...editingProduct, categoria: newCategoriaNameEdit.trim()})
                            setShowNewCategoriaInputEdit(false)
                          }
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoriaInputEdit(false)
                          setNewCategoriaNameEdit('')
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={editingProduct.activo ? 'true' : 'false'}
                    onChange={(e) => setEditingProduct({...editingProduct, activo: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={editingProduct.descripcion}
                  onChange={(e) => setEditingProduct({...editingProduct, descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingProduct(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
