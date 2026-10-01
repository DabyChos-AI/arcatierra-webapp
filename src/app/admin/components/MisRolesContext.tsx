'use client'

// HDR1 (R3, 1-oct-2026): la insignia del panel («Fundador», «Super Admin») la decide el backend en
// GET /api/admin/roles/mis-roles. AdminLayoutClient la pide UNA vez y la reparte por este contexto a
// las páginas que viven dentro del layout del panel (Inicio y Gamificación). Antes cada página
// comparaba el correo de la sesión con una lista escrita en el código.

import { createContext, useContext } from 'react'
import type { InsigniaPanel } from '@/types/roles'

export interface MisRolesContexto {
  /** null mientras carga, si la API no la manda (anterior a R3) o si no hay insignia. */
  insignia: InsigniaPanel
}

export const MisRolesContext = createContext<MisRolesContexto>({ insignia: null })

export function useMisRoles(): MisRolesContexto {
  return useContext(MisRolesContext)
}
