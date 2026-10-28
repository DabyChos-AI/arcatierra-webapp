// R15 · F2 (WF2, sesión 55) · sección 6: la franja de restaurantes (maqueta `.restaurantes-strip`). Los nombres y logos de los
// restaurantes NO se escriben: no llegaron ni los logos ni el permiso para nombrarlos (marca, Lucio y Pablo). «Contacto →» va
// al formulario que ya existe (/restaurantes, POST /api/restaurantes/solicitud), nunca al wa.me de relleno. Servidor.
import Link from 'next/link'
import Falta from '../Falta'
import { ENLACES_PORTADA } from '../enlaces'
import { SECCION } from './estilos'

export default function Restaurantes() {
  return (
    <section data-testid="sn-portada-restaurantes" className="border-y border-sn-borde bg-sn-calido py-sn-4">
      <div className={`${SECCION} flex flex-col gap-4 min-[861px]:flex-row min-[861px]:items-center min-[861px]:justify-between`}>
        <p className="font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.4px] text-sn-gris">
          Proveemos a restaurantes. Producto de chinampa, entrega en CDMX.
        </p>
        <div className="min-w-0 text-sm">
          <Falta que="logos de los restaurantes y su permiso para nombrarlos" quien="Lucio y Pablo" />
        </div>
        <Link
          href={ENLACES_PORTADA.restaurantes}
          data-testid="sn-portada-restaurantes-contacto"
          className="shrink-0 self-start font-sn-mono text-[11px] font-medium uppercase tracking-[1.4px] text-sn-terra underline underline-offset-4 hover:text-sn-tinta min-[861px]:self-auto"
        >
          Contacto →
        </Link>
      </div>
    </section>
  )
}
