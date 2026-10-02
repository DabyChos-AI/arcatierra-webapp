'use client'

// HDR1 (R3, 1-oct-2026): la insignia del panel («Fundador», «Super Admin») la decide el backend en
// GET /api/admin/roles/mis-roles. AdminLayoutClient la pide UNA vez y la reparte por este contexto a
// las páginas que viven dentro del layout del panel (Inicio y Gamificación). Antes cada página
// comparaba el correo de la sesión con una lista escrita en el código.
// TB1 (R7, 2-oct-2026): también reparte el rol ACTIVO (`rol_activo` de mis-roles, el mismo que guarda
// AdminLayoutClient y que cambia «Cambiar rol»), para que AdminTopbar diga el rol real.

import { createContext, useContext } from 'react'
import type { InsigniaPanel, RolActivo } from '@/types/roles'

export interface MisRolesContexto {
  /** null mientras carga, si la API no la manda (anterior a R3) o si no hay insignia. */
  insignia: InsigniaPanel
  /** null mientras carga, si mis-roles falla o si el usuario no tiene rol activo. */
  rolActivo: RolActivo | null
}

export const MisRolesContext = createContext<MisRolesContexto>({ insignia: null, rolActivo: null })

export function useMisRoles(): MisRolesContexto {
  return useContext(MisRolesContext)
}

// TB1: nombre visible de cada rol de `roles_admin.nombre`. Uno que no esté aquí se muestra con mayúscula
// inicial; sin rol (cargando, error o ninguno) → null y la barra no pinta nada (nunca «Admin» por omisión).
const NOMBRE_ROL: Record<string, string> = {
  admin: 'Admin',
  super_admin: 'Super Admin',
  cocina: 'Cocina',
  guia: 'Guía',
  operador: 'Operador',
  visor: 'Visor',
}

export function etiquetaRol(nombre: string | null | undefined): string | null {
  const limpio = (nombre ?? '').trim()
  if (!limpio) return null
  return NOMBRE_ROL[limpio] ?? limpio.charAt(0).toUpperCase() + limpio.slice(1)
}
