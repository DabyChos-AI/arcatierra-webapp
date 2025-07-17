'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  className?: string
  variant?: 'default' | 'minimal'
}

export default function LogoutButton({ className = '', variant = 'default' }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut({ callbackUrl: '/', redirect: true })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        className={`block w-full text-left px-4 py-2 text-sm text-verde-tipografia hover:bg-neutro-crema ${className}`}
      >
        {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 text-white bg-terracota hover:bg-terracota-oscuro transition-colors rounded-lg ${className}`}
    >
      {loading ? (
        <span className="animate-pulse">Cerrando sesión...</span>
      ) : (
        <>
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </>
      )}
    </button>
  )
}
