// R15 v2 · F5 (recetas, sesión 63): héroe de /recetas = `.simple-hero` de la maqueta (fondo cream con filete abajo, contenido de 1100 px,
// título serif terra, texto de 17 px; las medidas del encabezado de F3, `carrito/Encabezado.tsx`, que no trae eyebrow ni testids por pieza).
// Contrato v2 D-F5-12 (P-1 A); cadena-v2/f5/recetas-F5.md §2.1–2.4. Textos de hoy (DR-17), sin emojis:
// - eyebrow «Recetas» = el nombre del destino (`armazon/enlaces.ts:35`); en cream va en ink (terra no llega a 4.5, CONTRATO-BASE-F1 §2.2);
// - `<h1>` y texto = `src/app/recetas/client-page.tsx:266-271`; «Probadas en cocina de Baldío» de la maqueta no tiene fuente: no va;
// - los dos párrafos de hoy (`:278-288`) letra por letra sin emojis; «6,000», «30,000» y «60%» están en la lista corta (D-F5-12 P-1).
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-recetas-heroe'

export default function HeroeRecetas() {
  return (
    <Seccion
      testId={H}
      fondo="cream"
      borde="abajo"
      espacio="ninguno"
      etiquetadaPor={`${H}-h1`}
      className="pb-10 pt-sn-seccion-movil min-[861px]:pb-[60px] min-[861px]:pt-sn-seccion"
    >
      <Contenedor ancho="angosto">
        <Etiqueta tamano="eyebrow" tono="ink" testId={`${H}-etiqueta`} className="mb-4">
          Recetas
        </Etiqueta>
        <Titulo nivel={1} tamano="hero" tono="terra" id={`${H}-h1`} testId={`${H}-titulo`} className="max-w-sn-titulo">
          Recetas Agroecológicas
        </Titulo>
        <Texto tamano="grande" tono="ink" ancho="parrafo" testId={`${H}-texto`} className="mt-4">
          Descubre el sabor auténtico de la tierra con recetas que celebran cada parte de los ingredientes agroecológicos
        </Texto>
        <div data-testid={`${H}-filosofia`} className="mt-8 grid grid-cols-1 gap-6 min-[861px]:grid-cols-2 min-[861px]:gap-8">
          <Texto tono="ink">
            Queremos que tu cocina se llene de <strong>frescura, colores y texturas de temporada</strong>. Cada semana cambia lo que
            cosechamos, y eso nos inspira a comer distinto, probar nuevos ingredientes y reconectar con la diversidad de nuestra tierra.
          </Texto>
          <div className="flex flex-col gap-3">
            <Texto tono="ink">
              Aunque existen entre <strong>6,000 y 30,000 plantas comestibles</strong>, hoy en día solo cuatro (maíz, trigo, arroz y papa)
              representan más del 60% de las calorías que consume la humanidad.
            </Texto>
            <Texto tono="ink">
              Aquí hacemos lo contrario: <strong>celebramos la variedad, lo local y lo agroecológico.</strong>
            </Texto>
          </div>
        </div>
      </Contenedor>
    </Seccion>
  )
}
