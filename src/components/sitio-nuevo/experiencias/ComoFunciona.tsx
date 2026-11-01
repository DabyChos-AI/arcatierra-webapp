import Falta from '@/components/sitio-nuevo/Falta'

// R15 v2 · F4 (sesión 62): «Cómo funciona» de la lista de experiencias (maqueta `.how-it-works`: panel crema, radio 18, borde, relleno 64/48).
// Su texto (título y los 4 pasos) no existe en ningún lado: MAPA-CONTENIDO B 1.3 y §11 #17, pregunta C41 (b). Va UNA marca para el bloque
// (D-F4-12 P-5), a nombre de Lucio y Pablo, como las demás frases sin equivalente (D-F2-05). Sin título ni nombre accesible propio: el
// título de la maqueta es parte de lo que falta.
export default function ComoFunciona() {
  return (
    <div
      data-testid="sn-experiencias-como"
      className="rounded-sn-panel border border-solid border-sn-border bg-sn-cream p-8 min-[861px]:px-12 min-[861px]:py-16"
    >
      <Falta que="texto de los pasos de “Cómo funciona” para comprar una experiencia" quien="Lucio y Pablo" como="bloque" />
    </div>
  )
}
