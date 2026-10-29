import Link from 'next/link'
import { FOCO, FOCO_SOBRE_OSCURO, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): migas de pan («Inicio · Experiencias»). La maqueta las repite en experiencias (`.breadcrumb`), eventos
// (`.breadcrumb-inv`) y producto (`.prod-breadcrumb`): DM Mono 11 px, mayúsculas, separadas por «·». El separador es decoración
// (aria-hidden); el último es la página actual (aria-current="page", sin liga). Los textos y el aria-label los pasa quien las usa.

type Props = {
  /** `aria-label` del `<nav>`. */
  etiqueta: string
  items: { texto: string; href?: string }[]
  sobreOscuro?: boolean
  /** En fondo cream las ligas van en ink (terra da 4.13, §2.2). */
  sobreCrema?: boolean
  testId?: string
  className?: string
}

export default function Migas({ etiqueta, items, sobreOscuro = false, sobreCrema = false, testId = 'sn-migas', className }: Props) {
  const tono = sobreOscuro ? 'text-sn-warm' : 'text-sn-ink'
  return (
    <nav aria-label={etiqueta} data-testid={testId} className={className}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0 font-sn-mono text-sn-etiqueta font-medium uppercase">
        {items.map((item, i) => {
          const ultimo = i === items.length - 1
          return (
            <li key={`${i}-${item.texto}`} className={unirClases('flex items-center gap-2', tono)}>
              {ultimo || !item.href ? (
                <span aria-current={ultimo ? 'page' : undefined}>{item.texto}</span>
              ) : (
                <Link
                  href={item.href}
                  className={unirClases(
                    'no-underline',
                    sobreOscuro ? 'text-sn-warm hover:text-white' : sobreCrema ? 'text-sn-ink hover:text-sn-forest' : 'text-sn-terra hover:text-sn-ink',
                    sobreOscuro ? FOCO_SOBRE_OSCURO : FOCO,
                  )}
                >
                  {item.texto}
                </Link>
              )}
              {!ultimo && <span aria-hidden="true">·</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
