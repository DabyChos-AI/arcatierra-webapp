/**
 * AUTENTICACIÓN TEMPORALMENTE DESACTIVADA
 * Componente AuthProvider comentado para evitar errores de NextAuth
 */
'use client'

// import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Versión simplificada sin NextAuth
  return <>{children}</>
  // Versión original: return <SessionProvider>{children}</SessionProvider>
}

