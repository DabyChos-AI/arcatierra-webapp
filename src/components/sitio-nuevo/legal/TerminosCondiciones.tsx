import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { CONTACTO, CORREO_GENERAL } from '@/lib/contacto'
import { Apartado, SUBTITULO_LEGAL } from './piezas'

// R15 v2 · F5 (legales): los términos y condiciones de /terminos (hoy «Página en construcción...»). D-F5-06; D-F5-11 P-12.
// Una marca a David por apartado de la maqueta (L7–L15 de cadena-v2/f5/contacto-F5.md §4). SALE lo de la maqueta que la regla prohíbe:
// pausar, ajustar, «antes del jueves», «WhatsApp 30 min», perecederos «24 h con foto», «48 h = 100 %» (C38; la marca L12 es letra por letra la
// de D-F3-20 P-3). Con fuente: el contacto, de `src/lib/contacto.ts` (MAILC1, TEL3), bajo «Contacto» (`armazon/enlaces.ts:36`).
// El `h2` repetiría el `h1` de la página: va solo para lectores de pantalla.
const LIGA = unirClases('font-sn-texto text-sn-cuerpo-sm font-light text-sn-ink underline hover:text-sn-terra', FOCO)

export default function TerminosCondiciones() {
  return (
    <section id="terminos" data-testid="sn-legal-terminos" aria-labelledby="sn-legal-terminos-titulo" className="flex scroll-mt-20 flex-col gap-6">
      <h2 id="sn-legal-terminos-titulo" data-testid="sn-legal-terminos-titulo" className="sr-only font-sn-titulos font-normal">
        Términos y Condiciones
      </h2>
      <Apartado que="operador del sitio: razón social, RFC y dominio" />
      <Apartado que="condiciones de venta de productos y precios" />
      <Apartado que="condiciones de las suscripciones" />
      <Apartado que="condiciones de entrega" />
      <Apartado que="cambios y devoluciones de productos perecederos" />
      <Apartado que="política de cancelación y reembolso de experiencias" />
      <Apartado que="limitación de responsabilidad" />
      <Apartado que="propiedad intelectual del contenido del sitio" />
      <Apartado que="legislación aplicable y tribunales competentes" />
      <div data-testid="sn-legal-terminos-contacto" className="flex flex-col gap-2">
        <h3 className={SUBTITULO_LEGAL}>Contacto</h3>
        <p className="m-0 flex flex-col gap-1">
          <a href={`mailto:${CORREO_GENERAL}`} data-testid="sn-legal-terminos-contacto-correo" className={unirClases(LIGA, 'break-all')}>
            {CORREO_GENERAL}
          </a>
          <a href={CONTACTO.telefonoHref} data-testid="sn-legal-terminos-contacto-telefono" className={LIGA}>
            {CONTACTO.telefonoVisible}
          </a>
        </p>
      </div>
    </section>
  )
}
