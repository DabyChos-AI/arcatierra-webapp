import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'

// R15 · F3 v2 (carrito, sesión 61): el encabezado de las páginas del carrito, el checkout y sus resultados = `.simple-hero` de la
// maqueta (medido por file://, f3/carrito-F3.md §1): fondo cream con filete abajo, relleno 80/40/60 (56/24/40 hasta 860 px), contenido de
// 1100 px, título serif 79.2 px (48 px a 390) y texto de 17 px. En cream el título terra pasa como texto grande (4.13 ≥ 3) y el texto va en
// ink (ink al 70 % no llega a 4.5 en cream, CONTRATO-BASE-F1 §2.2). Sin eyebrow: la maqueta lo trae y no tiene original (D-F3-20 P-1).

type Props = {
  titulo: string
  texto?: string
  testId?: string
  children?: React.ReactNode
}

export default function Encabezado({ titulo, texto, testId, children }: Props) {
  return (
    <Seccion
      fondo="cream"
      borde="abajo"
      espacio="ninguno"
      testId={testId}
      className="pb-10 pt-sn-seccion-movil min-[861px]:pb-[60px] min-[861px]:pt-sn-seccion"
    >
      <Contenedor ancho="angosto">
        <Titulo nivel={1} tamano="hero" tono="terra" className="max-w-sn-titulo">
          {titulo}
        </Titulo>
        {texto && (
          <Texto tamano="grande" tono="ink" ancho="parrafo" className="mt-4">
            {texto}
          </Texto>
        )}
        {children}
      </Contenedor>
    </Seccion>
  )
}
