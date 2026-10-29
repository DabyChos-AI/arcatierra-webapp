// R15 v2 · F1: la cinta del sitio nuevo (maqueta `.ticker`), debajo de la cabecera. Contrato v2 §9 C21.
// Sus textos no existen en ningún lado: los de la maqueta son relleno (pregunta C17), los 3 mensajes de hoy (announcementMessages.ts)
// apuntan al WordPress y la pregunta C46 pregunta si siguen, y las cifras no tienen ruta (pregunta C40). Va la marca a nombre de Lucio y
// Pablo; sin animación mientras no haya textos. La pregunta C24 decide en F2 si se queda solo en la portada. Componente de servidor.
import Falta from '@/components/sitio-nuevo/Falta'
import { E } from './estilos'

export default function Cinta() {
  return (
    <div data-testid="sn-cinta" className={E.cinta}>
      <Falta que="textos y vigencia de la cinta" quien="Lucio y Pablo" />
    </div>
  )
}
