// R15 v2 · F4 (eventos): venta cruzada a catering (maqueta `.cross-sell`: caja cream de 1200, radio 18, relleno 48; título serif 40; botón
// terra recto a la derecha). Contrato v2 D-F4-07 P-20: la venta cruzada de hoy de /experiencias a catering, sin marcas (equivale a la de la
// maqueta): «Catering» = menú (`armazon/enlaces.ts:33`); título, texto y botón de `src/app/experiencias/page.tsx:565-570, :603-604`.
// En cream el eyebrow va en ink (terra da 4.13, CONTRATO-BASE-F1 §2.2). Componente de servidor.
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const K = 'sn-eventos-catering'

export default function CateringEventos() {
  return (
    <Seccion testId={K} espacio="normal" etiquetadaPor={`${K}-titulo`}>
      <Contenedor ancho="medio">
        <div className="flex flex-col gap-8 rounded-sn-panel bg-sn-cream p-7 min-[861px]:flex-row min-[861px]:items-center min-[861px]:justify-between min-[861px]:gap-10 min-[861px]:p-12">
          <div className="flex min-w-0 flex-col gap-4">
            <Etiqueta tamano="eyebrow" tono="ink" testId={`${K}-etiqueta`}>
              Catering
            </Etiqueta>
            <Titulo nivel={2} tamano="h3" id={`${K}-titulo`} testId={`${K}-titulo`}>
              ¿Quieres una experiencia fuera de las chinampas?
            </Titulo>
            <Texto testId={`${K}-texto`} tamano="chico" className="max-w-[460px]">
              Llevamos nuestras experiencias gastronómicas a tu evento especial
            </Texto>
          </div>
          <div className="shrink-0">
            <Boton href="/catering" forma="recta" sobreCrema flecha testId={`${K}-boton`}>
              Conocer Catering
            </Boton>
          </div>
        </div>
      </Contenedor>
    </Seccion>
  )
}
