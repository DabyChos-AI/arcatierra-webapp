'use client'

import { createContext, useContext } from 'react'
import type { TemaAdmin } from '../tema'

// K2: el tema activo del panel. Lo provee AdminLayoutClient; lo usan el botón de la barra y lo que pinta colores
// por props en vez de clases (gráficas de recharts).
export interface EstadoTemaAdmin {
  tema: TemaAdmin
  alternarTema: () => void
}

export const TemaAdminContext = createContext<EstadoTemaAdmin>({ tema: 'claro', alternarTema: () => {} })

export function useTemaAdmin() {
  return useContext(TemaAdminContext)
}
