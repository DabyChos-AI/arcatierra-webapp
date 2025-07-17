'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function CateringHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const openWhatsApp = () => {
    const phoneNumber = '5219982270070';
    const message = encodeURIComponent('Hola, me interesa cotizar un evento con Arca Tierra Catering');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const menuItems = [
    { name: 'Inicio', id: 'hero' },
    { name: 'Servicios', id: 'servicios' },
    { name: 'Menús', id: 'about' },
    { name: 'Clientes', id: 'clientes' },
    { name: 'Contacto', id: 'contacto' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/images/logos/logo_arcatierra_horizontal.png"
              alt="Arca Tierra Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-verde-dark hover:text-terracota-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Botón CTA Desktop */}
          <div className="hidden md:block">
            <button
              onClick={openWhatsApp}
              style={{
                backgroundColor: '#B15543', /* terracota principal */
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
                transition: 'all 0.3s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#975543'; /* terracota oscuro */
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#B15543'; /* terracota principal */
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Cotizar evento
            </button>
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-verde-dark hover:text-terracota-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-neutral-light">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-3 py-2 text-verde-dark hover:text-terracota-primary hover:bg-neutral-light transition-colors duration-200 font-medium rounded-md"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4">
                <button
                  onClick={openWhatsApp}
                  style={{
                    backgroundColor: '#B15543', /* terracota principal */
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    width: '100%',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#975543'; /* terracota oscuro */
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#B15543'; /* terracota principal */
                  }}
                >
                  Cotizar evento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
