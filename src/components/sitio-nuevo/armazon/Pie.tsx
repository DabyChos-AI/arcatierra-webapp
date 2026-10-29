// R15 v2 · F1: el pie del sitio nuevo (maqueta `footer.f-v7`): marca + boletín, tres columnas y la franja de abajo (©, legales, redes).
// Contrato v2 §9 C20, C23, C25. Componente de servidor. Originales (DR-17): Footer.tsx de hoy y src/lib/contacto.ts (TEL3, MAILC1).
// - Boletín: el de hoy, `<NewsletterForm origen="pie" />` sin tocar (misma llamada POST /api/newsletter, casilla, trampa y testids
//   `newsletter-*`) dentro de `.footer-section`, como hoy (C35); título «Newsletter» de hoy; la frase de la maqueta no existe en el sitio
//   (pregunta C41): marca.
// - Contacto: título «Contacto», «Xochimilco, CDMX», correo y teléfono de contacto.ts (los de la maqueta son relleno).
// - Los títulos de las dos columnas de ligas («Come Arca» / «Vive Arca» en la maqueta) no existen hoy (pregunta C41): marcas.
// - © con el año de México (no el «2025» fijo de hoy ni el «2026» de la maqueta); Privacidad y Términos de hoy; sin «Cookies» (C20).
// - Redes: las 4 de contacto.ts + WhatsApp (ninguna se quita, DR-10). Sin JSON-LD: lo pinta el layout raíz (C25).
import Image from 'next/image'
import Link from 'next/link'
import { Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react'
import NewsletterForm from '@/components/layout/NewsletterForm'
import Falta from '@/components/sitio-nuevo/Falta'
import { CONTACTO, CORREO_GENERAL, ICONO_TIKTOK_PATH, REDES_SOCIALES } from '@/lib/contacto'
import { hoyMexico } from '@/lib/dates'
import { ENLACES_LEGALES, ligasDe, type Enlace, type Lugar } from './enlaces'
import { E } from './estilos'

export default function Pie() {
  const anio = hoyMexico().slice(0, 4)

  return (
    <footer data-testid="sn-pie" className={E.pie.raiz}>
      {/* Arriba: marca + boletín */}
      <div className={E.pie.arriba}>
        <div className={E.pie.marca}>
          {/* El logo de hoy en blanco, como el pie de hoy (Footer.tsx). */}
          <Image
            src="/images/logos/logo_arcatierra_horizontal.png"
            alt="Arca Tierra"
            width={1332}
            height={349}
            className={E.pie.logo}
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
        <div data-testid="sn-pie-boletin" className={E.pie.boletin}>
          <p className={E.pie.titulo}>Newsletter</p>
          <p className={E.pie.boletinFrase}>
            <Falta que="frase del boletín" quien="Lucio y Pablo" />
          </p>
          {/* C35: el mismo contexto que en el pie de hoy (Footer.tsx: dentro de .footer-section), que le da a su liga «Aviso de
              privacidad» el blanco al 90 % de globals.css (.footer-section a). Solo el formulario: sin título ni h3 adentro. */}
          <div className="footer-section">
            <NewsletterForm origen="pie" />
          </div>
        </div>
      </div>

      {/* Columnas */}
      <div className={E.pie.columnas}>
        <div data-testid="sn-pie-contacto">
          <p className={E.pie.titulo}>Contacto</p>
          <address className={E.pie.direccion}>
            <span>Xochimilco, CDMX</span>
            <a href={`mailto:${CORREO_GENERAL}`} data-testid="sn-pie-correo" className={E.pie.enlace}>
              {CORREO_GENERAL}
            </a>
            <a href={CONTACTO.telefonoHref} data-testid="sn-pie-telefono" className={E.pie.enlace}>
              {CONTACTO.telefonoVisible}
            </a>
          </address>
        </div>
        <ColumnaLigas lugar="pie-tienda" falta="título de la columna de la tienda" />
        <ColumnaLigas lugar="pie-experiencias" falta="título de la columna de experiencias" />
      </div>

      <FranjaDeAbajo anio={anio} />
    </footer>
  )
}

/** Abajo: el ©, los legales de hoy y las redes (las 4 de contacto.ts + WhatsApp). */
function FranjaDeAbajo({ anio }: { anio: string }) {
  return (
    <div className={E.pie.abajo}>
      <p className={E.pie.copy}>&copy; {anio} ArcaTierra. Todos los derechos reservados.</p>
      <div className={E.pie.abajoDerecha}>
        <nav aria-label="Enlaces legales" className={E.pie.legales}>
          {ENLACES_LEGALES.map(({ texto, href }) => (
            <Link key={href} href={href} className={E.pie.legal} data-testid="sn-pie-legal" data-href={href}>
              {texto}
            </Link>
          ))}
        </nav>
        <ul className={E.pie.redes}>
          {REDES_SOCIALES.map(({ red, nombre, url }) => <RedSocial key={red} red={red} nombre={nombre} url={url} />)}
          <RedSocial red="whatsapp" nombre="WhatsApp" url={CONTACTO.whatsappUrl} />
        </ul>
      </div>
    </div>
  )
}

/** El ícono de cada red. TikTok no viene en lucide: su trazo está en contacto.ts. */
function IconoRed({ red }: { red: string }) {
  const tam = 16
  switch (red) {
    case 'instagram':
      return <Instagram size={tam} aria-hidden="true" focusable="false" />
    case 'facebook':
      return <Facebook size={tam} aria-hidden="true" focusable="false" />
    case 'youtube':
      return <Youtube size={tam} aria-hidden="true" focusable="false" />
    case 'tiktok':
      return (
        <svg width={tam} height={tam} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d={ICONO_TIKTOK_PATH} />
        </svg>
      )
    default:
      return <MessageCircle size={tam} aria-hidden="true" focusable="false" />
  }
}

/** Una red: abre en otra pestaña y se nombra «<red> de ArcaTierra». */
function RedSocial({ red, nombre, url }: { red: string; nombre: string; url: string }) {
  return (
    <li>
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${nombre} de ArcaTierra`} className={E.pie.red} data-testid="sn-pie-red" data-red={red}>
        <IconoRed red={red} />
      </a>
    </li>
  )
}

/** Una columna de ligas del pie. Su título no existe hoy (pregunta C41): la marca, en su letra (no hereda mayúsculas ni color). */
function ColumnaLigas({ lugar, falta }: { lugar: Lugar; falta: string }) {
  return (
    <div>
      <p className={E.pie.tituloMarca}>
        <Falta que={falta} quien="Lucio y Pablo" />
      </p>
      <ul className={E.pie.lista}>
        {ligasDe(lugar).map((liga) => <LigaDelPie key={`${liga.href}·${liga.texto}`} liga={liga} />)}
      </ul>
    </div>
  )
}

function LigaDelPie({ liga }: { liga: Enlace }) {
  return (
    <li>
      <Link href={liga.href} className={E.pie.enlace} data-testid="sn-pie-enlace" data-href={liga.href}>
        {liga.texto}
      </Link>
    </li>
  )
}
