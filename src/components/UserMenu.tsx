'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { User, LogOut, Settings, ShoppingBag, Calendar, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    )
  }

  if (!session) {
    return (
      <Button
        onClick={() => signIn('google')}
        className="bg-[#B15543] hover:bg-[#9a4a3a] text-white px-4 py-2 rounded-lg transition-colors"
      >
        Iniciar Sesión
      </Button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <img
          src={session.user?.image || '/default-avatar.png'}
          alt={session.user?.name || 'Usuario'}
          className="w-8 h-8 rounded-full"
        />
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {session.user?.name?.split(' ')[0]}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={session.user?.image || '/default-avatar.png'}
                  alt={session.user?.name || 'Usuario'}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{session.user?.name}</p>
                  <p className="text-sm text-gray-500">{session.user?.email}</p>
                  {session.user?.role === 'admin' && (
                    <span className="inline-block px-2 py-1 text-xs bg-[#33503E] text-white rounded-full mt-1">
                      Administrador
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-2">
              <a
                href="/perfil"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Mi Perfil
              </a>
              <a
                href="/mis-pedidos"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Mis Pedidos
              </a>
              <a
                href="/mis-reservas"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Mis Reservas
              </a>
              <a
                href="/mis-catering"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChefHat className="w-4 h-4" />
                Mis Catering
              </a>
              {session.user?.role === 'admin' && (
                <a
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Dashboard Admin
                </a>
              )}
            </div>

            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

