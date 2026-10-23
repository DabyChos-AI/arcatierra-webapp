import React from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { Facebook, Instagram, Mail, Phone, MapPin, Youtube } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
// TEL3: teléfono y redes de una sola fuente
import { CONTACTO, CORREO_GENERAL, ICONO_TIKTOK_PATH, SAME_AS } from '@/lib/contacto';

const Footer: React.FC = () => {
  return (
    <footer className="main-footer" role="contentinfo">
      <div className="footer-content">
        {/* Sección de empresa con Schema.org */}
        <div className="footer-section" itemScope itemType="https://schema.org/Organization">
          <div style={{ position: 'relative', width: '180px', height: '54px' }} className="mb-4">
            <OptimizedImage
              src="/images/logos/logo_arcatierra_horizontal.png"
              alt="ArcaTierra"
              width={180}
              height={54}
              itemProp="logo"
              style={{
                filter: 'brightness(0) invert(1)', // Hace que el logo sea blanco
                width: 'auto',
                height: '54px',
                maxWidth: '100%'
                // height: 'auto' - Eliminado para evitar contradicción con height: '54px'
              }} />
          </div>
          <p className="text-white/90 mb-4" itemProp="description">
            Conectando las chinampas de Xochimilco con tu mesa. 
            Productos orgánicos, frescos y sustentables.
          </p>
          <meta itemProp="name" content="ArcaTierra" />
          <meta itemProp="url" content="https://arcatierra.com" />
          <meta itemProp="foundingDate" content="2009" />
          <meta itemProp="founder" content="Lucio Usobiaga" />
        </div>

        {/* Enlaces rápidos */}
        <div className="footer-section">
          <h3 className="footer-section h3">Enlaces Rápidos</h3>
          <nav aria-label="Enlaces del footer">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/tienda" 
                  className="footer-section a hover:text-white transition-colors"
                >
                  Tienda de Alimentos
                </Link>
              </li>
              <li>
                <Link 
                  href="/experiencias" 
                  className="footer-section a hover:text-white transition-colors"
                >
                  Experiencias de Turismo Rural y Gastronómicas
                </Link>
              </li>
              <li>
                <Link 
                  href="/catering" 
                  className="footer-section a hover:text-white transition-colors"
                >
                  Catering Consciente
                </Link>
              </li>
              <li>
                <Link 
                  href="/nosotros" 
                  className="footer-section a hover:text-white transition-colors"
                >
                  Nuestra Red Agrícola
                </Link>
              </li>
              <li>
                <Link 
                  href="/sustentabilidad" 
                  className="footer-section a hover:text-white transition-colors"
                >
                  Sustentabilidad
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Información de contacto */}
        <div className="footer-section" itemScope itemType="https://schema.org/ContactPoint">
          <h3 className="footer-section h3">Contacto</h3>
          <address className="not-italic space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-white/80" />
              <a 
                href={`mailto:${CORREO_GENERAL}`}
                className="footer-section a hover:text-white transition-colors"
                itemProp="email"
              >
                {CORREO_GENERAL}
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-white/80" />
              <a 
                href={CONTACTO.telefonoHref}
                className="footer-section a hover:text-white transition-colors"
                itemProp="telephone"
              >
                {CONTACTO.telefonoVisible}
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-white/80" />
              <span className="text-white/90" itemProp="address">
                Xochimilco, CDMX
              </span>
            </div>
          </address>
          <meta itemProp="contactType" content="customer service" />
          <meta itemProp="availableLanguage" content="es-MX" />
        </div>

        {/* Redes sociales */}
        <div className="footer-section">
          <h3 className="footer-section h3">Síguenos</h3>
          <div className="flex space-x-4">
            <a
              href={CONTACTO.redes.facebook}
              aria-label="Facebook de ArcaTierra"
              rel="noopener noreferrer"
              target="_blank"
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Facebook className="h-6 w-6 text-white" />
            </a>
            <a
              href={CONTACTO.redes.instagram}
              aria-label="Instagram de ArcaTierra"
              rel="noopener noreferrer"
              target="_blank"
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Instagram className="h-6 w-6 text-white" />
            </a>
            <a
              href={CONTACTO.redes.tiktok}
              aria-label="TikTok de ArcaTierra"
              rel="noopener noreferrer"
              target="_blank"
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d={ICONO_TIKTOK_PATH} />
              </svg>
            </a>
            <a
              href={CONTACTO.redes.youtube}
              aria-label="YouTube de ArcaTierra"
              rel="noopener noreferrer"
              target="_blank"
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Youtube className="h-6 w-6 text-white" />
            </a>
          </div>
          
          {/* Newsletter */}
          <div className="mt-6">
            <h4 className="text-white font-semibold mb-3">Newsletter</h4>
            {/* WF11 (R11b): guarda el correo con su consentimiento; se ve y se exporta en /admin/mensajes */}
            <NewsletterForm origen="pie" />
          </div>
        </div>
      </div>

      {/* Footer bottom con información legal */}
      <div className="footer-bottom border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/80 text-sm">
          &copy; 2025 ArcaTierra. Todos los derechos reservados.
        </p>
        
        <nav className="legal-links flex flex-wrap gap-6" aria-label="Enlaces legales">
          <Link 
            href="/privacidad" 
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            Política de Privacidad
          </Link>
          <Link 
            href="/terminos" 
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            Términos y Condiciones
          </Link>
        </nav>
      </div>

      {/* Schema.org JSON-LD adicional */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ArcaTierra",
            "description": "Red local de agricultura regenerativa y comercio justo de alimentos mexicanos naturales",
            "url": "https://www.arcatierra.com",
            "logo": "https://www.arcatierra.com/logo-arcatierra.png",
            "foundingDate": "2009",
            "founder": {
              "@type": "Person",
              "name": "Lucio Usobiaga"
            },
            "location": {
              "@type": "Place",
              "name": "Chinampas de Xochimilco",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Xochimilco",
                "addressRegion": "CDMX",
                "addressCountry": "MX"
              }
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": CONTACTO.telefono,
              "contactType": "customer service",
              "email": CORREO_GENERAL,
              "availableLanguage": "es-MX"
            },
            "sameAs": SAME_AS,
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Productos Orgánicos ArcaTierra",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Canastas de Temporada",
                    "description": "Canastas con productos orgánicos de temporada"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Experiencias Gastronómicas",
                    "description": "Experiencias de turismo rural y gastronómico en Xochimilco"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Catering Consciente",
                    "description": "Servicios de catering con productos agroecológicos"
                  }
                }
              ]
            }
          })
        }}
      />
    </footer>
  );
};

export default Footer;

