// R15 · F2 (WF2, sesión 55) · sección 0: la frase de arriba del hero (maqueta `.tagline-strip`). Es el único <h1> de la portada.
// Texto de la maqueta con el año de contenido_sitio (cifra `desde`); si en el panel se publica la clave `tagline` de la portada,
// manda ese texto. Componente de servidor.
import type { DatosCifra, DatosPortada } from '@/types/contenido-sitio'
import CifraEnLinea from './CifraEnLinea'

export default function Frase({ tagline, cifras }: { tagline: DatosPortada | undefined; cifras: Record<string, DatosCifra> }) {
  const publicado = tagline?.texto?.trim() || tagline?.titulo?.trim() || null
  return (
    <div
      data-testid="sn-portada-frase"
      data-origen={publicado ? 'panel' : 'maqueta'}
      className="border-b border-sn-borde bg-sn-calido px-6 py-[10px] text-center"
    >
      <h1 className="font-sn-titulos text-[15px] leading-[1.4] tracking-[-0.2px] text-sn-tinta min-[861px]:text-base">
        {publicado ?? (
          <>
            Comida honesta del campo mexicano.{' '}
            <em className="text-sn-terra">
              Desde <CifraEnLinea clave="desde" cifras={cifras} />.
            </em>
          </>
        )}
      </h1>
    </div>
  )
}
