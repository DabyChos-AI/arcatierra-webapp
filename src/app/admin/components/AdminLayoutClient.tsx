'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

interface RolActivo {
  id: string
  nombre: string
  permisos: string[]
}

interface RolUsuario {
  id: string
  nombre: string
  descripcion: string
  permisos: string[]
  es_activo: boolean
}

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rolActivo, setRolActivo] = useState<RolActivo | null>(null)
  const [roles, setRoles] = useState<RolUsuario[]>([])
  const [permisosActivos, setPermisosActivos] = useState<string[]>([])

  // Fetch roles del usuario al montar
  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch('/api/admin/roles/mis-roles')
        if (!res.ok) return
        const data = await res.json()
        setRoles(data.roles || [])
        setRolActivo(data.rol_activo || null)
        setPermisosActivos(data.permisos_activos || [])
      } catch (err) {
        console.error('Error cargando roles:', err)
      }
    }
    fetchRoles()
  }, [])

  // Cambiar de rol activo
  const handleSwitchRole = useCallback(async (rolId: string) => {
    try {
      const res = await fetch('/api/admin/roles/switch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol_id: rolId })
      })
      if (!res.ok) return
      const data = await res.json()
      const nuevoRol = data.rol_activo
      if (nuevoRol) {
        setRolActivo(nuevoRol)
        setPermisosActivos(nuevoRol.permisos || [])
        // Actualizar es_activo en la lista de roles
        setRoles(prev => prev.map(r => ({
          ...r,
          es_activo: r.id === nuevoRol.id
        })))
      }
    } catch (err) {
      console.error('Error cambiando rol:', err)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        rolActivo={rolActivo}
        roles={roles}
        onSwitchRole={handleSwitchRole}
      />

      {/* Boton hamburguesa mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-30 p-2 bg-white rounded-lg shadow-md"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          permisosActivos={permisosActivos}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
