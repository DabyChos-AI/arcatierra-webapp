import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

// R15 v2 · F5 (contacto): la franja final de /contacto de hoy (`src/app/contacto/page.tsx:362-376`), que la maqueta no trae (DR-10; D-F5-11
// P-8), con sus textos: «¿Prefieres hablar personalmente?», «Agenda una visita a nuestras chinampas en Xochimilco y conoce de primera mano
// nuestro proyecto de agricultura regenerativa.» y «Explorar experiencias» a /experiencias. Fondo forest (el verde de hoy), texto warm (6.36).
export default function FranjaPersonal() {
  return (
    <Seccion fondo="forest" testId="sn-contacto-personal" etiquetadaPor="sn-contacto-personal-titulo">
      <Contenedor ancho="angosto" className="flex flex-col items-center gap-6 text-center">
        <Titulo nivel={2} tamano="h3" tono="warm" id="sn-contacto-personal-titulo" testId="sn-contacto-personal-titulo">
          ¿Prefieres hablar personalmente?
        </Titulo>
        <Texto tamano="grande" tono="warm" ancho="parrafo" testId="sn-contacto-personal-texto">
          Agenda una visita a nuestras chinampas en Xochimilco y conoce de primera mano nuestro proyecto de agricultura regenerativa.
        </Texto>
        <Boton href="/experiencias" sobreOscuro flecha testId="sn-contacto-personal-boton">
          Explorar experiencias
        </Boton>
      </Contenedor>
    </Seccion>
  )
}
