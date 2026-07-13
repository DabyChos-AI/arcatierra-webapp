'use client'

// ============================================================================
// AdminTopbar v10 — Sesion 23 Fase C Ola 1
// Layout: [Titulo+Breadcrumb] [Busqueda ⌘K (placeholder)] [Notifs] [User chip]
// Consumido por nuevas paginas (Reservas, Mi dia, Personal, etc).
// NO reemplaza AdminHeader.tsx (que sigue usandose en AdminLayoutClient para
// secciones legacy con role-switcher).
// ============================================================================

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Search, LogOut, ChevronDown } from 'lucide-react'

const TITLES: Record<string, [string, string]> = {
  '/admin': ['Dashboard', 'Inicio'],
  '/admin/reservas': ['Reservas Privadas', 'Reservas / Privadas'],
  '/admin/leads': ['Bandeja de Leads', 'Reservas / Leads'],
  '/admin/catering': ['Catering', 'Reservas / Catering'],
  '/admin/mi-dia': ['Mi dia', 'Principal / Mi dia'],
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

function formatRole(role?: string): string {
  if (!role) return 'Admin'
  const map: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    empleado: 'Vendedora',
    operador: 'Operador',
    visor: 'Visor',
  }
  return map[role] ?? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminTopbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [title, breadcrumb] = getTitle(pathname)

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifMenuOpen, setNotifMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifMenuRef = useRef<HTMLDivElement>(null)

  const notifCount = 0 // hardcode por ahora — alimentado en Fase D

  // Cerrar menus on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Shortcut ⌘K / Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchModalOpen(true)
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const userName = session?.user?.name ?? 'Admin'
  const initials = getInitials(userName)
  // session.user no expone tipo_usuario en types; mostramos role-pill generico
  const roleLabel = formatRole(undefined)

  return (
    <>
      <header className="bg-white border-b border-neutro-borde px-6 py-3 flex items-center gap-6">
        {/* IZQ: Titulo + breadcrumb */}
        <div className="min-w-0">
          <h1 className="font-display text-xl text-verde leading-tight truncate">{title}</h1>
          <p className="text-xs text-verde-suave truncate">{breadcrumb}</p>
        </div>

        {/* CENTRO: Busqueda */}
        <div className="flex-1 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-neutro-light hover:bg-neutro-borde/40 border border-neutro-borde rounded-lg text-sm text-verde-suave transition-colors"
            aria-label="Buscar (Cmd+K)"
          >
            <Search className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left truncate">
              Buscar reservas, clientes, experiencias...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-neutro-borde rounded text-xs text-verde-suave font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* DER: Notifs + User */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Notificaciones */}
          <div className="relative" ref={notifMenuRef}>
            <button
              type="button"
              onClick={() => setNotifMenuOpen((v) => !v)}
              className="relative p-2 text-verde hover:bg-neutro-light rounded-lg transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {notifCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 bg-rojo rounded-full"
                  aria-label={`${notifCount} notificaciones sin leer`}
                />
              )}
            </button>
            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-neutro-borde rounded-lg shadow-medium z-[60]">
                <div className="px-3 py-2 border-b border-neutro-borde">
                  <p className="text-sm font-semibold text-verde">Notificaciones</p>
                </div>
                <div className="px-3 py-6 text-center text-sm text-verde-suave">
                  Sin notificaciones por ahora — alimentado en Fase D.
                </div>
              </div>
            )}
          </div>

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
                <span className="bg-terracota/10 text-terracota text-xs px-2 py-0.5 rounded-full">
                  {roleLabel}
                </span>
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

      {/* Modal busqueda global (placeholder Fase K) */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Busqueda global"
        >
          <div
            className="bg-white rounded-lg shadow-medium max-w-xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-5 w-5 text-verde-suave" aria-hidden="true" />
              <h2 className="font-display text-lg text-verde">Busqueda global</h2>
            </div>
            <div className="bg-amarillo-bg border border-amarillo/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-verde">
                La busqueda global estara disponible en Fase K.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="px-4 py-2 bg-verde text-white rounded-lg text-sm hover:bg-verde-claro transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
