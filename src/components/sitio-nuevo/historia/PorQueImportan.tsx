// R15 v2 · F5 (historia): «Por qué importan» de /chinampas (maqueta [1]: título, texto, panel de sellos y una foto vertical a la derecha).
// Contrato v2 §9-F5 D-F5-13; cadena-v2/f5/historia-F5.md §2.1. Componente de servidor, sin datos de la API.
// - `h2` y lista: «Características Únicas» y sus cinco renglones de hoy, letra por letra (src/app/xochimilco/page.tsx:81, :85, :89, :93, :97,
//   :101); son el equivalente de la frase «Produce oxígeno…» de la maqueta (MAPA-CONTENIDO B §4.2). El eyebrow, el párrafo, la línea en
//   itálica y el título de la maqueta no se pintan (genéricos, sin equivalente: D-F4-07 P-10).
// - Sellos: historia/Reconocimientos.tsx (UNESCO de hoy + 3 marcas).
// - Foto: la de hoy con su alt de hoy (src/app/components/HomePage.tsx:18-19; la misma de la pausa de la portada; D-F5-13 P-6).
// Medido en la maqueta: warm, 80/40, columna de 1280; título de 780 con 48 abajo; rejilla 628 · 524 con 48 entre ellas; a la izquierda 18
// entre piezas; la foto 4:5 con radio 14. En el celular la maqueta deja dos columnas que no caben: aquí se apilan.
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Reconocimientos from './Reconocimientos'

const H = 'sn-chinampas-importan'

const CARACTERISTICAS = [
  'Sistema de riego natural por capilaridad',
  'Suelos extremadamente fértiles y ricos en nutrientes',
  'Microclima ideal para cultivos de alta calidad',
  'Biodiversidad única con especies endémicas',
  'Captura natural de carbono y purificación del agua',
] as const

export default function PorQueImportan() {
  return (
    <Seccion testId={H} fondo="warm" espacio="normal" borde="arriba" etiquetadaPor={`${H}-titulo`}>
      <Contenedor>
        <Titulo nivel={2} tamano="h2" id={`${H}-titulo`} testId={`${H}-titulo`} className="mb-12 max-w-[780px]">
          Características Únicas
        </Titulo>
        <div className="grid grid-cols-1 items-start gap-12 min-[861px]:grid-cols-[628fr_524fr]">
          <div className="flex min-w-0 flex-col gap-[18px]">
            <ul data-testid={`${H}-lista`} className="m-0 flex list-disc flex-col gap-2 pl-5 font-sn-texto text-sn-cuerpo font-light text-sn-ink">
              {CARACTERISTICAS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <Reconocimientos variante="chinampas" base={`${H}-reconocimientos`} testIdPanel={`${H}-reconocimientos`} />
          </div>
          <Foto
            testId={`${H}-foto`}
            src="/images/home/chinampas_xochimilco.png"
            alt="Chinampas de Xochimilco"
            proporcion="4/5"
            redondeo="tarjeta"
            sizes="(min-width: 861px) 50vw, 100vw"
          />
        </div>
      </Contenedor>
    </Seccion>
  )
}
