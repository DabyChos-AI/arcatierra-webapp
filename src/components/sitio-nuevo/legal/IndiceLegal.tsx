import Link from 'next/link'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'

// R15 v2 · F5 (legales): el índice de la página legal de la maqueta (`#privacidad`, `#terminos`, `#cookies`) sobre las dos direcciones de hoy
// (D-F5-11 P-9 A, P-10). Textos de hoy: «Política de Privacidad» y «Términos y Condiciones» (`armazon/enlaces.ts:63-64` = `Footer.tsx:188, :194`);
// «Cookies» es el nombre de la sección (P-10). Nombre accesible del `nav` = el de los legales del pie de hoy, «Enlaces legales» (`Footer.tsx:183`).
// Desde 861 en columna a la izquierda; hasta 860 arriba, en una fila que se parte (la maqueta lo deja al lado y se sale a 390).

export type DocumentoLegal = 'privacidad' | 'terminos'

const LIGAS: ReadonlyArray<{ seccion: 'privacidad' | 'terminos' | 'cookies'; texto: string; href: string }> = [
  { seccion: 'privacidad', texto: 'Política de Privacidad', href: '/privacidad' },
  { seccion: 'terminos', texto: 'Términos y Condiciones', href: '/terminos' },
  { seccion: 'cookies', texto: 'Cookies', href: '/privacidad#cookies' },
]

export default function IndiceLegal({ documento }: { documento: DocumentoLegal }) {
  return (
    <nav aria-label="Enlaces legales" data-testid="sn-legal-indice">
      <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0 min-[861px]:flex-col min-[861px]:flex-nowrap min-[861px]:gap-y-2">
        {LIGAS.map((l) => {
          const actual = l.seccion === documento
          return (
            <li key={l.seccion}>
              <Link
                href={l.href}
                data-testid="sn-legal-indice-liga"
                data-seccion={l.seccion}
                aria-current={actual ? 'page' : undefined}
                className={unirClases(
                  'font-sn-mono text-sn-etiqueta font-medium uppercase',
                  // OBS-C1 (revision): `no-underline` solo en la rama no actual; con las dos, Tailwind emite .no-underline después de
                  // .underline y la liga de la página actual nunca se subraya.
                  // Colores de la maqueta: la actual en terra (4.78 sobre warm) y subrayada (no solo el color la distingue), las otras en ink.
                  actual ? 'text-sn-terra underline hover:text-sn-ink' : 'text-sn-ink no-underline hover:text-sn-terra',
                  FOCO,
                )}
              >
                {l.texto}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
