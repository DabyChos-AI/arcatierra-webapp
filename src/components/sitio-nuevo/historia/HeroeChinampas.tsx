// R15 v2 · F5 (historia): héroe de /chinampas (maqueta `data-page="chinampas"` [0]: migas, foto grande, título y dos párrafos). Contrato v2
// §9-F5 D-F5-13; cadena-v2/f5/historia-F5.md §2.0. Componente de servidor, sin datos de la API.
// - Migas: «Inicio» y «Chinampas», el nombre de la liga del menú (armazon/enlaces.ts, C20/C49), con la etiqueta de control de F3 (C24).
// - Foto: la de hoy con su alt de hoy (src/app/components/HomePage.tsx:11-12; D-F5-13 P-6).
// - `h1`: «Chinampas de Xochimilco», el de hoy de /xochimilco (src/app/xochimilco/page.tsx:36; D-F2-08 a).
// - Los dos párrafos de «¿Qué son las Chinampas?» de hoy, letra por letra (xochimilco/page.tsx:62-64, :66-69); «1,000» en la lista corta
//   (D-F5-13 P-1 a). Los de la maqueta son genéricos (DR-17).
// Medido en la maqueta (f5-historia/maqueta/medidas): cream, 80/40, borde abajo; columna de 1100; migas a 24; foto 21:9 desde 861 px (16:9 en el
// celular: `ui/Foto` no trae 21:9), radio 18, 48 abajo; título 6vw (`hero-xl`), 32 abajo; párrafos de 17 px ligera, 680 de ancho, 18 entre ellos.
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Migas from '@/components/sitio-nuevo/ui/Migas'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-chinampas-heroe'

export default function HeroeChinampas() {
  return (
    <Seccion testId={H} fondo="cream" espacio="normal" borde="abajo" etiquetadaPor={`${H}-titulo`}>
      <Contenedor ancho="angosto">
        <Migas
          testId={`${H}-migas`}
          etiqueta="Ruta de navegación"
          items={[{ texto: 'Inicio', href: '/' }, { texto: 'Chinampas' }]}
          sobreCrema
          className="mb-6"
        />
        <Foto
          testId={`${H}-foto`}
          src="/images/nosotros/amanecer_chinampas_xochimilco.JPG"
          alt="Amanecer en las chinampas de Xochimilco"
          proporcion="16/9"
          redondeo="panel"
          sizes="(min-width: 1180px) 1100px, 100vw"
          prioridad
          className="mb-12 min-[861px]:aspect-[21/9]"
        />
        <Titulo nivel={1} tamano="hero-xl" id={`${H}-titulo`} testId={`${H}-titulo`} className="mb-8">
          Chinampas de Xochimilco
        </Titulo>
        <div data-testid={`${H}-texto`} className="flex max-w-[680px] flex-col gap-[18px]">
          <Texto tamano="grande">
            Las chinampas son islas artificiales construidas sobre los lagos de Xochimilco, creadas por los pueblos originarios hace más
            de 1,000 años. Este ingenioso sistema agrícola convierte zonas lacustres en tierras altamente productivas.
          </Texto>
          <Texto tamano="grande">
            Cada chinampa es una parcela rectangular de tierra fértil, rodeada de canales que proporcionan agua constante y permiten el
            transporte en trajineras. El sistema combina agricultura, acuacultura y manejo forestal de manera sustentable.
          </Texto>
        </div>
      </Contenedor>
    </Seccion>
  )
}
