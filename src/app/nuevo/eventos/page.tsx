import type { Metadata } from 'next'
import HeroeEventos from '@/components/sitio-nuevo/eventos/HeroeEventos'
import TiposEvento from '@/components/sitio-nuevo/eventos/TiposEvento'
import GaleriaEventos from '@/components/sitio-nuevo/eventos/GaleriaEventos'
import ProcesoEventos from '@/components/sitio-nuevo/eventos/ProcesoEventos'
import PrivadasYSolicitud from '@/components/sitio-nuevo/eventos/PrivadasYSolicitud'
import CateringEventos from '@/components/sitio-nuevo/eventos/CateringEventos'

// R15 v2 · F4 (eventos, sesión 62): `/eventos` del sitio nuevo, la página `data-page="eventos"` de la maqueta (hoy no existe: sigue 404 en
// producción). Entra invisible: su dirección la agrega experiencias al final (D-F4-03). Orden de la maqueta con las privadas entre el proceso
// y el formulario (C39, D-F4-07 P-7). Estática: las privadas y la solicitud van en el navegador (D-F4-04). Título «Eventos privados» (P-19).
export const metadata: Metadata = { title: 'Eventos privados' }

export default function Page() {
  return (
    <main data-testid="sn-eventos">
      <HeroeEventos />
      <TiposEvento />
      <GaleriaEventos />
      <ProcesoEventos />
      <PrivadasYSolicitud />
      <CateringEventos />
    </main>
  )
}
