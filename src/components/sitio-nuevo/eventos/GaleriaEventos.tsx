// R15 v2 · F4 (eventos): la galería «Eventos pasados» (maqueta `.galeria`: cream con bordes, 5 fotos). No hay fotos de eventos en el sitio
// (MAPA-CONTENIDO B §2.3, §11 #4; Word P8; C26): UNA marca en bloque a las Encargadas de Experiencias (D-F4-07 P-5) y el encabezado solo para
// lectores de pantalla con una etiqueta neutra (P-3, C24). Componente de servidor.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const G = 'sn-eventos-galeria'

export default function GaleriaEventos() {
  return (
    <Seccion testId={G} fondo="cream" borde="ambos" espacio="normal" etiquetadaPor={`${G}-encabezado`}>
      <Contenedor>
        <h2 id={`${G}-encabezado`} className="sr-only">
          Eventos pasados
        </h2>
        <Falta que="fotos de eventos pasados" quien="Encargadas de Experiencias" como="bloque" />
      </Contenedor>
    </Seccion>
  )
}
