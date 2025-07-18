'use client'

import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-principal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <OptimizedImage                 src="/logo_arcatierra_blanco.png"
                alt="Arca Tierra"
                width={150}
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Proyecto pionero de agricultura sostenible y regenerativa en las chinampas de Xochimilco, 
              comprometido con la preservación de saberes ancestrales y la innovación alimentaria.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/arcatierra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-terracota transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/arcatierra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-terracota transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com/arcatierra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-terracota transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://www.youtube.com/arcatierra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-terracota transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Enlaces</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-terracota transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/experiencias" className="text-gray-300 hover:text-terracota transition-colors">
                  Experiencias
                </Link>
              </li>
              <li>
                <Link href="/chinampas" className="text-gray-300 hover:text-terracota transition-colors">
                  Chinampas
                </Link>
              </li>
              <li>
                <Link href="/prensa" className="text-gray-300 hover:text-terracota transition-colors">
                  Prensa
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-terracota transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-terracota mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  Embarcadero Cuemanco, Periférico Sur S/N, Xochimilco, CDMX, México
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-terracota mr-3 flex-shrink-0" />
                <a href="tel:+525555555555" className="text-gray-300 hover:text-terracota transition-colors">
                  +52 55 5555 5555
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-terracota mr-3 flex-shrink-0" />
                <a href="mailto:contacto@arcatierra.com" className="text-gray-300 hover:text-terracota transition-colors">
                  contacto@arcatierra.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Boletín */}
        <div className="mt-12 pt-12 border-t border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-3">Suscríbete a nuestro boletín</h3>
              <p className="text-gray-300 mb-4">
                Recibe noticias, eventos y actualizaciones sobre Arca Tierra
              </p>
            </div>
            <div>
              <form className="flex flex-wrap sm:flex-nowrap gap-4">
                <input
                  type="email" className="w-full sm:flex-grow px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-terracota"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-terracota text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Suscribirse
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Arca Tierra. Todos los derechos reservados.
          </div>
          <div className="flex space-x-8">
            <Link href="/privacidad" className="text-sm text-gray-400 hover:text-terracota transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="text-sm text-gray-400 hover:text-terracota transition-colors">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
