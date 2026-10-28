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
  CalendarOff,
  Warehouse,
  CreditCard,
  Award,
  Globe,
  Tags,
  CalendarRange,
  Ticket,
  TicketPercent,
  BookOpen,
  MessageSquare,
  ShoppingBasket,
  LayoutTemplate,
  X,
  type LucideIcon,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { CONTADORES_CADA_MS, type ContadoresRespuesta } from '@/types/panel'

// ============================================================================
// Sidebar v10 hibrido — Sesion 23 Fase C Ola 1 + ajuste por Dabycho
// Estructura por SECCIONES (7 grupos): Principal/Reservas/Catalogos/Personas/
// Operacion/Tienda/Otros. La seccion "Otros" preserva items del sidebar
// pre-v10 (Inventario, Empleados, Pagos, QR codes, Gamificacion, Alertas,
// Configuracion, Exp. Publicas, Calendario, Entregas) para no perder accesos
// rapidos del dashboard anterior. C31 relajado: Inventario en "Otros"
// (no es item principal de sofias pero sigue accesible).
// ============================================================================

type BadgeKey = 'reservasActivas' | 'leadsNuevos' | 'misEventosHoy' | 'pedidosPorPreparar' | 'mensajesNuevos'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  permiso: string
  /** R11b (MANP1): el item se ve con CUALQUIERA de estos permisos (si viene, manda sobre `permiso`). */
  permisosAlguno?: string[]
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
      // K4 (R8, DR22): Mi día del guía (sus experiencias de hoy, sin contacto, con el check «Llegaron»).
      { href: '/admin/mi-dia', label: 'Mi día', icon: Clock, permiso: 'mi_dia', badgeKey: 'misEventosHoy' },
    ],
  },
  {
    label: 'Reservas',
    items: [
      { href: '/admin/reservas', label: 'Reservas Privadas', icon: Calendar, permiso: 'reservas', badgeKey: 'reservasActivas' },
      // PS1 (30-sep): fuentes, chinampas y cocinas que usan las reservas
      { href: '/admin/catalogos', label: 'Catálogos de reservas', icon: Tags, permiso: 'reservas' },
      // PS1 Ola 2: fechas públicas (tickets por canal) y eventos internos
      { href: '/admin/eventos', label: 'Eventos y fechas públicas', icon: Ticket, permiso: 'reservas' },
      // PS1 Ola 2: la semana de lunes a domingo + Junta Turismo (guías, cocina, admins)
      { href: '/admin/planeacion', label: 'Planeación semanal', icon: CalendarRange, permiso: 'planeacion' },
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
      // R11b (WF11, DR71): mensajes de /contacto y correos del newsletter. Permiso nuevo `mensajes` (admin y super_admin).
      { href: '/admin/mensajes', label: 'Mensajes', icon: MessageSquare, permiso: 'mensajes', badgeKey: 'mensajesNuevos' },
      // R11b (MANP1, DR74): la guía del panel y el manual de Experiencias; los guías solo la parte de Mi día.
      {
        href: '/admin/manuales',
        label: 'Manuales',
        icon: BookOpen,
        permiso: 'experiencias_privadas',
        permisosAlguno: ['experiencias_publicas', 'experiencias_privadas', 'mi_dia'],
      },
    ],
  },
  {
    // R15 · F1 (WF7, DR61): lo que el equipo edita del sitio público nuevo. Permiso nuevo `contenido_sitio` (admin y super_admin).
    label: 'Sitio web',
    items: [
      { href: '/admin/contenido-sitio', label: 'Contenido del sitio', icon: LayoutTemplate, permiso: 'contenido_sitio' },
    ],
  },
  {
    label: 'Tienda',
    items: [
      { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart, permiso: 'pedidos', badgeKey: 'pedidosPorPreparar' },
      { href: '/admin/productos', label: 'Productos', icon: Leaf, permiso: 'productos' },
      { href: '/admin/suscripciones', label: 'Suscripciones', icon: Repeat, permiso: 'suscripciones' },
      // Fase 4b (sesión 40): cupones de la tienda y de las reservas privadas (CP1). Permiso nuevo `cupones` (admin y super_admin).
      { href: '/admin/cupones', label: 'Cupones', icon: TicketPercent, permiso: 'cupones' },
      // R11b (CARR1, DR58): carritos abandonados, con su propio permiso `carritos` (admin, operador y super_admin).
      { href: '/admin/carritos-abandonados', label: 'Carritos abandonados', icon: ShoppingBasket, permiso: 'carritos' },
    ],
  },
  {
    label: 'Otros',
    items: [
      { href: '/admin/calendario', label: 'Calendario', icon: Calendar, permiso: 'calendario' },
      { href: '/admin/entregas', label: 'Entregas', icon: Truck, permiso: 'entregas' },
      // R6 (M10): días sin entrega (feriados LFT + los de las encargadas). Ven quienes tienen `entregas`; edita `dias_sin_entrega`.
      { href: '/admin/entregas/dias-sin-entrega', label: 'Días sin entrega', icon: CalendarOff, permiso: 'entregas' },
      { href: '/admin/inventario', label: 'Inventario', icon: Warehouse, permiso: 'inventario' },
      { href: '/admin/empleados', label: 'Empleados', icon: UserCheck, permiso: 'empleados' },
      { href: '/admin/pagos', label: 'Pagos', icon: CreditCard, permiso: 'pagos' },
      // R9-b (sesión 49): /admin/qr-codes se retiró (QR viejo que nunca validó); next.config.js la redirige a /admin.
      { href: '/admin/gamificacion', label: 'Gamificacion', icon: Award, permiso: 'gamificacion' },
      // R8 (ALR1, M3): /admin/alertas y /admin/configuracion se retiraron (eran de adorno); next.config.js las redirige a /admin.
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
  pedidosPorPreparar?: number
  mensajesNuevos?: number
}

// K6 (R11): UNA llamada por minuto a /api/admin/contadores (antes una por contador). La API solo manda las llaves que el
// rol activo puede ver; una llave ausente = sin insignia. `undefined` = los permisos aún no cargan: no se pide nada.
// «Reservas» cuenta las tentativas (las que esperan confirmación): antes sumaba las confirmadas del mes y crecía todo el mes.
export function useSidebarBadges(permisosActivos?: string[]): SidebarBadges {
  const { data: session } = useSession()
  const [badges, setBadges] = useState<SidebarBadges>({})
  const clavePermisos = permisosActivos === undefined ? null : [...permisosActivos].sort().join(',')

  useEffect(() => {
    const token = session?.accessToken
    if (!token || clavePermisos === null) return
    let cancelled = false
    const positivo = (n: number | undefined) => (typeof n === 'number' && n > 0 ? n : undefined)

    async function fetchAll(authToken: string) {
      try {
        const r = await fetch(`${API_URL}/api/admin/contadores`, { headers: { Authorization: `Bearer ${authToken}` } })
        if (!r.ok) return
        const data: ContadoresRespuesta = await r.json()
        if (cancelled) return
        setBadges({
          reservasActivas: positivo(data.reservas_tentativas),
          leadsNuevos: positivo(data.leads_nuevos),
          misEventosHoy: positivo(data.mi_dia_hoy),
          pedidosPorPreparar: positivo(data.pedidos_por_preparar),
          mensajesNuevos: positivo(data.mensajes_nuevos),
        })
      } catch {
        /* silencioso: el menú sigue sin insignias */
      }
    }

    fetchAll(token)
    const interval = setInterval(() => fetchAll(token), CONTADORES_CADA_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [session?.accessToken, clavePermisos])

  return badges
}

function puedeVer(item: NavItem, permisos: string[]): boolean {
  if (item.permisosAlguno) return item.permisosAlguno.some((p) => permisos.includes(p))
  return permisos.includes(item.permiso)
}

/**
 * R8 (M3): primera pantalla del menú que el rol puede ver. La usa /admin (Dashboard) para mandar a quien no tiene
 * `dashboard` (un guía, cocina) a su pantalla en vez de mostrarle «No se pudo cargar el dashboard».
 * Mi día va primero si la tiene. null = ninguna.
 */
export function primeraRutaPermitida(permisos: string[] | null | undefined): string | null {
  if (!permisos || permisos.length === 0) return null
  if (permisos.includes('dashboard')) return '/admin'
  if (permisos.includes('mi_dia')) return '/admin/mi-dia'
  for (const seccion of NAV_SECTIONS) {
    for (const item of seccion.items) {
      if (puedeVer(item, permisos)) return item.href
    }
  }
  return null
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
  const badges = useSidebarBadges(permisosActivos)

  // Cerrar sidebar al cambiar de ruta en mobile
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Filtrar items por permisos.
  //
  // `undefined` = todavia no cargan (se muestra todo un instante para no
  // parpadear). `[]` = ya cargaron y esta persona no tiene permisos, asi que
  // NO se muestra nada.
  //
  // Antes las dos cosas se trataban igual y la lista vacia mostraba TODO el
  // menu. Combinado con que el backend tampoco validaba permisos, "sin rol"
  // acababa siendo acceso maximo en las dos capas. Desde el 2026-08-07 el
  // backend deniega por defecto (core/dependencies.py::requiere_permiso); si
  // aqui se siguiera mostrando todo, el menu ofreceria pantallas que la API
  // va a rechazar con 403.
  const filterItems = (items: NavItem[]) => {
    if (permisosActivos === undefined) return items
    return items.filter((item) => puedeVer(item, permisosActivos))
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
          fixed lg:static top-0 left-0 bottom-0 w-64 shrink-0 bg-white border-r border-neutro-borde z-50
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
              {/* CLARO1 (R15 · F1, C19): verde-suave daba 3.77 sobre blanco; verde-medio 5.59. */}
              <div className="text-xs uppercase tracking-wide text-verde-medio px-4 py-2 font-semibold">
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
                              ? 'bg-terracota/10 text-terracota-oscuro border-l-2 border-terracota' // CLARO1: la letra 4.33 → 4.98; el borde igual
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
