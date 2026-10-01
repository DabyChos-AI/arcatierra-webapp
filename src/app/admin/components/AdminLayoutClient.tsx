'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { MisRolesContext } from './MisRolesContext'
import type { InsigniaPanel, MisRoles, RolActivo, RolUsuario } from '@/types/roles'

// HDR1: solo los dos valores conocidos; cualquier otra cosa (o la llave ausente: API anterior a R3) = sin insignia.
function leerInsignia(valor: unknown): InsigniaPanel {
  return valor === 'fundador' || valor === 'developer' ? valor : null
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
  // HDR1 (R3): la insignia del panel la decide el backend en mis-roles; aquí solo se guarda y se reparte.
  const [insignia, setInsignia] = useState<InsigniaPanel>(null)

  // T55g (30-sep): funciones ESTABLES. AdminSidebar cierra el menú en un useEffect que
  // depende de [pathname, onClose]; con una flecha nueva en cada render, abrir el menú
  // repintaba este componente, el efecto corría y lo volvía a cerrar: en el celular el
  // menú nunca abría.
  const abrirMenu = useCallback(() => setSidebarOpen(true), [])
  const cerrarMenu = useCallback(() => setSidebarOpen(false), [])

  // Fetch roles del usuario al montar
  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch('/api/admin/roles/mis-roles')
        if (!res.ok) return
        const data: MisRoles = await res.json()
        setRoles(data.roles || [])
        setRolActivo(data.rol_activo || null)
        setPermisosActivos(data.permisos_activos || [])
        setInsignia(leerInsignia(data.insignia))
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

  const contextoMisRoles = useMemo(() => ({ insignia }), [insignia])

  return (
    <MisRolesContext.Provider value={contextoMisRoles}>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader
          rolActivo={rolActivo}
          roles={roles}
          insignia={insignia}
          onSwitchRole={handleSwitchRole}
          onAbrirMenu={abrirMenu}
        />

        {/* HD1 (30-sep): el botón «Abrir menu» vivía aquí como `fixed top-20` y <main> llevaba
            `pt-20` en móvil, solo para librar el navbar público (fixed, 82 px), que tapaba la barra
            gris. Ese navbar ya no se pinta en /admin: el botón pasó a la barra (AdminHeader). */}

        <div className="flex">
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={cerrarMenu}
            permisosActivos={permisosActivos}
          />
          {/* PL1 (29-sep): min-w-0 deja que el contenido se encoja; sin él, una tabla ancha
              (Planeación semanal, 13 columnas) ensanchaba <main> y aplastaba el menú lateral. */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </MisRolesContext.Provider>
  )
}
