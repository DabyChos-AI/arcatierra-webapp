'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Edit2, UserCheck, Award } from 'lucide-react'

interface Empleado {
  usuario_id: string;
  numero_empleado: string;
  departamento: string;
  cargo: string;
  nombre: string;
  email: string;
  puntos_totales: number;
  puntos_mes_actual: number;
  nivel: number;
  titulo_actual: string;
  activo: boolean;
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newEmpleadoData, setNewEmpleadoData] = useState({
    email: '',
    nombre: '',
    numero_empleado: '',
    departamento: '',
    cargo: '',
    telefono: ''
  })

  const fetchEmpleados = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/empleados')

      if (!response.ok) {
        throw new Error('Error cargando empleados')
      }
      
      const data = await response.json()
      setEmpleados(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleados()
  }, [])

  const handleEditEmpleado = (empleado: Empleado) => {
    setSelectedEmpleado(empleado)
    setShowModal(true)
  }
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedEmpleado(null)
  }

  const handleSaveChanges = async () => {
    if (!selectedEmpleado) return

    try {
      // 🔧 FIX: API espera query params, no JSON body
      const params = new URLSearchParams({
        departamento: selectedEmpleado.departamento,
        cargo: selectedEmpleado.cargo,
        activo: String(selectedEmpleado.activo)
      })

      const response = await fetch(
        `/api/admin/empleados/${selectedEmpleado.usuario_id}?${params}`,
        { method: 'PATCH' }
      )

      if (response.ok) {
        alert(`✅ Empleado actualizado exitosamente:\n\n${selectedEmpleado.nombre}\nDepartamento: ${selectedEmpleado.departamento}\nCargo: ${selectedEmpleado.cargo}`)
        handleCloseModal()
        fetchEmpleados()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al actualizar empleado')
      }
      
    } catch (error) {
      console.error('Error actualizando empleado:', error)
      alert(`❌ Error al actualizar empleado:\n\n${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const handleCreateEmpleado = async () => {
    if (!newEmpleadoData.email || !newEmpleadoData.nombre || !newEmpleadoData.numero_empleado) {
      alert('❌ Por favor completa todos los campos obligatorios:\n\n• Nombre\n• Email\n• Número de empleado')
      return
    }

    if (!newEmpleadoData.departamento || newEmpleadoData.departamento === '') {
      alert('❌ Por favor selecciona un departamento')
      return
    }

    if (!newEmpleadoData.cargo || newEmpleadoData.cargo.trim() === '') {
      alert('❌ Por favor ingresa el cargo del empleado')
      return
    }

    try {
      console.log('📤 Enviando datos:', {
        email: newEmpleadoData.email,
        nombre: newEmpleadoData.nombre,
        numero_empleado: newEmpleadoData.numero_empleado,
        departamento: newEmpleadoData.departamento,
        cargo: newEmpleadoData.cargo,
        telefono: newEmpleadoData.telefono
      })

      // Enviar directamente al backend - él se encarga de crear el usuario
      const response = await fetch('/api/admin/empleados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmpleadoData.email,
          nombre: newEmpleadoData.nombre,
          numero_empleado: newEmpleadoData.numero_empleado,
          departamento: newEmpleadoData.departamento,
          cargo: newEmpleadoData.cargo,
          telefono: newEmpleadoData.telefono || ''
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ Empleado creado exitosamente!\n\nNombre: ${newEmpleadoData.nombre}\nEmail: ${newEmpleadoData.email}\nNúmero: ${newEmpleadoData.numero_empleado}\nDepartamento: ${newEmpleadoData.departamento}`)
        setShowNewModal(false)
        setNewEmpleadoData({
          email: '',
          nombre: '',
          numero_empleado: '',
          departamento: '',
          cargo: '',
          telefono: ''
        })
        
        // Recargar empleados
        fetchEmpleados()
      } else {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        
        // Manejar error de validación FastAPI
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Error de validación de Pydantic
            const errores = errorData.detail.map((err: any) => 
              `• ${err.loc.join('.')}: ${err.msg}`
            ).join('\n')
            throw new Error(`Errores de validación:\n\n${errores}`)
          } else {
            throw new Error(errorData.detail)
          }
        } else {
          throw new Error('Error desconocido al crear empleado')
        }
      }
      
    } catch (error) {
      console.error('💥 Error completo:', error)
      alert(`❌ Error al crear empleado:\n\n${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-2 text-lg">Cargando empleados...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <button
              onClick={fetchEmpleados}
              className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            Gestión de Empleados
          </h1>
          <p className="text-gray-600 mt-1">Administra el personal y sus perfiles</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Empleado</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Empleados</p>
              <p className="text-2xl font-bold text-gray-900">{empleados.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {empleados.filter(emp => emp.activo).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Puntos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {empleados.reduce((sum, emp) => sum + (emp.puntos_totales || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Edit2 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departamentos</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(empleados.map(emp => emp.departamento)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Empleados Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Empleados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gamificación
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
              {empleados.length > 0 ? (
                empleados.map((empleado) => (
                  <tr key={empleado.usuario_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                            {empleado.nombre?.charAt(0) || 'N/A'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {empleado.nombre || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">{empleado.email}</div>
                          <div className="text-xs text-gray-400">#{empleado.numero_empleado}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {empleado.cargo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {empleado.departamento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{empleado.titulo_actual || 'Sin título'}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Nivel {empleado.nivel || 0} • {empleado.puntos_mes_actual || 0} pts este mes
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        empleado.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {empleado.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditEmpleado(empleado)}
                        className="text-green-600 hover:text-green-900 mr-3 p-1 rounded-lg hover:bg-green-50"
                        title="Editar empleado"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay empleados registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición */}
      {showModal && selectedEmpleado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Editar Empleado
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedEmpleado.nombre?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedEmpleado.nombre || 'Sin nombre'}</h4>
                    <p className="text-sm text-gray-600">{selectedEmpleado.email}</p>
                    <p className="text-xs text-gray-500">#{selectedEmpleado.numero_empleado}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <select
                      value={selectedEmpleado.departamento}
                      onChange={(e) => setSelectedEmpleado({...selectedEmpleado, departamento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="experiencias">Experiencias</option>
                      <option value="catering">Catering</option>
                      <option value="admin">Administración</option>
                      <option value="testing">Testing</option>
                      <option value="ventas">Ventas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={selectedEmpleado.cargo}
                      onChange={(e) => setSelectedEmpleado({...selectedEmpleado, cargo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: Lead Tester"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h5 className="font-medium text-purple-900 mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Gamificación
                  </h5>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-purple-600 font-medium">Nivel:</span>
                      <p className="font-bold">{selectedEmpleado.nivel}</p>
                    </div>
                    <div>
                      <span className="text-purple-600 font-medium">Este Mes:</span>
                      <p className="font-bold">{selectedEmpleado.puntos_mes_actual}</p>
                    </div>
                    <div>
                      <span className="text-purple-600 font-medium">Total:</span>
                      <p className="font-bold">{selectedEmpleado.puntos_totales}</p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-700 mt-2">
                    <strong>Título:</strong> {selectedEmpleado.titulo_actual}
                  </p>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Estado del Empleado</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedEmpleado.activo ? 'El empleado puede acceder al sistema' : 'El empleado no puede acceder'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEmpleado({...selectedEmpleado, activo: !selectedEmpleado.activo})}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      selectedEmpleado.activo ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      selectedEmpleado.activo ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cerrar
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={handleSaveChanges}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Empleado */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nuevo Empleado
                </h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={newEmpleadoData.nombre}
                    onChange={(e) => setNewEmpleadoData({...newEmpleadoData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez García"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmpleadoData.email}
                    onChange={(e) => setNewEmpleadoData({...newEmpleadoData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="juan.perez@arcatierra.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número Empleado
                    </label>
                    <input
                      type="text"
                      value={newEmpleadoData.numero_empleado}
                      onChange={(e) => setNewEmpleadoData({...newEmpleadoData, numero_empleado: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="EMP-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <select
                      value={newEmpleadoData.departamento}
                      onChange={(e) => setNewEmpleadoData({...newEmpleadoData, departamento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Administración">Administración</option>
                      <option value="Ventas">Ventas</option>
                      <option value="Producción">Producción</option>
                      <option value="Logística">Logística</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej: Coordinador de Ventas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newEmpleadoData.cargo}
                    onChange={(e) => setNewEmpleadoData({...newEmpleadoData, cargo: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej: +52 55 1234 5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newEmpleadoData.telefono}
                    onChange={(e) => setNewEmpleadoData({...newEmpleadoData, telefono: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={handleCreateEmpleado}
                >
                  Crear Empleado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
