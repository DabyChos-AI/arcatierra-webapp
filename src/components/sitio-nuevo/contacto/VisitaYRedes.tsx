import Link from 'next/link'
import { ArrowRight, Facebook, Instagram, Youtube } from 'lucide-react'
import { FOCO, FOCO_BOTON, unirClases } from '@/components/sitio-nuevo/ui/clases'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { ICONO_TIKTOK_PATH, REDES_SOCIALES } from '@/lib/contacto'

// R15 v2 · F5 (contacto): lo que hoy trae /contacto y la maqueta no (DR-10; MAPA-CONTENIDO B §6.4; D-F5-11 P-8), con sus textos de hoy:
// «Visítanos» · «Chinampas de Xochimilco, CDMX» · «Visitas con cita previa» · «Agenda una experiencia →» a /experiencias
// (`src/app/contacto/page.tsx:323-328`) y «Síguenos en redes sociales» con las 4 redes de `lib/contacto.ts` (`REDES_SOCIALES`) y su nombre
// accesible de hoy, «<red> de Arca Tierra» (`:337-354`). Dos tarjetas: lado a lado desde 861, una sobre otra hasta 860.

const TARJETA = 'flex flex-col gap-3.5 rounded-sn-tarjeta border border-solid border-sn-border bg-white p-8'
const TEXTO = 'm-0 font-sn-texto text-sn-cuerpo-sm font-light text-sn-ink'

function IconoRed({ red }: { red: string }) {
  if (red === 'instagram') return <Instagram aria-hidden="true" focusable="false" className="h-6 w-6" />
  if (red === 'facebook') return <Facebook aria-hidden="true" focusable="false" className="h-6 w-6" />
  if (red === 'youtube') return <Youtube aria-hidden="true" focusable="false" className="h-6 w-6" />
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className="h-6 w-6">
      <path d={ICONO_TIKTOK_PATH} />
    </svg>
  )
}

export default function VisitaYRedes() {
  return (
    <Seccion fondo="warm" espacio="ninguno" className="pb-sn-seccion-movil min-[861px]:pb-sn-seccion">
      <Contenedor ancho="medio">
        <div className="grid grid-cols-1 gap-[18px] min-[861px]:grid-cols-2 min-[861px]:gap-10">
          <section data-testid="sn-contacto-visita" aria-labelledby="sn-contacto-visita-titulo" className={TARJETA}>
            <Titulo nivel={2} tamano="h4" id="sn-contacto-visita-titulo" testId="sn-contacto-visita-titulo">
              Visítanos
            </Titulo>
            <p data-testid="sn-contacto-visita-lugar" className={TEXTO}>
              Chinampas de Xochimilco, CDMX
            </p>
            <p data-testid="sn-contacto-visita-nota" className={TEXTO}>
              Visitas con cita previa
            </p>
            <p className="m-0">
              <Link
                href="/experiencias"
                data-testid="sn-contacto-visita-liga"
                className={unirClases('inline-flex items-center gap-1.5 font-sn-mono text-sn-etiqueta font-medium text-sn-terra no-underline hover:text-sn-ink', FOCO)}
              >
                <span>Agenda una experiencia</span>
                <ArrowRight aria-hidden="true" focusable="false" className="h-[1.15em] w-[1.15em] shrink-0" strokeWidth={1.75} />
              </Link>
            </p>
          </section>

          <section data-testid="sn-contacto-redes" aria-labelledby="sn-contacto-redes-titulo" className={TARJETA}>
            <Titulo nivel={2} tamano="h4" id="sn-contacto-redes-titulo" testId="sn-contacto-redes-titulo">
              Síguenos en redes sociales
            </Titulo>
            <ul className="m-0 flex list-none flex-wrap gap-4 p-0">
              {REDES_SOCIALES.map(({ red, nombre, url }) => (
                <li key={red}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${nombre} de Arca Tierra`}
                    data-testid="sn-contacto-redes-red"
                    data-red={red}
                    className={unirClases(
                      'flex h-12 w-12 items-center justify-center rounded-sn-pildora bg-sn-terra text-white no-underline hover:bg-sn-ink hover:text-white',
                      FOCO_BOTON,
                    )}
                  >
                    <IconoRed red={red} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Contenedor>
    </Seccion>
  )
}
