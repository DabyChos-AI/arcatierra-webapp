'use client'

import Link from 'next/link'
import { User, LogOut, Crown, Shield, ChevronDown, Check, Globe, Menu } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'

interface UserRole {
  isFundador: boolean
  isDeveloper: boolean
  nombre: string
}

interface AdminHeaderProps {
  rolActivo?: { id: string; nombre: string; permisos: string[] } | null
  roles?: { id: string; nombre: string; descripcion: string; permisos: string[]; es_activo: boolean }[]
  onSwitchRole?: (rolId: string) => void
  /** Abre el menú lateral en móvil. HD1: antes era un botón fijo que solo cuadraba con el navbar público. */
  onAbrirMenu?: () => void
}

function getRolColor(nombre: string) {
  switch (nombre) {
    case 'super_admin':
      return { bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600', text: 'text-yellow-700', border: 'border-yellow-300' }
    case 'admin':
      return { bg: 'bg-[#33503E]', text: 'text-[#33503E]', border: 'border-[#33503E]' }
    case 'operador':
      return { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-400' }
    case 'visor':
      return { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-400' }
    default:
      return { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-400' }
  }
}

function formatRolName(nombre: string) {
  return nombre.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function AdminHeader({ rolActivo, roles, onSwitchRole, onAbrirMenu }: AdminHeaderProps) {
  const { data: session } = useSession()
  const [userRole, setUserRole] = useState<UserRole>({ isFundador: false, isDeveloper: false, nombre: 'Admin' })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Detectar rol del usuario basado en email
    if (session?.user?.email) {
      const email = session.user.email
      const nombre = session.user.name || 'Admin'

      const fundadores = ['pablo@arcatierra.com', 'luh@arcatierra.com']
      const developers = ['ing.davidabraham@gmail.com']

      // Super admin (David) tiene acceso a vistas de fundadores para testing
      const isSuperAdmin = developers.includes(email)

      setUserRole({
        isFundador: fundadores.includes(email) || isSuperAdmin, // David ve vistas de fundador
        isDeveloper: developers.includes(email),
        nombre: nombre
      })
    }
  }, [session])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasMultipleRoles = roles && roles.length > 1
  const rolColor = rolActivo ? getRolColor(rolActivo.nombre) : null

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      {/* flex-wrap: en pantallas angostas los botones bajan de renglón en vez de salirse */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {onAbrirMenu && (
            <button
              type="button"
              onClick={onAbrirMenu}
              className="lg:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          )}
          {/* <p> y no <h1>: el <h1> es de cada pantalla (uno por página), y el h1 global
              de globals.css le metía 20 px de margen abajo a la barra */}
          <p className="font-heading text-lg sm:text-xl font-bold text-green-700 whitespace-nowrap">
            Arcatierra Admin
          </p>
          <div className="hidden md:block text-sm text-gray-500">
            Panel de Administracion
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          {/* HD1 (30-sep): aquí había una campana con un punto rojo fijo (no había
              notificaciones detrás) y un engrane sin acción. Se quitaron: la campana
              real vive en AdminTopbar. */}

          {/* Selector de Rol */}
          {rolActivo && hasMultipleRoles && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label={`Cambiar rol (actual: ${formatRolName(rolActivo.nombre)})`}
                aria-expanded={dropdownOpen}
                className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg border ${rolColor?.border} hover:bg-gray-50 transition-colors`}
              >
                <Shield className={`h-4 w-4 ${rolColor?.text}`} aria-hidden="true" />
                <span className={`hidden sm:inline text-sm font-medium ${rolColor?.text}`}>
                  {formatRolName(rolActivo.nombre)}
                </span>
                <ChevronDown className={`h-3 w-3 ${rolColor?.text} transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[60]">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cambiar rol</p>
                  </div>
                  {roles?.map((rol) => {
                    const color = getRolColor(rol.nombre)
                    const isActive = rol.id === rolActivo.id
                    return (
                      <button
                        key={rol.id}
                        onClick={() => {
                          if (!isActive && onSwitchRole) {
                            onSwitchRole(rol.id)
                          }
                          setDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors ${isActive ? 'bg-gray-50' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                          <div className="text-left">
                            <p className={`text-sm font-medium ${isActive ? color.text : 'text-gray-700'}`}>
                              {formatRolName(rol.nombre)}
                            </p>
                            <p className="text-xs text-gray-400">{rol.descripcion}</p>
                          </div>
                        </div>
                        {isActive && <Check className="h-4 w-4 text-green-600" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Rol unico (sin dropdown) */}
          {rolActivo && !hasMultipleRoles && (
            <div
              className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg border ${rolColor?.border}`}
              title={formatRolName(rolActivo.nombre)}
            >
              <Shield className={`h-4 w-4 ${rolColor?.text}`} aria-hidden="true" />
              <span className={`hidden sm:inline text-sm font-medium ${rolColor?.text}`}>
                {formatRolName(rolActivo.nombre)}
              </span>
            </div>
          )}

          {/* Usuario con badge especial (en móvil no cabe: se oculta) */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className={`w-8 h-8 ${
              userRole.isFundador ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
              userRole.isDeveloper ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
              'bg-green-600'
            } rounded-full flex items-center justify-center ring-2 ring-offset-2 ${
              userRole.isFundador ? 'ring-yellow-300' :
              userRole.isDeveloper ? 'ring-blue-300' :
              'ring-green-300'
            }`}>
              {userRole.isFundador ? (
                <Crown className="h-5 w-5 text-white" />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{userRole.nombre}</span>
              {userRole.isDeveloper ? (
                <span className="text-xs font-semibold text-blue-600">Super Admin</span>
              ) : userRole.isFundador ? (
                <span className="text-xs font-semibold text-yellow-600">Fundador</span>
              ) : null}
            </div>
          </div>

          {/* HD1: el navbar público ya no se pinta en /admin; por aquí se vuelve al sitio */}
          <Link
            href="/"
            aria-label="Ver sitio público"
            title="Ver sitio público"
            data-testid="admin-header-ver-sitio"
            className="flex items-center gap-1.5 p-2 text-sm text-gray-600 hover:text-green-700 hover:bg-gray-100 rounded-lg"
          >
            <Globe className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Ver sitio</span>
          </Link>

          {/* Salir: mismo cierre que AdminTopbar (HD1: antes no hacía nada) */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            aria-label="Salir"
            title="Salir (cerrar sesión)"
            data-testid="admin-header-salir"
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
