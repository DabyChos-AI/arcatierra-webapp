'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo_arcatierra_horizontal.png"
                alt="Arca Tierra"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Navegación principal */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-terracota px-3 py-2 text-sm font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link 
              href="/experiencias" 
              className="text-gray-700 hover:text-terracota px-3 py-2 text-sm font-medium transition-colors"
            >
              Experiencias
            </Link>
            <Link 
              href="/chinampas" 
              className="text-gray-700 hover:text-terracota px-3 py-2 text-sm font-medium transition-colors"
            >
              Chinampas
            </Link>
            <Link 
              href="/prensa" 
              className="text-terracota px-3 py-2 text-sm font-medium border-b-2 border-terracota"
            >
              Prensa
            </Link>
            <Link 
              href="/contacto" 
              className="text-gray-700 hover:text-terracota px-3 py-2 text-sm font-medium transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Navegación móvil - botón hamburguesa */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-terracota focus:outline-none focus:text-terracota"
              aria-label="Abrir menú"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-terracota block px-3 py-2 text-base font-medium"
          >
            Inicio
          </Link>
          <Link 
            href="/experiencias" 
            className="text-gray-700 hover:text-terracota block px-3 py-2 text-base font-medium"
          >
            Experiencias
          </Link>
          <Link 
            href="/chinampas" 
            className="text-gray-700 hover:text-terracota block px-3 py-2 text-base font-medium"
          >
            Chinampas
          </Link>
          <Link 
            href="/prensa" 
            className="text-terracota block px-3 py-2 text-base font-medium bg-orange-50"
          >
            Prensa
          </Link>
          <Link 
            href="/contacto" 
            className="text-gray-700 hover:text-terracota block px-3 py-2 text-base font-medium"
          >
            Contacto
          </Link>
        </div>
      </div>
    </header>
  )
}
