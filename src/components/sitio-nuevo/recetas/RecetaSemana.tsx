// R15 v2 · F5 (recetas, sesión 63): el bloque «Receta de la semana» de la maqueta. El concepto no existe en la plataforma ni hay quien la
// elija (C43, MAPA-CONTENIDO B 8.2): va UNA marca en bloque en su lugar y ninguna receta escogida a mano (D-F5-06, D-F5-12: M1).
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

export default function RecetaSemana() {
  return (
    <Seccion testId="sn-recetas-semana" fondo="warm" espacio="ninguno" className="pt-sn-seccion-movil min-[861px]:pt-12">
      <Contenedor ancho="medio">
        <Falta que="receta de la semana" quien="David" como="bloque" />
      </Contenedor>
    </Seccion>
  )
}
