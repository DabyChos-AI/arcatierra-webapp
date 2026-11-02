'use client'

// R15 v2 · F6 (cuenta, sesión 64): lo que el marco de Mi cuenta comparte con sus pestañas (f6/cuenta-F6.md §2). El marco pide UNA vez
// `GET /api/auth/me` (el proxy de hoy, la misma llamada de `usuario/perfil/page.tsx:94`) y Datos la lee de aquí: no la vuelve a pedir y, al
// guardar, el nombre del encabezado y de la tarjeta lateral cambia. Las pestañas de compras no lo necesitan. Todo en el navegador (D-F6-10 P-5).

import { createContext, useContext } from 'react'

/** Las preferencias como las guarda y las devuelve `/api/auth/me` (`usuario/perfil/page.tsx:123-131`, `:180-184`). */
export interface PreferenciasMe {
  newsletter?: boolean
  notificaciones?: boolean
  restricciones_dieteticas?: string[]
}

/** Lo que Mi cuenta lee de `GET /api/auth/me` (las llaves que lee hoy `usuario/perfil/page.tsx:113-138`). */
export interface MeCuenta {
  id?: string | number
  nombre?: string | null
  apellidos?: string | null
  nombre_completo?: string | null
  email?: string | null
  telefono?: string | null
  codigo_pais?: string | null
  fecha_nacimiento?: string | null
  fecha_registro?: string | null
  preferencias?: PreferenciasMe | null
}

export type EstadoMe = 'cargando' | 'listo' | 'error'

export interface Cuenta {
  me: MeCuenta | null
  estadoMe: EstadoMe
  /** Vuelve a pedir `/api/auth/me` (el «Reintentar» de Datos). */
  recargarMe: () => void
  /** Después de un PATCH que salió bien: lo guardado pasa a lo que se ve (como `setProfile(editedProfile)`, `perfil:218`). */
  actualizarMe: (cambios: Partial<MeCuenta>) => void
}

export const ContextoCuenta = createContext<Cuenta | null>(null)

/** Solo dentro de `MarcoCuenta` (el layout de `src/app/nuevo/usuario/`). */
export function useCuenta(): Cuenta {
  const cuenta = useContext(ContextoCuenta)
  if (!cuenta) throw new Error('useCuenta() va dentro de MarcoCuenta')
  return cuenta
}
