import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Falta from '@/components/sitio-nuevo/Falta'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import { CONTACTO, CORREO_EXPERIENCIAS, CORREO_GENERAL } from '@/lib/contacto'

// R15 v2 · F5 (contacto): las 4 tarjetas de canales de la maqueta (`.contact-grid`) con lo de hoy. D-F5-11 P-2, P-3, P-4, P-5;
// cadena-v2/f5/contacto-F5.md §2.1. Teléfono, WhatsApp y correos SOLO de `src/lib/contacto.ts` (TEL3, MAILC1): ninguno escrito aquí.
// - Título del bloque: «Otras formas de contactarnos» (`src/app/contacto/page.tsx:274`) solo para lectores de pantalla (la maqueta no lo pinta).
// - Teléfono (`:285-290`): el número (`tel:`), el horario del teléfono (lista corta, D-F5-09 (4): REGLAS §5 L107-108) y la liga «WhatsApp»
//   al mismo número (`CONTACTO.whatsappUrl`, P-4).
// - Correo (`:304-308`): los dos correos públicos y «Respondemos en menos de» con la marca en lugar del plazo (P-5, C56; D-F4-14).
// - Eventos privados y Catering: el nombre del destino (`armazon/enlaces.ts:32-33`), el texto de hoy de cada uno
//   (`src/app/experiencias/page.tsx:304`, `components/catering/About.tsx:24-25`) y la etiqueta y destino de su botón en el sitio nuevo
//   (`experiencias/VentaCruzada.tsx:41-42`, `catering/HeroeCatering.tsx:38-39`).
// Diseño de la maqueta (medido): tarjeta blanca con borde, relleno 32 y 14 entre piezas; nombre mono en terra, frase serif de 28, liga mono de 13 con
// flecha; rejilla de 1200 con 64/40 de relleno (40 a 390), 2 columnas desde 861 con 40 de hueco y 1 hasta 860 con 18.

const ID_TITULO = 'sn-contacto-canales-titulo'
const TARJETA = 'flex flex-col gap-3.5 rounded-sn-tarjeta border border-solid border-sn-border bg-white p-8'
const NOMBRE = 'm-0 font-sn-mono text-sn-eyebrow font-medium uppercase text-sn-terra'
const LINEA = 'm-0 break-words font-sn-titulos text-sn-h4 font-normal text-sn-ink'
const DETALLE = 'm-0 font-sn-texto text-sn-cuerpo-sm font-light text-sn-ink'
const LIGA = unirClases('inline-flex items-center gap-1.5 font-sn-mono text-sn-cuerpo-xs font-medium text-sn-terra no-underline hover:text-sn-ink', FOCO)
// La liga lleva su letra: `globals.css` le pone a todo `a` la letra de texto (`--font-body`) y no hereda la serif del párrafo.
const LIGA_GRANDE = unirClases('font-sn-titulos font-normal text-sn-ink no-underline hover:text-sn-terra', FOCO)

function Flecha() {
  return <ArrowRight aria-hidden="true" focusable="false" className="h-[1.15em] w-[1.15em] shrink-0" strokeWidth={1.75} />
}

export default function CanalesContacto() {
  return (
    <Seccion fondo="warm" espacio="ninguno" testId="sn-contacto-canales" etiquetadaPor={ID_TITULO} className="py-10 min-[861px]:py-16">
      <Contenedor ancho="medio">
        <h2 id={ID_TITULO} data-testid={ID_TITULO} className="sr-only font-sn-titulos font-normal">
          Otras formas de contactarnos
        </h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-[18px] p-0 min-[861px]:grid-cols-2 min-[861px]:gap-10">
          <li data-testid="sn-contacto-canales-canal" data-canal="telefono" className={TARJETA}>
            <h3 data-testid="sn-contacto-canales-canal-nombre" className={NOMBRE}>
              Teléfono
            </h3>
            <p data-testid="sn-contacto-canales-canal-linea" className={LINEA}>
              <a href={CONTACTO.telefonoHref} data-testid="sn-contacto-canales-telefono" className={LIGA_GRANDE}>
                {CONTACTO.telefonoVisible}
              </a>
            </p>
            <p data-testid="sn-contacto-canales-horario" className={DETALLE}>
              <span className="block">Lunes a viernes: 9:00 - 18:00</span>
              <span className="block">Sábados: 9:00 - 14:00</span>
            </p>
            <p className="m-0">
              <a
                href={CONTACTO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="sn-contacto-canales-whatsapp"
                className={LIGA}
              >
                <span>WhatsApp</span>
                <Flecha />
              </a>
            </p>
          </li>

          <li data-testid="sn-contacto-canales-canal" data-canal="correo" className={TARJETA}>
            <h3 data-testid="sn-contacto-canales-canal-nombre" className={NOMBRE}>
              Correo electrónico
            </h3>
            <p data-testid="sn-contacto-canales-canal-linea" className={LINEA}>
              <a href={`mailto:${CORREO_GENERAL}`} data-testid="sn-contacto-canales-correo-general" className={LIGA_GRANDE}>
                {CORREO_GENERAL}
              </a>
            </p>
            <p className={DETALLE}>Experiencias y visitas a las chinampas:</p>
            <p className="m-0">
              <a href={`mailto:${CORREO_EXPERIENCIAS}`} data-testid="sn-contacto-canales-correo-experiencias" className={unirClases(LIGA, 'break-all')}>
                <span>{CORREO_EXPERIENCIAS}</span>
                <Flecha />
              </a>
            </p>
            <p className={DETALLE}>
              Respondemos en menos de <Falta que="tiempo de respuesta a un mensaje de contacto" quien="David" />
            </p>
          </li>

          <li data-testid="sn-contacto-canales-canal" data-canal="eventos" className={TARJETA}>
            <h3 data-testid="sn-contacto-canales-canal-nombre" className={NOMBRE}>
              Eventos privados
            </h3>
            <p data-testid="sn-contacto-canales-canal-linea" className={LINEA}>
              Momentos exclusivos diseñados especialmente para ti y tus seres queridos
            </p>
            <p className="m-0">
              <Link href="/eventos#solicitud" data-testid="sn-contacto-canales-eventos" className={LIGA}>
                <span>Experiencias Privadas</span>
                <Flecha />
              </Link>
            </p>
          </li>

          <li data-testid="sn-contacto-canales-canal" data-canal="catering" className={TARJETA}>
            <h3 data-testid="sn-contacto-canales-canal-nombre" className={NOMBRE}>
              Catering
            </h3>
            <p data-testid="sn-contacto-canales-canal-linea" className={LINEA}>
              Catering consciente para eventos únicos
            </p>
            <p className="m-0">
              <Link href="/catering#cotizar" data-testid="sn-contacto-canales-catering" className={LIGA}>
                <span>Cotizar mi evento</span>
                <Flecha />
              </Link>
            </p>
          </li>
        </ul>
      </Contenedor>
    </Seccion>
  )
}
