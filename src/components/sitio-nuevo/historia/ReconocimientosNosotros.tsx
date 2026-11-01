// R15 v2 · F5 (historia): «Reconocimientos» de /nosotros (maqueta [4]: título y el panel de sellos). Contrato v2 §9-F5 D-F5-13 P-7;
// cadena-v2/f5/historia-F5.md §3.4. Componente de servidor, sin datos de la API. El panel es el de Chinampas (historia/Reconocimientos.tsx).
// El título de la maqueta no tiene equivalente: `h2` oculto con etiqueta neutra (C24). El eyebrow no se pinta.
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Reconocimientos from './Reconocimientos'

const H = 'sn-nosotros-reconocimientos'

export default function ReconocimientosNosotros() {
  return (
    <Seccion testId={H} fondo="warm" espacio="normal" borde="arriba" etiquetadaPor={`${H}-titulo`}>
      <Contenedor ancho="angosto">
        <h2 id={`${H}-titulo`} data-testid={`${H}-titulo`} className="sr-only font-sn-titulos font-normal">
          Reconocimientos
        </h2>
        <Reconocimientos variante="nosotros" base={H} />
      </Contenedor>
    </Seccion>
  )
}
