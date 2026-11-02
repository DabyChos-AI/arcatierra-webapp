import { ENLACE_MI_CUENTA } from '@/components/sitio-nuevo/armazon/enlaces'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

// R15 v2 · F6 (acceso): encabezado de las tres páginas sin sesión (maqueta `#cuenta-noauth` › `.simple-hero`). D-F6-09 P-1, P-9;
// cadena-v2/f6/acceso-F6.md §2.1, §4. El eyebrow es el nombre de hoy de esta parte del sitio («Mi cuenta», `armazon/enlaces.ts:22`, importado,
// como «Recetas» en F5); el `h1` y el texto los pasa cada página con su original. Fondo cream: el `h1` en terra va como título grande (4.13,
// CONTRATO-BASE §2.2) y el eyebrow y el texto en ink. Mismo ritmo que `.simple-hero` medido en F5 (80/40/60 y 56/24/40 a 390, interior 1100).
// Sin 'use client': lo pinta el servidor o, en /auth/signin, el componente de cliente que cambia el texto con el modo.

type Props = {
  titulo: string
  texto?: React.ReactNode
}

export default function EncabezadoAcceso({ titulo, texto }: Props) {
  return (
    <Seccion
      fondo="cream"
      espacio="ninguno"
      testId="sn-acceso-encabezado"
      className="px-sn-lateral-movil pb-10 pt-sn-seccion-movil min-[861px]:px-sn-lateral min-[861px]:pb-[60px] min-[861px]:pt-sn-seccion"
    >
      <Contenedor ancho="angosto" relleno={false}>
        <Etiqueta tamano="eyebrow" tono="ink" testId="sn-acceso-encabezado-etiqueta" className="mb-4">
          {ENLACE_MI_CUENTA.texto}
        </Etiqueta>
        <Titulo nivel={1} tamano="hero" tono="terra" testId="sn-acceso-encabezado-titulo" className="max-w-sn-titulo">
          {titulo}
        </Titulo>
        {texto !== undefined && (
          <Texto tamano="grande" tono="ink" ancho="parrafo" testId="sn-acceso-encabezado-texto" className="mt-4">
            {texto}
          </Texto>
        )}
      </Contenedor>
    </Seccion>
  )
}
