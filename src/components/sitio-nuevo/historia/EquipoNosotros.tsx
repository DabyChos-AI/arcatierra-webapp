// R15 v2 · F5 (historia): «Quién está detrás» de /nosotros (maqueta [3]: retratos con foto, nombre, rol y una línea). Contrato v2 §9-F5
// D-F5-06, D-F5-13 P-1 c, P-7; cadena-v2/f5/historia-F5.md §3.3. Componente de servidor, sin datos de la API.
// - Solo Lucio tiene texto hoy (D-F5-06): nombre y rol de hoy (src/app/nosotros/page.tsx:227, :228) y SOLO el 2.º párrafo (:237-240): el
//   1.º trae «más de 15 años», que choca con los 17 firmados, y ninguna oración se corta (D-F5-13 P-1 c). Hoy no tiene foto (iniciales
//   «LU», :224-226): marca a Lucio y Pablo (fotos: Diseñadora si C26 lo dice).
// - Los demás retratos de la maqueta son nombres genéricos (DR-17) y el equipo de /baldio/equipo es relleno (MAPA-CONTENIDO B §12 H12): UN
//   bloque con la marca, del tamaño de un retrato (el elemento es el equipo, como D-F2-13 P-1). «← desliza…» no se pinta (sin carrusel).
// - El título de hoy («Nuestro Fundador», :218) nombra solo a Lucio y el de la maqueta no tiene equivalente: `h2` oculto con etiqueta
//   neutra (C24, P-7). El eyebrow y la intro de la maqueta no se pintan.
// Medido en la maqueta: cream con borde arriba y abajo, 80/40; retratos de 260 con 20 entre ellos; nombre de 22 px, rol mono de 10 px en terra,
// texto de 13 px ligera. El rol va en ink y no en terra: sobre cream terra chico da 4.13 (medido en mi arnés; CONTRATO-BASE-F1 §2.2).
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-nosotros-equipo'
const P = `${H}-persona`

export default function EquipoNosotros() {
  return (
    <Seccion testId={H} fondo="cream" espacio="normal" borde="ambos" etiquetadaPor={`${H}-titulo`}>
      <Contenedor>
        <h2 id={`${H}-titulo`} data-testid={`${H}-titulo`} className="sr-only font-sn-titulos font-normal">
          Equipo
        </h2>
        <ul data-testid={`${H}-lista`} className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 min-[861px]:grid-cols-4">
          <li data-testid={P} data-persona="lucio" className="flex flex-col gap-3">
            <Foto
              testId={`${P}-foto`}
              falta={{ que: 'foto de Lucio Usobiaga', quien: 'Lucio y Pablo' }}
              redondeo="tarjeta"
            />
            <Titulo nivel={3} tamano="h5" testId={`${P}-nombre`}>
              Lucio Usobiaga
            </Titulo>
            <p data-testid={`${P}-rol`} className="m-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">
              Fundador y Director
            </p>
            <Texto testId={`${P}-texto`} tamano="mini">
              Su trabajo ha sido reconocido por organizaciones nacionales e internacionales por su contribución a la conservación del
              patrimonio agrícola mexicano y el desarrollo de sistemas alimentarios sustentables.
            </Texto>
          </li>
          <li data-testid={`${H}-resto`} className="flex">
            <Falta
              como="bloque"
              que="nombre, rol, una línea y foto de cada persona del equipo (además de Lucio)"
              quien="Lucio y Pablo"
            />
          </li>
        </ul>
      </Contenedor>
    </Seccion>
  )
}
