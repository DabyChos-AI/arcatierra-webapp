import type { Metadata } from 'next'
import ComoSumarte from '@/components/sitio-nuevo/historia/ComoSumarte'
import CuatroCaminos from '@/components/sitio-nuevo/historia/CuatroCaminos'
import EquipoNosotros from '@/components/sitio-nuevo/historia/EquipoNosotros'
import HeroeNosotros from '@/components/sitio-nuevo/historia/HeroeNosotros'
import HistoriaNosotros from '@/components/sitio-nuevo/historia/HistoriaNosotros'
import MisionVision from '@/components/sitio-nuevo/historia/MisionVision'
import ReconocimientosNosotros from '@/components/sitio-nuevo/historia/ReconocimientosNosotros'
import Valores from '@/components/sitio-nuevo/historia/Valores'
import { METADATA_NOSOTROS } from '@/components/sitio-nuevo/google/metadatos'

// R15 v2 · F5 (historia, sesión 63): `/nosotros` del sitio nuevo, la página `data-page="nosotros"` de la maqueta, con los textos de
// src/app/nosotros/page.tsx (que sigue igual: apagado responde como hoy). Entra invisible: su dirección la agrega historia al final
// (D-F5-03). Orden de la maqueta con lo de hoy que pasa (D-F5-13 P-5): «Nuestra Misión»/«Nuestra Visión» después del héroe y «Nuestros
// Valores» después de la historia. Estática, sin datos de la API (D-F5-04). Título = el nombre del menú (D-F5-13 P-14).
export const metadata: Metadata = METADATA_NOSOTROS

export default function Page() {
  return (
    <main data-testid="sn-nosotros">
      <HeroeNosotros />
      <MisionVision />
      <HistoriaNosotros />
      <Valores />
      <CuatroCaminos />
      <EquipoNosotros />
      <ReconocimientosNosotros />
      {/* «Cómo te puedes sumar»: lo de hoy para lo mismo (src/app/nosotros/page.tsx:281, :283-284); botones en el orden de la maqueta con
          las etiquetas de hoy para esos destinos (src/app/xochimilco/page.tsx:365 → /experiencias; nosotros/page.tsx:291 → /tienda).
          «Conocer Chinampas» (:293-300) está oculto hoy «por solicitud» y no se pinta (D-F5-13 P-3). */}
      <ComoSumarte
        base="sn-nosotros-sumarte"
        titulo="Únete a Nuestra Misión"
        texto="Forma parte de la red de agricultura regenerativa más importante de México. Cada compra que haces apoya directamente a las familias campesinas."
        ligas={[
          { texto: 'Vivir la Experiencia', href: '/experiencias', testId: 'sn-nosotros-sumarte-experiencias' },
          { texto: 'Comprar Productos', href: '/tienda', testId: 'sn-nosotros-sumarte-tienda' },
        ]}
      />
    </main>
  )
}
