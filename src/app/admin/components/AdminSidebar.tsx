'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Home,
  Clock,
  Calendar,
  Utensils,
  Inbox,
  Star,
  Plus,
  Users,
  UserCheck,
  Handshake,
  Briefcase,
  Mail,
  BarChart,
  ShoppingCart,
  Leaf,
  Repeat,
  Truck,
  Warehouse,
  CreditCard,
  QrCode,
  Award,
  AlertTriangle,
  Settings,
  Globe,
  X,
  type LucideIcon,
} from 'lucide-react'
import { API_URL } from '@/lib/api'

// ============================================================================
// Sidebar v10 hibrido — Sesion 23 Fase C Ola 1 + ajuste por Dabycho
// Estructura por SECCIONES (7 grupos): Principal/Reservas/Catalogos/Personas/
// Operacion/Tienda/Otros. La seccion "Otros" preserva items del sidebar
// pre-v10 (Inventario, Empleados, Pagos, QR codes, Gamificacion, Alertas,
// Configuracion, Exp. Publicas, Calendario, Entregas) para no perder accesos
// rapidos del dashboard anterior. C31 relajado: Inventario en "Otros"
// (no es item principal de sofias pero sigue accesible).
// ============================================================================

type BadgeKey = 'reservasActivas' | 'leadsNuevos' | 'misEventosHoy'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  permiso: string
  badgeKey?: BadgeKey
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { href: '/admin', label: 'Dashboard', icon: Home, permiso: 'dashboard' },
      { href: '/admin/mi-dia', label: 'Mi dia (vista guia)', icon: Clock, permiso: 'mi_dia', badgeKey: 'misEventosHoy' },
    ],
  },
  {
    label: 'Reservas',
    items: [
      { href: '/admin/reservas', label: 'Reservas Privadas', icon: Calendar, permiso: 'reservas', badgeKey: 'reservasActivas' },
      { href: '/admin/catering', label: 'Catering', icon: Utensils, permiso: 'catering' },
      { href: '/admin/leads', label: 'Leads', icon: Inbox, permiso: 'leads', badgeKey: 'leadsNuevos' },
    ],
  },
  {
    label: 'Catalogos',
    items: [
      { href: '/admin/experiencias-privadas', label: 'Experiencias', icon: Star, permiso: 'experiencias_privadas' },
      { href: '/admin/addons', label: 'Add-ons', icon: Plus, permiso: 'addons' },
    ],
  },
  {
    label: 'Personas',
    items: [
      { href: '/admin/clientes', label: 'Clientes', icon: Users, permiso: 'clientes' },
      { href: '/admin/resellers', label: 'Resellers / B2B', icon: Handshake, permiso: 'resellers' },
      { href: '/admin/personal', label: 'Personal', icon: Briefcase, permiso: 'personal' },
    ],
  },
  {
    label: 'Operacion',
    items: [
      { href: '/admin/plantillas-email', label: 'Plantillas Email', icon: Mail, permiso: 'plantillas_email' },
      { href: '/admin/reportes', label: 'Reportes', icon: BarChart, permiso: 'reportes' },
    ],
  },
  {
    label: 'Tienda',
    items: [
      { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart, permiso: 'pedidos' },
      { href: '/admin/productos', label: 'Productos', icon: Leaf, permiso: 'productos' },
      { href: '/admin/suscripciones', label: 'Suscripciones', icon: Repeat, permiso: 'suscripciones' },
    ],
  },
  {
    label: 'Otros',
    items: [
      { href: '/admin/calendario', label: 'Calendario', icon: Calendar, permiso: 'calendario' },
      { href: '/admin/entregas', label: 'Entregas', icon: Truck, permiso: 'entregas' },
      { href: '/admin/inventario', label: 'Inventario', icon: Warehouse, permiso: 'inventario' },
      { href: '/admin/empleados', label: 'Empleados', icon: UserCheck, permiso: 'empleados' },
      { href: '/admin/pagos', label: 'Pagos', icon: CreditCard, permiso: 'pagos' },
      { href: '/admin/qr-codes', label: 'Codigos QR', icon: QrCode, permiso: 'qr_codes' },
      { href: '/admin/gamificacion', label: 'Gamificacion', icon: Award, permiso: 'gamificacion' },
      { href: '/admin/alertas', label: 'Alertas', icon: AlertTriangle, permiso: 'alertas' },
      { href: '/admin/configuracion', label: 'Configuracion', icon: Settings, permiso: 'configuracion' },
      { href: '/admin/experiencias-publicas', label: 'Exp. Publicas', icon: Globe, permiso: 'experiencias_publicas' },
    ],
  },
]

// ============================================================================
// Hook: useSidebarBadges (badges dinamicos desde backend)
// ============================================================================

interface SidebarBadges {
  reservasActivas?: number
  leadsNuevos?: number
  misEventosHoy?: number
}

export function useSidebarBadges(): SidebarBadges {
  const { data: session } = useSession()
  const [badges, setBadges] = useState<SidebarBadges>({})

  useEffect(() => {
    const token = session?.accessToken
    if (!token) return
    let cancelled = false

    async function fetchAll(authToken: string) {
      const headers = { Authorization: `Bearer ${authToken}` }
      // Reservas activas (tentativas + confirmadas_mes)
      try {
        const r = await fetch(`${API_URL}/api/admin/reservas/stats`, { headers })
        if (r.ok) {
          const data = await r.json()
          const activas = (data.tentativas || 0) + (data.confirmadas_mes || 0)
          if (!cancelled) {
            setBadges((b) => ({ ...b, reservasActivas: activas > 0 ? activas : undefined }))
          }
        }
      } catch {
        /* silent — endpoint puede 404 si backend aun no reload */
      }
      // Leads nuevos
      try {
        const r = await fetch(`${API_URL}/api/admin/leads/stats`, { headers })
        if (r.ok) {
          const data = await r.json()
          const nuevos = data.nuevos || 0
          if (!cancelled) {
            setBadges((b) => ({ ...b, leadsNuevos: nuevos > 0 ? nuevos : undefined }))
          }
        }
      } catch {
        /* silent */
      }
      // Mi dia (Fase K — endpoint aun NO existe, fallback a undefined)
      try {
        const r = await fetch(`${API_URL}/api/admin/personal/mis-eventos-hoy`, { headers })
        if (r.ok) {
          const data = await r.json()
          const count = data.count || 0
          if (!cancelled) {
            setBadges((b) => ({ ...b, misEventosHoy: count > 0 ? count : undefined }))
          }
        }
      } catch {
        /* silent */
      }
    }

    fetchAll(token)
    const interval = setInterval(() => fetchAll(token), 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [session?.accessToken])

  return badges
}

// ============================================================================
// Componente principal
// ============================================================================

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  permisosActivos?: string[]
}

export default function AdminSidebar({ isOpen, onClose, permisosActivos }: AdminSidebarProps) {
  const pathname = usePathname()
  const badges = useSidebarBadges()

  // Cerrar sidebar al cambiar de ruta en mobile
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Filtrar items por permisos (si se proporcionan)
  const filterItems = (items: NavItem[]) => {
    if (!permisosActivos || permisosActivos.length === 0) return items
    return items.filter((item) => permisosActivos.includes(item.permiso))
  }

  // Filtrar secciones que queden vacias luego de aplicar permisos
  const filteredSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: filterItems(section.items),
  })).filter((section) => section.items.length > 0)

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 bottom-0 w-64 bg-white border-r border-neutro-borde z-50
          transform transition-transform duration-300 lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
      >
        {/* Boton cerrar mobile */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutro-light"
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="py-2">
          {filteredSections.map((section) => (
            <div key={section.label} className="mb-2">
              <div className="text-xs uppercase tracking-wide text-verde-suave px-4 py-2 font-semibold">
                {section.label}
              </div>
              <ul>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const badgeValue = item.badgeKey ? badges[item.badgeKey] : undefined

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          relative flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                          ${
                            isActive
                              ? 'bg-terracota/10 text-terracota border-l-2 border-terracota'
                              : 'text-verde hover:bg-neutro-light'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        {badgeValue !== undefined && badgeValue > 0 && (
                          <span
                            className="absolute right-3 bg-rojo text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center"
                            aria-label={`${badgeValue} pendientes`}
                          >
                            {badgeValue > 99 ? '99+' : badgeValue}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
