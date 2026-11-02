import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { unirClases } from '@/components/sitio-nuevo/ui/clases'

// R15 v2 · F6 (cuenta, sesión 64): una pestaña de Mi cuenta = `<section aria-labelledby>` con su h2 (D-F6-08 P-1), dentro de la columna de
// la derecha del marco (`.cuenta-main`: columna con 22 px entre tarjetas). Dos formas:
// - `comoTarjeta`: la pestaña ES una tarjeta blanca (`.cuenta-card`: borde, radio 14, relleno 28) y su h2 se ve (Direcciones).
// - sin `comoTarjeta`: la pestaña junta varias tarjetas (Resumen, Datos); su h2 es el nombre de la pestaña en el menú y no se ve (la
//   maqueta titula cada tarjeta con un h3 y no tiene h2; precedente D-F5-11 / historia-F5 P-7), y cada tarjeta lleva su h3 visible.
// Sin texto propio: el título lo pasa quien la usa (un texto de hoy).

type Props = {
  /** id del h2 (único en la página). */
  idTitulo: string
  titulo: React.ReactNode
  comoTarjeta?: boolean
  testId: string
  className?: string
  children: React.ReactNode
}

export default function PestanaCuenta({ idTitulo, titulo, comoTarjeta = false, testId, className, children }: Props) {
  return (
    <section
      aria-labelledby={idTitulo}
      data-testid={testId}
      className={unirClases(
        'flex min-w-0 flex-col',
        comoTarjeta ? 'gap-[18px] rounded-sn-tarjeta border border-solid border-sn-border bg-white p-7 text-sn-ink' : 'gap-[22px]',
        className,
      )}
    >
      <Titulo nivel={2} tamano="h4" id={idTitulo} className={comoTarjeta ? undefined : 'sr-only'}>
        {titulo}
      </Titulo>
      {children}
    </section>
  )
}
