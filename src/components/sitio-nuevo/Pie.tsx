// R15 · F1 (WF1, sesión 54): el pie de la maqueta (`footer.f-v7`): marca + boletín, tres columnas (Arca Tierra · Come Arca ·
// Vive Arca) y la franja de abajo (©, legales, redes). Componente de servidor; el boletín es el de hoy.
//
// - Boletín: el MISMO formulario y envío de hoy (src/components/layout/NewsletterForm.tsx → POST /api/newsletter, origen
//   'pie', con su casilla de consentimiento y su campo trampa). No se toca ese archivo: aquí solo se le cambia el aspecto desde
//   fuera (variantes `[&_…]` con más especificidad que sus clases). Por eso dice «Suscribirse» y no «Suscribir →».
// - Contacto y redes: la fuente única (src/lib/contacto.ts y src/lib/bodega.ts), nunca los de relleno de la maqueta
//   (hola@, +52 55 0000 0000, wa.me/521234567890). «Newsletter» de la maqueta → «Boletín» (texto en inglés).
// - Legales: Privacidad y Términos de hoy. «Cookies» no va: no hay página ni banner (Umami no usa cookies, DR70/DR76).
import Link from 'next/link'
import { Facebook, Instagram, Youtube } from 'lucide-react'
import NewsletterForm from '@/components/layout/NewsletterForm'
import { CONTACTO, CORREO_GENERAL, ICONO_TIKTOK_PATH, REDES_SOCIALES } from '@/lib/contacto'
import { BODEGA } from '@/lib/bodega'
import { Isotipo } from './Logo'
import { ENLACES_LEGALES, ENLACES_PIE_COME, ENLACES_PIE_VIVE, type Enlace } from './enlaces'

const ANIO_MEXICO = () =>
  new Intl.DateTimeFormat('es-MX', { year: 'numeric', timeZone: 'America/Mexico_City' }).format(new Date())

// El formulario de hoy con el aspecto de la maqueta: renglón con línea abajo, correo en mono y «Suscribirse» en durazno.
const BOLETIN = [
  '[&_form>div:first-child]:flex-row [&_form>div:first-child]:items-center [&_form>div:first-child]:gap-0',
  '[&_form>div:first-child]:border-b [&_form>div:first-child]:border-[rgba(227,219,203,0.35)]',
  '[&_input[type=email]]:rounded-none [&_input[type=email]]:border-0 [&_input[type=email]]:bg-transparent',
  '[&_input[type=email]]:px-0 [&_input[type=email]]:py-[10px] [&_input[type=email]]:font-sn-mono [&_input[type=email]]:text-sm',
  '[&_input[type=email]]:text-sn-crema [&_input[type=email]::placeholder]:text-[rgba(227,219,203,0.55)]',
  '[&_button[type=submit]]:rounded-none [&_button[type=submit]]:bg-transparent [&_button[type=submit]]:py-[10px]',
  '[&_button[type=submit]]:pl-4 [&_button[type=submit]]:pr-0 [&_button[type=submit]]:font-sn-mono [&_button[type=submit]]:text-[11px]',
  '[&_button[type=submit]]:font-medium [&_button[type=submit]]:uppercase [&_button[type=submit]]:tracking-[1.3px]',
  '[&_button[type=submit]]:text-sn-durazno [&_button[type=submit]:hover]:text-sn-crema',
  '[&_label]:text-sn-crema/90 [&_label_a]:text-sn-durazno [&_label_a:hover]:text-sn-crema',
  '[&_input[type=checkbox]]:accent-[#F2D4A8]',
].join(' ')

const ETIQUETA = 'mb-[22px] font-sn-mono text-[10px] font-medium uppercase leading-[1.55] tracking-[1.5px] text-sn-durazno'
const ENLACE_COLUMNA =
  'block font-sn-mono text-xs leading-[1.55] text-sn-crema/90 transition-colors hover:text-sn-crema'

function IconoTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className="h-[14px] w-[14px]">
      <path d={ICONO_TIKTOK_PATH} />
    </svg>
  )
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className="h-[14px] w-[14px]">
      <path d="M20 4a10 10 0 0 0-17 10l-1 6 6-1a10 10 0 0 0 12-15zm-8 16c-1.6 0-3.1-.4-4.5-1.2l-3.5.6.6-3.5A8 8 0 1 1 12 20z" />
    </svg>
  )
}

const ICONOS: Record<(typeof REDES_SOCIALES)[number]['red'], React.ReactNode> = {
  instagram: <Instagram aria-hidden="true" className="h-[14px] w-[14px]" strokeWidth={2} />,
  facebook: <Facebook aria-hidden="true" className="h-[14px] w-[14px]" strokeWidth={2} />,
  tiktok: <IconoTikTok />,
  youtube: <Youtube aria-hidden="true" className="h-[14px] w-[14px]" strokeWidth={2} />,
}

function Columna({ titulo, enlaces }: { titulo: string; enlaces: readonly Enlace[] }) {
  return (
    <div>
      <p className={ETIQUETA}>{titulo}</p>
      <ul className="flex flex-col gap-3">
        {enlaces.map((e) => (
          <li key={e.href + e.texto}>
            <Link href={e.href} data-testid="sn-pie-enlace" data-href={e.href} className={ENLACE_COLUMNA}>
              {e.texto}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Pie() {
  const redes = [
    ...REDES_SOCIALES.map((r) => ({ red: r.red as string, nombre: r.nombre, url: r.url, icono: ICONOS[r.red] })),
    { red: 'whatsapp', nombre: 'WhatsApp', url: CONTACTO.whatsappUrl, icono: <IconoWhatsApp /> },
  ]

  return (
    <footer data-testid="sn-pie" className="bg-sn-verde font-sn-texto text-sn-crema">
      {/* Arriba: marca + boletín */}
      <div className="grid grid-cols-1 gap-7 border-b border-sn-crema/15 px-6 py-10 min-[861px]:grid-cols-2 min-[861px]:gap-10 min-[861px]:px-8 min-[861px]:py-14">
        <div className="flex items-center gap-[18px]">
          <Isotipo ancho={56} />
          <span className="font-sn-titulos text-[32px] leading-none tracking-[-0.4px] min-[861px]:text-[43px]">arca tierra</span>
        </div>
        <div data-testid="sn-pie-boletin" className="flex flex-col gap-[10px]">
          <p className="mb-1 font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.6px] text-sn-durazno">Boletín</p>
          <p className="mb-[14px] font-sn-titulos text-xl leading-[1.25] tracking-[-0.2px] min-[861px]:text-[26px]">
            Cosecha del día, recetas y experiencias en la chinampa.
          </p>
          <div className={BOLETIN}>
            <NewsletterForm origen="pie" />
          </div>
        </div>
      </div>

      {/* Columnas */}
      <div className="grid grid-cols-1 gap-7 border-b border-sn-crema/15 px-6 py-10 min-[861px]:mx-10 min-[861px]:grid-cols-3 min-[861px]:gap-12 min-[861px]:px-10 min-[861px]:py-12 min-[1100px]:mx-20">
        <div data-testid="sn-pie-contacto">
          <p className={ETIQUETA}>Arca Tierra</p>
          <address className="flex flex-col gap-1 font-sn-mono text-xs not-italic leading-6 text-sn-crema/90">
            <span>Xochimilco, Ciudad de México</span>
            <a
              href={`mailto:${CORREO_GENERAL}`}
              data-testid="sn-pie-correo"
              className="break-all text-sn-crema/90 hover:text-sn-crema"
            >
              {CORREO_GENERAL}
            </a>
            <a href={CONTACTO.telefonoHref} data-testid="sn-pie-telefono" className="text-sn-crema/90 hover:text-sn-crema">
              {CONTACTO.telefonoVisible}
            </a>
            <span data-testid="sn-pie-bodega" className="mt-3 block">
              Recoge en bodega: {BODEGA.corta}, {BODEGA.alcaldia}.{' '}
              <a
                href={BODEGA.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap text-sn-durazno underline-offset-2 hover:text-sn-crema hover:underline"
              >
                Cómo llegar ↗
              </a>
              <span className="block">{BODEGA.horario}</span>
            </span>
          </address>
        </div>
        <Columna titulo="Come Arca" enlaces={ENLACES_PIE_COME} />
        <Columna titulo="Vive Arca" enlaces={ENLACES_PIE_VIVE} />
      </div>

      {/* Abajo: ©, legales y redes */}
      <div className="flex flex-col gap-[14px] px-6 py-[22px] min-[861px]:flex-row min-[861px]:items-center min-[861px]:justify-between min-[861px]:gap-4 min-[861px]:px-8">
        <p className="font-sn-mono text-[10px] uppercase leading-[1.55] tracking-[1.2px] text-sn-crema/90">
          © {ANIO_MEXICO()} Arca Tierra · Xochimilco, México
        </p>
        <div className="flex flex-wrap items-center gap-[14px]">
          <nav aria-label="Legales" className="flex items-center gap-[14px]">
            {ENLACES_LEGALES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                data-testid="sn-pie-legal"
                data-href={e.href}
                className="font-sn-mono text-[10px] uppercase leading-[1.55] tracking-[1.2px] text-sn-crema/90 hover:text-sn-crema"
              >
                {e.texto}
              </Link>
            ))}
          </nav>
          <ul className="flex items-center gap-[10px]">
            {redes.map((r) => (
              <li key={r.red}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="sn-pie-red"
                  data-red={r.red}
                  aria-label={`${r.nombre} de Arca Tierra (se abre en otra pestaña)`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-sn-crema/30 text-sn-crema transition-colors hover:border-sn-durazno hover:text-sn-durazno"
                >
                  {r.icono}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
