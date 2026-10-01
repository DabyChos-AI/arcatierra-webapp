// Roles del panel (R3, sesión 43, 1-oct-2026). Dueño: el líder.
// Forma exacta de GET /api/admin/roles/mis-roles (routers/admin_roles.py::mis_roles), que el panel pide por el proxy
// /api/admin/roles/mis-roles. HDR1: la insignia («Fundador», «Super Admin») la decide el BACKEND con una lista privada
// del servidor; el front solo la pinta. Ningún correo se escribe en el código del front.

export type InsigniaPanel = 'fundador' | 'developer' | null

export interface RolActivo {
  id: string
  nombre: string
  permisos: string[]
}

export interface RolUsuario {
  id: string
  nombre: string
  descripcion: string
  permisos: string[]
  es_activo: boolean
  created_at?: string | null
}

export interface MisRoles {
  roles: RolUsuario[]
  rol_activo: RolActivo | null
  permisos_activos: string[]
  /** null = sin insignia. Ausente (API anterior a R3) se trata igual que null. */
  insignia?: InsigniaPanel
}

/** Corona dorada «Fundador»: la tienen los fundadores y el developer (igual que antes de R3). */
export function esFundador(insignia: InsigniaPanel | undefined): boolean {
  return insignia === 'fundador' || insignia === 'developer'
}

/** Insignia «Super Admin» del developer. */
export function esDeveloper(insignia: InsigniaPanel | undefined): boolean {
  return insignia === 'developer'
}
