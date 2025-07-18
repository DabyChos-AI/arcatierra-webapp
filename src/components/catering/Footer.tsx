'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

const CateringFooter = () => {
  return (
    <footer className="bg-verde-dark text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <OptimizedImage
              src="/images/logos/logo_arcatierra_blanco.png"
              alt="Arca Tierra Catering"
              width={150}
              height={50}
              className="h-12 w-auto mb-4"
            />
            <p className="text-neutral-light text-sm leading-relaxed">
              Catering consciente y sustentable con ingredientes 100% orgánicos para eventos únicos en CDMX.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li><a href="#inicio" className="text-neutral-light hover:text-white transition-colors text-sm">Inicio</a></li>
              <li><a href="#servicios" className="text-neutral-light hover:text-white transition-colors text-sm">Servicios</a></li>
              <li><a href="#menus" className="text-neutral-light hover:text-white transition-colors text-sm">Menús</a></li>
              <li><a href="#clientes" className="text-neutral-light hover:text-white transition-colors text-sm">Clientes</a></li>
              <li><a href="#contacto" className="text-neutral-light hover:text-white transition-colors text-sm">Contacto</a></li>
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-semibold text-white mb-4">Servicios</h4>
            <ul className="space-y-2">
              <li><span className="text-neutral-light text-sm">Family Style</span></li>
              <li><span className="text-neutral-light text-sm">Canapés</span></li>
              <li><span className="text-neutral-light text-sm">Emplatado</span></li>
              <li><span className="text-neutral-light text-sm">Coffee Break</span></li>
              <li><span className="text-neutral-light text-sm">Menús de temporada</span></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-terracota-light" />
                <a href="mailto:sofia@arcatierra.com" className="text-neutral-light hover:text-white transition-colors text-sm">
                  sofia@arcatierra.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-terracota-light" />
                <a href="tel:+5219982270070" className="text-neutral-light hover:text-white transition-colors text-sm">
                  +52 1 998 227 0070
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram size={16} className="text-terracota-light" />
                <a href="https://instagram.com/arca.tierra" target="_blank" rel="noopener noreferrer" className="text-neutral-light hover:text-white transition-colors text-sm">
                  @arca.tierra
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-terracota-light" />
                <span className="text-neutral-light text-sm">CDMX y área metropolitana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-verde-medium mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-light text-sm">
              © 2024 Arca Tierra Catering. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-neutral-light text-sm">Catering consciente y sustentable</span>
              <span className="text-terracota-light text-sm">•</span>
              <span className="text-neutral-light text-sm">Ingredientes 100% orgánicos</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CateringFooter;
