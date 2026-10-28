// R15 · F2 (WF2, sesión 55) · sección 11: la franja de Instagram (maqueta `.instagram-strip`). Solo las fotos PUBLICADAS en
// contenido_sitio › instagram (hasta 8, en su orden; cada una a su liga o a la cuenta). Vacío → la marca (Lucio y Pablo). La
// cuenta es la de src/lib/contacto.ts (la de hoy), no el «@arcatierra» de la maqueta. Sin marquesina: a 390 se desliza con el
// dedo y nada se sale del ancho. Componente de servidor.
import OptimizedImage from '@/components/ui/OptimizedImage'
import { REDES_SOCIALES } from '@/lib/contacto'
import type { DatosInstagram, ElementoPublico } from '@/types/contenido-sitio'
import Falta from '../Falta'
import { SECCION } from './estilos'

const CUENTA = REDES_SOCIALES.find((r) => r.red === 'instagram')?.url ?? null
/** «https://www.instagram.com/arca.tierra» → «@arca.tierra». */
const USUARIO = CUENTA ? `@${CUENTA.replace(/\/+$/, '').split('/').pop()}` : null

export default function Instagram({ fotos }: { fotos: ElementoPublico<DatosInstagram>[] }) {
  const publicadas = fotos.filter((f) => typeof f.datos?.imagen_url === 'string' && f.datos.imagen_url.trim()).slice(0, 8)
  return (
    <section
      data-testid="sn-portada-instagram"
      data-vacia={publicadas.length === 0 ? '1' : '0'}
      aria-label="Instagram de Arca Tierra"
      className="bg-sn-azul py-sn-5"
    >
      <div className={`${SECCION} mb-4 flex flex-wrap items-center justify-between gap-3`}>
        <h2 className="font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.8px] text-sn-tinta">Síguenos</h2>
        {CUENTA && USUARIO && (
          <a
            href={CUENTA}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="sn-portada-instagram-cuenta"
            className="rounded-sn-pildora bg-sn-calido px-4 py-[7px] font-sn-mono text-[11px] font-medium leading-none tracking-[1px] text-sn-tinta hover:bg-white hover:text-sn-tinta"
          >
            {USUARIO}
          </a>
        )}
      </div>
      {publicadas.length === 0 ? (
        <div className={SECCION}>
          <Falta como="bloque" que="fotos de Instagram (Contenido del sitio › Fotos de Instagram)" quien="Lucio y Pablo" />
        </div>
      ) : (
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2 min-[861px]:px-10">
          {publicadas.map((f) => {
            const href = f.datos.url || CUENTA
            const foto = (
              <span className="relative block aspect-square w-[150px] overflow-hidden rounded-[6px] min-[861px]:w-[170px]">
                <OptimizedImage
                  src={f.datos.imagen_url}
                  alt={f.datos.texto_alternativo}
                  fill
                  sizes="170px"
                  className="object-cover"
                />
              </span>
            )
            return (
              <li key={f.id} data-testid="sn-portada-instagram-foto" className="shrink-0 snap-start">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90">
                    {foto}
                  </a>
                ) : (
                  foto
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
