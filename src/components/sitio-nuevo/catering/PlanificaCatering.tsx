// R15 v2 · F4 (catering): bloque 4 de /catering, «Planifica tu evento»: lo que hoy tiene /catering y la maqueta no trae (DR-10: no se pierde).
// Contrato v2 §9-F4 D-F4-09 (P-1, P-4, P-5, P-6, P-11, P-12), D-F4-10; cadena-v2/f4/catering-F4.md §2.4. Componente de servidor; la
// propuesta corporativa es su hijo cliente.
// - Encabezado de hoy: «Planifica tu evento», «Planifica tu evento con Arca Tierra Catering» y su frase (`components/catering/Contact.tsx:73`,
//   `:81-82`, `:90`).
// - Propuesta corporativa: «¿Tu empresa será la siguiente?» y «Solicitar propuesta corporativa» (`components/catering/Clients.tsx:203`, `:231`);
//   sin la frase de `:206`, que se apoya en la lista de clientes que no pasa (D-F4-09 P-11).
// - Catálogo: «Servicios de Catering», su frase y «Descargar catálogo» (`components/catering/ServicesInfoModal.tsx:81`, `:83`, `:164`); el
//   archivo de hoy de `public/` (`:42`), en otra pestaña (D-F4-09 P-6: el nombre de la descarga de hoy queda como información).
// - Contacto: «Contacto» (`components/catering/Footer.tsx:52`), el WhatsApp con el mensaje de hoy y el correo de catering, de `contactoCatering.ts`
//   (D-F4-09 P-1); el botón dice el nombre del canal y no pinta el número. Los datos de personas de `Contact.tsx` no se usan.
// Diseño con las piezas de `ui/` (la maqueta no tiene este bloque): tres tarjetas blancas, de una en una hasta 860.
import Boton from '@/components/sitio-nuevo/ui/Boton'
import { FOCO } from '@/components/sitio-nuevo/ui/clases'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { CORREO_CATERING, linkWhatsAppCatering, mailtoCatering } from './contactoCatering'
import PropuestaCorporativa from './PropuestaCorporativa'

const ID_TITULO = 'sn-catering-planifica-titulo'
const TARJETA = 'flex flex-col items-start gap-4'
const CATALOGO_PDF = '/presentacion_catering_2025.pdf'

export default function PlanificaCatering() {
  return (
    <Seccion testId="sn-catering-planifica" borde="arriba" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <Etiqueta tamano="eyebrow" tono="terra" testId="sn-catering-planifica-etiqueta" className="mb-3.5">
          Planifica tu evento
        </Etiqueta>
        <Titulo nivel={2} id={ID_TITULO} testId={ID_TITULO} className="mb-[18px] max-w-[600px]">
          Planifica tu evento con Arca Tierra Catering
        </Titulo>
        <Texto peso="ligero" ancho="parrafo" testId="sn-catering-planifica-texto" className="mb-12">
          Contáctanos y diseñemos juntos la experiencia gastronómica perfecta para tu evento
        </Texto>
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 min-[861px]:grid-cols-3">
          <Tarjeta as="li" relleno="normal" testId="sn-catering-planifica-corporativa" className={TARJETA}>
            <Titulo nivel={3} tamano="h5" testId="sn-catering-planifica-corporativa-titulo">
              ¿Tu empresa será la siguiente?
            </Titulo>
            <PropuestaCorporativa />
          </Tarjeta>
          <Tarjeta as="li" relleno="normal" testId="sn-catering-planifica-catalogo" className={TARJETA}>
            <Titulo nivel={3} tamano="h5">
              Servicios de Catering
            </Titulo>
            <Texto tamano="chico" peso="ligero">
              Descubre todos los servicios que Arca Tierra Catering ofrece para tu evento
            </Texto>
            <Boton href={CATALOGO_PDF} externo variante="contorno" testId="sn-catering-planifica-catalogo-descargar">
              Descargar catálogo
            </Boton>
          </Tarjeta>
          <Tarjeta as="li" relleno="normal" testId="sn-catering-planifica-contacto" className={TARJETA}>
            <Titulo nivel={3} tamano="h5">
              Contacto
            </Titulo>
            <Boton href={linkWhatsAppCatering()} externo variante="contorno" testId="sn-catering-planifica-contacto-whatsapp">
              WhatsApp
            </Boton>
            <a
              href={mailtoCatering()}
              data-testid="sn-catering-planifica-contacto-correo"
              className={`font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink underline hover:text-sn-terra ${FOCO}`}
            >
              {CORREO_CATERING}
            </a>
          </Tarjeta>
        </ul>
      </Contenedor>
    </Seccion>
  )
}
