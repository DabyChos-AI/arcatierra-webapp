// R15 v2 · F2 (sesión 59): bloque 0 de la portada, la franja del lema (maqueta `.tagline-strip`). Contrato v2 §9-F2 D-F2-04, D-F2-08, D-F2-09.
// La frase no existe en el sitio de hoy (pregunta C41) y el año «desde» es una cifra de `contenido_sitio` que ninguna ruta lee (pregunta C40):
// dos marcas. Van en la letra de texto y sin itálica: la marca es negrita y DM Serif / la itálica de Inter no existen (C36); cuando llegue el
// texto, la franja pasa a la de la maqueta (DM Serif itálica 14 px). Componente de servidor.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

export default function Lema() {
  return (
    <Seccion testId="sn-portada-lema" fondo="cream" espacio="ninguno" borde="abajo" className="py-3">
      <Contenedor>
        <p className="m-0 text-center font-sn-texto text-sn-cuerpo-sm font-normal text-sn-ink">
          <Falta que="lema de la portada" quien="Lucio y Pablo" />{' '}
          <Falta que="año de inicio («desde»), cifra de la base sin ruta" quien="David" />
        </p>
      </Contenedor>
    </Seccion>
  )
}
