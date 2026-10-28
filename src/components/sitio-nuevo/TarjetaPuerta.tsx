// R15 · F1 (WF1, sesión 54): la tarjeta «de 3 puertas» de la maqueta (`.banner-3p-v7-card` de «Comida real, directo a tu
// puerta»): número y etiqueta, nombre, descripción, precio y flecha; toda la tarjeta es un enlace. Componente de servidor.
// - El precio lo pasa quien la usa, siempre leído de la base (p. ej. «desde $45» = el producto suelto más barato en venta).
// - La ilustración de arriba: la maqueta trae las de Arca Tierra incrustadas y la diseñadora no ha entregado los archivos ni su
//   lugar final (hand-off v7.6 «Ilustraciones»): sin `ilustracion` va la marca en su lugar.
// - `etiquetaDestacada` es la pastilla de la tarjeta destacada («Más popular» en la maqueta): solo se pinta si se pasa.
import Link from 'next/link'
import Falta from './Falta'

const FONDOS = {
  azul: 'bg-sn-azul',
  terra: 'bg-sn-terra',
  durazno: 'bg-sn-durazno',
} as const

type Props = {
  /** «01», «02», «03». */
  numero: string
  /** «Probar primero» (va después del número). */
  etiqueta: string
  nombre: string
  descripcion: React.ReactNode
  /** «desde $45» (de la base) o una marca. */
  precio: React.ReactNode
  href: string
  fondo: keyof typeof FONDOS
  ilustracion?: React.ReactNode
  etiquetaDestacada?: string | null
  testid?: string
}

export default function TarjetaPuerta({
  numero,
  etiqueta,
  nombre,
  descripcion,
  precio,
  href,
  fondo,
  ilustracion,
  etiquetaDestacada = null,
  testid = 'sn-tarjeta-puerta',
}: Props) {
  return (
    <Link
      href={href}
      data-testid={testid}
      data-numero={numero}
      className="group flex min-w-0 flex-col overflow-hidden rounded-sn-tarjeta border border-sn-borde bg-white font-sn-texto text-sn-tinta transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:text-sn-tinta hover:shadow-[0_16px_40px_rgba(61,42,26,0.10)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className={`relative flex aspect-video items-center justify-center overflow-hidden p-[18px] ${FONDOS[fondo]}`}>
        {ilustracion ?? <Falta como="bloque" que={`ilustración de «${nombre}»`} quien="Diseñadora" />}
        {etiquetaDestacada && (
          <span className="absolute right-[14px] top-[14px] rounded-sn-pildora bg-sn-calido px-[11px] py-[5px] font-sn-mono text-[9px] font-medium uppercase leading-[1.55] tracking-[1.4px] text-sn-terra">
            {etiquetaDestacada}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-[26px] pb-[26px] pt-7">
        <p className="font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.4px] text-sn-terra">
          {numero} · {etiqueta}
        </p>
        <p className="-mb-[2px] font-sn-titulos text-[32px] leading-[1.05] tracking-[-0.6px] text-sn-terra min-[861px]:text-4xl">{nombre}</p>
        <div className="mb-1 text-sm leading-[1.55] text-sn-tinta/75">{descripcion}</div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-sn-borde pt-4">
          <span data-testid={`${testid}-precio`} className="font-sn-mono text-[13px] font-medium leading-[1.55] text-sn-tinta">
            {precio}
          </span>
          <span
            aria-hidden="true"
            className="font-sn-mono text-lg font-medium text-sn-terra transition-transform duration-200 group-hover:translate-x-[5px] motion-reduce:transition-none"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
