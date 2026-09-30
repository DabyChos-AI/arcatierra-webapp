'use client'

import { useState, useEffect, useCallback } from 'react'
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
  // undefined mientras cargan; [] significa "ya cargaron y no tiene ninguno".
  // El sidebar distingue los dos casos: con undefined pinta todo para no
  // parpadear, con [] no pinta nada. Ver AdminSidebar.tsx::filterItems.
  const [permisosActivos, setPermisosActivos] = useState<string[] | undefined>(undefined)

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
        onAbrirMenu={() => setSidebarOpen(true)}
      />

      {/* HD1 (30-sep): el botón «Abrir menu» vivía aquí como `fixed top-20` y <main> llevaba
          `pt-20` en móvil, solo para librar el navbar público (fixed, 82 px), que tapaba la barra
          gris. Ese navbar ya no se pinta en /admin: el botón pasó a la barra (AdminHeader). */}

      <div className="flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          permisosActivos={permisosActivos}
        />
        {/* PL1 (29-sep): min-w-0 deja que el contenido se encoja; sin él, una tabla ancha
            (Planeación semanal, 13 columnas) ensanchaba <main> y aplastaba el menú lateral. */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
