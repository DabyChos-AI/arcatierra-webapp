import type { Metadata } from 'next'
import Falta from '@/components/sitio-nuevo/Falta'
import Cinta from '@/components/sitio-nuevo/armazon/Cinta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Lema from '@/components/sitio-nuevo/portada/arriba/Lema'
import HeroeDividido from '@/components/sitio-nuevo/portada/arriba/HeroeDividido'
import TresPuertas from '@/components/sitio-nuevo/portada/arriba/TresPuertas'
import ExperienciasDestacadas from '@/components/sitio-nuevo/portada/arriba/ExperienciasDestacadas'
import Super from '@/components/sitio-nuevo/portada/arriba/Super'
import Restaurantes from '@/components/sitio-nuevo/portada/abajo/Restaurantes'
import PausaChinampa from '@/components/sitio-nuevo/portada/abajo/PausaChinampa'
import EventosCatering from '@/components/sitio-nuevo/portada/abajo/EventosCatering'
import Manifiesto from '@/components/sitio-nuevo/portada/abajo/Manifiesto'
import Prensa from '@/components/sitio-nuevo/portada/abajo/Prensa'
import Instagram from '@/components/sitio-nuevo/portada/abajo/Instagram'

// R15 v2 · F2 (sesión 59): la portada del sitio nuevo, en la dirección `/` (RUTAS_SITIO_NUEVO; solo se ve con ARCA_SITIO_NUEVO=1).
// Contrato v2 §9-F2 D-F2-04 (los 12 bloques en el orden de la maqueta, con la cinta en el lugar 2), D-F2-06 (testids), D-F2-08 y D-F2-09.
// - Título: el de la portada de hoy (src/app/layout.tsx:52, `title.default`; la de hoy no exporta uno propio).
// - Un solo <h1>, oculto y en la letra de títulos: la portada de la maqueta no trae ninguno (medido; las otras 14 páginas sí) y sus títulos
//   son h2 (D-F2-09 P-1, D-F2-16).
// - Primer hijo del <main>: la marca del visto bueno del Nivel 1, que venía de la muestra de F0 (C14; D-F2-08 l). Las otras dos marcas de la
//   muestra van en los bloques de abajo (10 estados → manifiesto, 5 tipos de evento → eventos).
// - La página sigue estática: los datos los piden las piezas en el navegador (D-F2-03).

export const metadata: Metadata = {
  title: { absolute: 'Arca Tierra | Agricultura regenerativa, chinampas y alimentos agroecológicos' },
}

export default function Portada() {
  return (
    <main data-testid="sn-portada">
      <div data-testid="sn-portada-nivel1">
        <Contenedor className="py-2 text-center">
          <p className="m-0 font-sn-texto text-sn-cuerpo-xs">
            <Falta que="visto bueno del Nivel 1 de la maqueta" quien="Lucio y Pablo" />
          </p>
        </Contenedor>
      </div>
      <h1 className="sr-only font-sn-titulos font-normal">Arca Tierra</h1>
      <Lema />
      <HeroeDividido />
      <Cinta />
      <TresPuertas />
      <ExperienciasDestacadas />
      <Super />
      <Restaurantes />
      <PausaChinampa />
      <EventosCatering />
      <Manifiesto />
      <Prensa />
      <Instagram />
    </main>
  )
}
