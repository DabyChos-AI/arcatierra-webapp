// R15 · F2 (WF2, sesión 55) · sección 1: el hero partido de la maqueta (`.hero-split`): «Vive Arca» → Experiencias y «Come
// Arca» → la tienda nueva en su pestaña de canastas. Cada mitad es un enlace completo (como la maqueta). Componente de servidor.
// - Textos de la maqueta; si en el panel se publican las claves `hero_vive` / `hero_come` de la portada, mandan su título,
//   texto y foto. Los destinos NO salen del panel: son los del contrato (C24).
// - Sin foto publicada → la marca en su lugar (la diseñadora no ha entregado las fotos finales).
import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import type { DatosPortada } from '@/types/contenido-sitio'
import Falta from '../Falta'
import { ENLACES_PORTADA, ENLACES_TIENDA } from '../enlaces'

type Mitad = {
  clave: 'hero_vive' | 'hero_come'
  etiqueta: string
  titulo: string
  texto: string
  boton: string
  href: string
  fondo: string
  boton_clases: string
}

const MITADES: readonly Mitad[] = [
  {
    clave: 'hero_vive',
    etiqueta: 'Experiencias',
    titulo: 'Vive Arca',
    texto: 'Conoce la chinampa, prueba la cosecha del día, ven a un evento o reserva tu propio espacio.',
    boton: 'Reservar experiencia',
    href: ENLACES_PORTADA.experiencias,
    fondo: 'bg-sn-bosque',
    boton_clases: 'bg-sn-terra text-white group-hover:bg-sn-oxido',
  },
  {
    clave: 'hero_come',
    etiqueta: 'Tienda',
    titulo: 'Come Arca',
    texto: 'La chinampa en tu casa. Canasta semanal, frutas y verduras de temporada, despensa y más.',
    boton: 'Quiero mi canasta',
    href: ENLACES_TIENDA.canasta,
    fondo: 'bg-sn-terra',
    boton_clases: 'bg-sn-calido text-sn-tinta group-hover:bg-white',
  },
]

export default function Hero({ portada }: { portada: Record<string, DatosPortada> }) {
  return (
    <section data-testid="sn-portada-hero" aria-label="Vive Arca y Come Arca" className="grid grid-cols-1 min-[861px]:grid-cols-2">
      {MITADES.map((m) => {
        const panel = portada[m.clave]
        const titulo = panel?.titulo?.trim() || m.titulo
        const texto = panel?.texto?.trim() || m.texto
        const foto = panel?.imagen_url?.trim() || null
        return (
          <Link
            key={m.clave}
            href={m.href}
            data-testid={`sn-portada-hero-${m.clave === 'hero_vive' ? 'vive' : 'come'}`}
            data-foto={foto ? '1' : '0'}
            className={`group relative flex min-h-[460px] min-w-0 flex-col justify-end overflow-hidden px-6 pb-sn-5 pt-sn-3 text-white hover:text-white min-[861px]:min-h-[640px] min-[861px]:px-sn-6 min-[861px]:pb-sn-8 ${m.fondo}`}
          >
            {foto ? (
              <>
                <OptimizedImage
                  src={foto}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 861px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="mb-sn-3 w-full">
                <Falta como="bloque" que={`foto del hero «${m.titulo}»`} quien="Diseñadora" />
              </div>
            )}
            <div className="relative max-w-[460px]">
              <p className="mb-3 font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.8px] text-white/90">
                {m.etiqueta}
              </p>
              <h2 className="font-sn-titulos text-[52px] leading-[0.95] tracking-[-1.5px] min-[861px]:text-[80px]">{titulo}</h2>
              <p className="mt-4 text-[15px] leading-[1.6] text-white/90">{texto}</p>
              <span
                data-testid={`sn-portada-hero-${m.clave === 'hero_vive' ? 'vive' : 'come'}-boton`}
                className={`mt-sn-3 inline-flex items-center gap-2 rounded-sn-boton px-[22px] py-[14px] font-sn-mono text-[11px] font-medium uppercase leading-none tracking-[1.4px] transition-colors ${m.boton_clases}`}
              >
                {m.boton} <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
