// R15 v2 · F2 (sesión 59): bloque 3 de la portada, las tres puertas de la tienda (maqueta `.banner-3p-v7`). Contrato v2 §9-F2 D-F2-08, D-F2-09.
// Originales (DR-17), cada uno con su fuente en cadena-v2/f2/arriba-F2.md §3:
// - Eyebrow: el nombre del menú de la tienda (armazon/enlaces.ts). Título y texto: la sección de canastas de la portada de hoy
//   (src/app/page.tsx:120 y :123-125).
// - 01 «Compra suelto» (como lo llama el Word P5; D-F2-09 P-5): su texto no existe (marca, C41) y su «desde» tampoco se pinta: el mínimo de
//   hoy es un dato con defecto (huevo $7.60 «KGM», D-2) → marca a David (pregunta C50). Sin llamada a /api/products.
// - 02 «Canasta lista» (DR-15): texto de /suscripciones de hoy (src/app/suscripciones/page.tsx:367); precio de la API con su envío
//   (PrecioCanastaLista); «Más popular» no tiene dato de ventas → marca (C23) con el estilo destacado de la maqueta (ilustración en terra).
// - 03 «Agrega extras a tu canasta» (C12): su texto no existe (marca, C41); sin precio (DR-12).
// - Las 3 ilustraciones no existen (C26): marca a la diseñadora. Metas: solo el número de la puerta (D-F2-09 P-6).
// - Destinos (D-F2-09 P-7): las páginas de hoy que hacen eso (F3 los cambia a sus pestañas).
// Diseño medido en la maqueta: fondo warm, 96 px, filetes; cabeza en dos columnas desde 861 px; tarjetas blancas que son ligas, radio 14,
// caja 16/9 de color, nombre DM Serif terra, texto al 70 %, pie con filete. Componente de servidor (el precio es una isla de cliente).
import Falta from '@/components/sitio-nuevo/Falta'
import { ligasDe } from '@/components/sitio-nuevo/armazon/enlaces'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import PrecioCanastaLista from './PrecioCanastaLista'

const ID_TITULO = 'sn-portada-puertas-encabezado'

type Puerta = {
  numero: '01' | '02' | '03'
  href: string
  nombre: string
  /** Color de la caja de la ilustración (maqueta: blue, terra en la destacada, peach). */
  caja: string
  ilustracion: string
  /** El texto de hoy (`de`) o, si no existe, lo que dice su marca (`falta`). */
  texto: { de: string } | { falta: string }
}

const PUERTAS: readonly Puerta[] = [
  {
    numero: '01',
    href: '/tienda',
    nombre: 'Compra suelto',
    caja: 'bg-sn-blue',
    ilustracion: 'ilustración de la puerta de compra suelta',
    texto: { falta: 'texto de la puerta de compra suelta' },
  },
  {
    numero: '02',
    href: '/suscripciones',
    nombre: 'Canasta lista',
    caja: 'bg-sn-terra',
    ilustracion: 'ilustración de la puerta de la canasta lista',
    texto: { de: 'Recibe alimentos frescos y deliciosos directamente de nuestra red agrícola cada semana' },
  },
  {
    numero: '03',
    href: '/tienda',
    nombre: 'Agrega extras a tu canasta',
    caja: 'bg-sn-peach',
    ilustracion: 'ilustración de la puerta de los extras con la canasta',
    texto: { falta: 'texto de la puerta de extras' },
  },
]

export default function TresPuertas() {
  const eyebrow = ligasDe('cabecera').find((liga) => liga.href === '/tienda')?.texto
  return (
    <Seccion testId="sn-portada-puertas" fondo="warm" espacio="grande" borde="ambos" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <div className="mb-8 grid grid-cols-1 gap-3.5 min-[861px]:mb-12 min-[861px]:grid-cols-[1.2fr_1fr] min-[861px]:items-end min-[861px]:gap-16">
          <div>
            {eyebrow && (
              <Etiqueta tamano="eyebrow" tono="terra" className="mb-4">
                {eyebrow}
              </Etiqueta>
            )}
            <Titulo nivel={2} tamano="h2" tono="terra" id={ID_TITULO} testId="sn-portada-puertas-titulo">
              Tu despensa agroecológica, sin complicaciones
            </Titulo>
          </div>
          <Texto tono="ink-suave" className="max-w-[380px]">
            Suscríbete y recibe cada semana o cada dos semanas todo lo que necesitas: frutas y verduras frescas, tortillas, queso, huevo,
            proteína y más alimentos del campo. Deja que la tierra te organice el menú.
          </Texto>
        </div>

        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[861px]:grid-cols-3 min-[861px]:gap-[18px]">
          {PUERTAS.map((puerta) => (
            <li key={puerta.numero} data-testid="sn-portada-puertas-puerta" data-puerta={puerta.numero}>
              <Tarjeta as="article" href={puerta.href} className="h-full">
                <div className="flex h-full flex-col">
                  <div className={`flex aspect-video items-center justify-center p-4 ${puerta.caja}`}>
                    <Foto falta={{ que: puerta.ilustracion, quien: 'Diseñadora' }} testId="sn-portada-puertas-ilustracion" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 px-[26px] pb-[26px] pt-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <Etiqueta tamano="etiqueta" tono="terra" as="span">
                        {puerta.numero}
                      </Etiqueta>
                      {puerta.numero === '02' && (
                        <span className="font-sn-texto text-sn-cuerpo-xs">
                          <Falta que="si la canasta lista es la más popular" quien="Lucio y Pablo" />
                        </span>
                      )}
                    </div>
                    <Titulo nivel={3} tamano="h3" tono="terra">
                      {puerta.nombre}
                    </Titulo>
                    {'de' in puerta.texto ? (
                      <Texto tamano="chico" peso="normal" tono="ink-suave">
                        {puerta.texto.de}
                      </Texto>
                    ) : (
                      <p className="m-0 font-sn-texto text-sn-cuerpo-xs">
                        <Falta que={puerta.texto.falta} quien="Lucio y Pablo" />
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-solid border-sn-border pt-4">
                      {puerta.numero === '01' && (
                        <p className="m-0 font-sn-texto text-sn-cuerpo-xs">
                          <Falta que="precio «desde» de la compra suelta" quien="David" />
                        </p>
                      )}
                      {puerta.numero === '02' && <PrecioCanastaLista />}
                      <span aria-hidden="true" className="ml-auto font-sn-mono text-[18px] font-medium text-sn-terra">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      </Contenedor>
    </Seccion>
  )
}
