import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import IndiceLegal, { type DocumentoLegal } from './IndiceLegal'

// R15 v2 · F5 (legales): el armado común de /privacidad y /terminos (maqueta `[data-page="legal"]`: `.simple-hero` + índice + columna de
// texto). D-F5-11 P-9 (A): dos páginas con el mismo armado; `/legal` y `/cookies` no se crean (D-F5-04). El `h1` es el de cada página de hoy.
// Sin el eyebrow «Aviso legal», el subtítulo con un correo de relleno ni la nota «Borrador…» de la maqueta (relleno, C17): las marcas dicen
// qué falta y de quién (D-F5-06). Medido en la maqueta: el encabezado como el de /contacto; la sección con 64/40 de relleno (40 a 390), índice de
// 240 y texto de 732 con 48 de hueco (aquí 1/4 y 3/4); hasta 860 el índice va arriba (la maqueta lo deja al lado y se sale a 390).
export default function PaginaLegal({
  documento,
  titulo,
  children,
}: {
  documento: DocumentoLegal
  titulo: string
  children: React.ReactNode
}) {
  return (
    <main data-testid="sn-legal" data-documento={documento}>
      <Seccion fondo="cream" espacio="ninguno" testId="sn-legal-encabezado" className="px-sn-lateral-movil pb-10 pt-sn-seccion-movil min-[861px]:px-sn-lateral min-[861px]:pb-[60px] min-[861px]:pt-sn-seccion">
        <Contenedor ancho="angosto" relleno={false}>
          <Titulo nivel={1} tamano="hero" tono="terra" testId="sn-legal-encabezado-titulo">
            {titulo}
          </Titulo>
        </Contenedor>
      </Seccion>
      <Seccion fondo="warm" espacio="ninguno" className="py-10 min-[861px]:py-16">
        <Contenedor ancho="angosto">
          <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] min-[861px]:gap-12">
            <IndiceLegal documento={documento} />
            <div className="flex min-w-0 flex-col gap-14">{children}</div>
          </div>
        </Contenedor>
      </Seccion>
    </main>
  )
}
