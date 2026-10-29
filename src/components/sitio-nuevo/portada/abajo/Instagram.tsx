// R15 v2 · F2: bloque 11 de la portada, la franja de Instagram (maqueta `.instagram-strip`). Contrato v2 §9-F2 D-F2-05, D-F2-08 a/k,
// D-F2-13; cadena-v2/f2/abajo-F2.md §2.11. Componente de servidor, sin datos de la API y sin integraciones (DR65).
// - La cuenta y la liga se importan de src/lib/contacto.ts (TEL3): @arca.tierra, no la de la maqueta. El «@cuenta» se arma de la misma URL.
// - «Síguenos» y «Instagram de ArcaTierra» son los textos de hoy del pie (Footer.tsx:126, :139); el nombre accesible contiene lo visible.
// - Las 8 fotos se suben al panel y todavía no existen (DR65): una marca para la tanda, a nombre de Lucio y Pablo (D-F2-13 P-1).
// - Sin marquesina: no hay fotos que mover ni se agregan animaciones al CSS (contrato base §3.6; como la cinta, C21).
// Medido en la maqueta: fondo blue con borde arriba y abajo, 14 px arriba y abajo, píldoras en mono. El blanco de sus píldoras no pasa AA
// sobre blue: van como Boton «suave» (warm con ink).
import { Instagram as IconoInstagram } from 'lucide-react'
import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import { CONTACTO, REDES_SOCIALES } from '@/lib/contacto'

const ID_TITULO = 'sn-portada-instagram-titulo'
const URL_INSTAGRAM = CONTACTO.redes.instagram
/** «Instagram», el nombre de la red en contacto.ts. */
const NOMBRE_RED = REDES_SOCIALES.find((r) => r.red === 'instagram')?.nombre ?? ''
/** `https://www.instagram.com/arca.tierra` → `@arca.tierra`. */
const CUENTA = `@${new URL(URL_INSTAGRAM).pathname.replace(/\//g, '')}`

export default function Instagram() {
  return (
    <Seccion
      testId="sn-portada-instagram"
      fondo="ninguno"
      borde="ambos"
      espacio="ninguno"
      etiquetadaPor={ID_TITULO}
      className="bg-sn-blue py-3.5 text-sn-ink"
    >
      {/* Oculto, pero con la letra de títulos: todo h1–h6 del sitio nuevo sale en DM Serif o DM Mono (T657). */}
      <h2 id={ID_TITULO} data-testid={ID_TITULO} className="sr-only font-sn-titulos font-normal">
        {NOMBRE_RED}
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3 px-sn-lateral-movil min-[861px]:px-sn-lateral">
        <Boton variante="suave" tamano="chico" externo href={URL_INSTAGRAM} testId="sn-portada-instagram-siguenos">
          <span className="inline-flex items-center gap-2">
            <IconoInstagram size={14} aria-hidden="true" focusable="false" />
            Síguenos
            <span className="sr-only">{`${NOMBRE_RED} de ArcaTierra`}</span>
          </span>
        </Boton>
        <div data-testid="sn-portada-instagram-fotos">
          <Falta que="las 8 fotos de Instagram" quien="Lucio y Pablo" />
        </div>
        <Boton variante="suave" tamano="chico" externo href={URL_INSTAGRAM} testId="sn-portada-instagram-cuenta">
          {CUENTA}
        </Boton>
      </div>
    </Seccion>
  )
}
