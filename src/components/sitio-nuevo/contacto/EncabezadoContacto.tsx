import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

// R15 v2 · F5 (contacto): encabezado de /contacto (maqueta `.simple-hero`). D-F5-11 P-1; cadena-v2/f5/contacto-F5.md §2.0.
// Textos de hoy: «Contacto» (`src/app/contacto/page.tsx:141`) y su texto (`:142-144`). Sin el eyebrow de la maqueta: repetiría el `h1`.
// Fondo cream: el `h1` en terra es título grande (4.13, CONTRATO-BASE §2.2); el texto en ink (9.88). Medido en la maqueta (`.simple-hero`): relleno
// 80/40/60 (56/24/40 a 390) por fuera y el interior de 1100 sin relleno propio; el texto 16 px debajo del `h1`.
export default function EncabezadoContacto() {
  return (
    <Seccion fondo="cream" espacio="ninguno" testId="sn-contacto-encabezado" className="px-sn-lateral-movil pb-10 pt-sn-seccion-movil min-[861px]:px-sn-lateral min-[861px]:pb-[60px] min-[861px]:pt-sn-seccion">
      <Contenedor ancho="angosto" relleno={false}>
        <Titulo nivel={1} tamano="hero" tono="terra" testId="sn-contacto-encabezado-titulo">
          Contacto
        </Titulo>
        <Texto tamano="grande" ancho="parrafo" testId="sn-contacto-encabezado-texto" className="mt-4">
          Estamos aquí para responder tus preguntas sobre nuestros productos, servicios y experiencias en las chinampas.
        </Texto>
      </Contenedor>
    </Seccion>
  )
}
