// R15 v2 · F5 (recetas, sesión 63): las categorías de la FAQ en una columna de 880 px (maqueta `.faq-section`), con encabezado en letra mono
// y preguntas plegables (contrato v2 D-F5-06, D-F5-12 P-10 A; cadena-v2/f5/recetas-F5.md §3.3–3.11). Orden de la maqueta: canastas,
// entregas, productos y experiencias.
// - Canastas y suscripciones, Entregas, Productos y origen: no hay texto de hoy (C41 b, MAPA-CONTENIDO B 7.2): UNA marca por categoría,
//   a nombre de Lucio y Pablo (M3–M5). Quien las escriba respeta REGLAS-DEL-NEGOCIO: sin pausa (DR-11) ni saltar semana (DR-9), la canasta no
//   se arma (DR-12), se cancela y se vuelve a suscribir (SUB6), semanal y quincenal, extras hasta 2 días hábiles antes (SU2); envío de $100 y
//   gratis desde $1,000 (DR-13), días según la zona, entrega de 7:00 a 17:00 (Word P2), recoger en bodega (BOD1), sábado y domingo sin envíos
//   (DR-23); 60+ familias y 10 estados son cifras sin ruta y no se sabe cuáles estados (C40, C8). Los textos de la maqueta no se cargan (C17).
// - Experiencias: las 6 categorías de hoy (`src/data/faq.ts`) con su título importado, sin el emoji de `icon`; sus preguntas con las
//   excepciones de `preguntas.ts`.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import PreguntaPlegable from './PreguntaPlegable'
import { categoriasDeHoy } from './preguntas'

const C = 'sn-faq-categorias'
const ENCABEZADO =
  'm-0 border-0 border-b border-solid border-sn-border pb-3 font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-terra'

const SIN_TEXTO_DE_HOY = [
  { clave: 'canastas', que: 'preguntas y respuestas de canastas y suscripciones' },
  { clave: 'entregas', que: 'preguntas y respuestas de entregas' },
  { clave: 'productos', que: 'preguntas y respuestas de productos y origen' },
] as const

export default function CategoriasFaq() {
  const categorias = categoriasDeHoy()
  return (
    <Seccion testId={C} fondo="warm">
      <Contenedor ancho="titulo" className="flex flex-col gap-12">
        {SIN_TEXTO_DE_HOY.map((c) => (
          <div key={c.clave} data-testid={`${C}-categoria`} data-categoria={c.clave}>
            <Falta que={c.que} quien="Lucio y Pablo" como="bloque" />
          </div>
        ))}
        {categorias.map((c) => (
          <div key={c.clave} data-testid={`${C}-categoria`} data-categoria={c.clave}>
            <h2 data-testid={`${C}-titulo`} className={ENCABEZADO}>
              {c.titulo}
            </h2>
            {c.preguntas.map((p) => (
              <PreguntaPlegable key={p.id} id={p.id} pregunta={p.pregunta} origen={p.origen} abiertaAlInicio={p.respuesta === null}>
                <Texto tamano="chico" tono="ink-suave">
                  {p.respuesta === null ? (
                    <Falta que="política de cancelación y reembolso de experiencias" quien="David" />
                  ) : (
                    p.respuesta
                  )}
                </Texto>
              </PreguntaPlegable>
            ))}
          </div>
        ))}
      </Contenedor>
    </Seccion>
  )
}
