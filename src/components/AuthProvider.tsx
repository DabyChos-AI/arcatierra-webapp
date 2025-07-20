/**
 * AuthProvider - Proveedor de sesión para NextAuth
 * Envuelve la aplicación para permitir el uso de useSession
 */
'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Proveedor de sesión activo para NextAuth
  return <SessionProvider>{children}</SessionProvider>
}

