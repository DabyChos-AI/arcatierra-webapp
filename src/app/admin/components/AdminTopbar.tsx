'use client'

// ============================================================================
// AdminTopbar v10 — Sesion 23 Fase C Ola 1
// Layout: [Titulo+Breadcrumb] [User chip]. R11: la búsqueda ⌘K y la campana viven en AdminHeader (todas las páginas).
// Consumido por nuevas paginas (Reservas, Mi dia, Personal, etc).
// NO reemplaza AdminHeader.tsx (que sigue usandose en AdminLayoutClient para
// secciones legacy con role-switcher).
// ============================================================================

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, ChevronDown } from 'lucide-react'
import { etiquetaRol, useMisRoles } from './MisRolesContext'

const TITLES: Record<string, [string, string]> = {
  '/admin': ['Dashboard', 'Inicio'],
  '/admin/reservas': ['Reservas Privadas', 'Reservas / Privadas'],
  '/admin/catalogos': ['Catálogos de reservas', 'Reservas / Catálogos'],
  '/admin/eventos': ['Eventos y fechas públicas', 'Reservas / Eventos'],
  '/admin/planeacion': ['Planeación semanal', 'Reservas / Planeación'],
  '/admin/leads': ['Bandeja de Leads', 'Reservas / Leads'],
  '/admin/catering': ['Catering', 'Reservas / Catering'],
  '/admin/mi-dia': ['Mi día', 'Principal / Mi día'],
  '/admin/personal': ['Personal', 'Personas / Personal'],
  '/admin/resellers': ['Resellers / B2B', 'Personas / Resellers'],
  '/admin/clientes': ['Clientes', 'Personas / Clientes'],
  '/admin/addons': ['Add-ons', 'Catalogos / Add-ons'],
  '/admin/experiencias-privadas': ['Experiencias', 'Catalogos / Experiencias'],
  '/admin/plantillas-email': ['Plantillas Email', 'Operacion / Plantillas'],
  '/admin/reportes': ['Reportes', 'Operacion / Reportes'],
  '/admin/pedidos': ['Pedidos', 'Tienda / Pedidos'],
  '/admin/productos': ['Productos', 'Tienda / Productos'],
  '/admin/suscripciones': ['Suscripciones', 'Tienda / Suscripciones'],
}

function getTitle(pathname: string | null): [string, string] {
  if (!pathname) return ['Admin', 'Inicio']
  if (TITLES[pathname]) return TITLES[pathname]
  // Match por prefijo (ej: /admin/reservas/abc-123)
  const match = Object.keys(TITLES)
    .filter((k) => k !== '/admin' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  if (match) return TITLES[match]
  return ['Admin', 'Inicio']
}

function getInitials(name?: string | null): string {
  if (!name) return 'AT'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function AdminTopbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { rolActivo } = useMisRoles()
  const [title, breadcrumb] = getTitle(pathname)

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar menus on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const userName = session?.user?.name ?? 'Admin'
  const initials = getInitials(userName)
  // TB1 (R7): el rol ACTIVO real (mis-roles → rol_activo, por MisRolesContext). Sin dato → sin pastilla.
  const roleLabel = etiquetaRol(rolActivo?.nombre)

  return (
    <>
      {/* Fase 2 (T68): a 390 px la barra medía 511 y ensanchaba toda la página (los modales quedaban cortados).
          En móvil: menos margen y el buscador se reduce al ícono; min-w-0 deja que el centro se encoja. */}
      <header className="bg-white border-b border-neutro-borde px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        {/* IZQ: Titulo + breadcrumb */}
        <div className="min-w-0">
          {/* H1 (R7): <p> y no <h1>, como AdminHeader: el <h1> es de cada pantalla (uno por ruta). */}
          <p className="font-display text-xl text-verde leading-tight truncate">{title}</p>
          <p className="text-xs text-verde-suave truncate">{breadcrumb}</p>
        </div>

        {/* R11 (K3, K5): la búsqueda (⌘K) y la campana pasaron a AdminHeader, la barra de TODAS las páginas. */}
        <div className="flex-1 min-w-0" />

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* User chip */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-neutro-light transition-colors"
              aria-label="Menu de usuario"
            >
              <div
                className="w-8 h-8 rounded-full bg-verde text-white flex items-center justify-center text-xs font-semibold"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="hidden md:flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-verde truncate max-w-[120px]">
                  {userName}
                </span>
                {roleLabel && (
                  <span
                    data-testid="admin-topbar-rol"
                    data-rol={rolActivo?.nombre ?? ''}
                    className="bg-terracota/10 text-terracota text-xs px-2 py-0.5 rounded-full"
                  >
                    {roleLabel}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-verde-suave transition-transform ${
                  userMenuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-neutro-borde rounded-lg shadow-medium z-[60]">
                <div className="px-3 py-2 border-b border-neutro-borde">
                  <p className="text-sm font-semibold text-verde truncate">{userName}</p>
                  <p className="text-xs text-verde-suave truncate">
                    {session?.user?.email ?? ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-verde hover:bg-neutro-light transition-colors"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

    </>
  )
}
