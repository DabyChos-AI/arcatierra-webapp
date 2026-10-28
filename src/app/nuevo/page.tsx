import type { Metadata } from 'next'
import { connection } from 'next/server'
import Cinta from '@/components/sitio-nuevo/Cinta'
import Frase from '@/components/sitio-nuevo/portada/Frase'
import Hero from '@/components/sitio-nuevo/portada/Hero'
import Puertas from '@/components/sitio-nuevo/portada/Puertas'
import Experiencias from '@/components/sitio-nuevo/portada/Experiencias'
import Super from '@/components/sitio-nuevo/portada/Super'
import Restaurantes from '@/components/sitio-nuevo/portada/Restaurantes'
import Chinampa from '@/components/sitio-nuevo/portada/Chinampa'
import EventosCatering from '@/components/sitio-nuevo/portada/EventosCatering'
import Manifiesto from '@/components/sitio-nuevo/portada/Manifiesto'
import Prensa from '@/components/sitio-nuevo/portada/Prensa'
import Instagram from '@/components/sitio-nuevo/portada/Instagram'
import {
  leerContenidoSitio,
  leerExperienciasMuestra,
  leerPrecioMinimoCanasta,
  leerPrecioMinimoSuelto,
  leerProductosMuestra,
} from '@/lib/sitio-nuevo-contenido'

// R15 · F2 (WF2, sesión 55, 28-oct-2026): la portada del sitio nuevo, en la dirección `/` del link de revisión
// (RUTAS_SITIO_NUEVO). Reemplaza la página de muestra de F0–F1. Las 11 secciones en el orden REAL de la maqueta
// (INVENTARIO-MAQUETA §1): 0 frase · 1 hero · 2 cinta · 3 puertas · 4 experiencias · 5 súper · 6 restaurantes · 7 chinampa ·
// 8 eventos y catering · 9 manifiesto · 10 prensa · 11 Instagram.
//
// Todo dato sale del servidor (API interna, src/lib/sitio-nuevo-contenido.ts): precios, productos, canastas y experiencias de la
// base; cinta, cifras, prensa, Instagram y textos del hero de contenido_sitio. Lo que falta lleva <Falta> y si la API no responde
// la sección lo dice: nunca un dato de la maqueta. Nada visible depende de usePathname (0 errores de hidratación).

export const metadata: Metadata = {
  title: { absolute: 'Arca Tierra · Comida honesta del campo mexicano' },
  description:
    'Canastas y productos de la chinampa a tu puerta, experiencias en Xochimilco, eventos privados y catering. Arca Tierra.',
}

export default async function Portada() {
  await connection()
  const [{ contenido }, productos, experiencias, desdeSuelto, desdeCanasta] = await Promise.all([
    leerContenidoSitio(),
    leerProductosMuestra(4),
    leerExperienciasMuestra(8),
    leerPrecioMinimoSuelto(),
    leerPrecioMinimoCanasta(),
  ])

  return (
    <main data-testid="sn-portada" className="overflow-x-clip">
      <Frase tagline={contenido.portada.tagline} cifras={contenido.cifras} />
      <Hero portada={contenido.portada} />
      <div data-testid="sn-portada-cinta">
        <Cinta elementos={contenido.cinta} />
      </div>
      <Puertas desdeSuelto={desdeSuelto} desdeCanasta={desdeCanasta} />
      <Experiencias experiencias={experiencias} />
      <Super productos={productos} />
      <Restaurantes />
      <Chinampa cifras={contenido.cifras} />
      <EventosCatering />
      <Manifiesto cifras={contenido.cifras} />
      <Prensa prensa={contenido.prensa} />
      <Instagram fotos={contenido.instagram} />
    </main>
  )
}
