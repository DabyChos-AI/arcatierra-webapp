import { Metadata } from 'next'
import BaldioTeam from '@/components/baldio/BaldioTeam'
import BaldioCallToAction from '@/components/baldio/BaldioCallToAction'

export const metadata: Metadata = {
  title: 'Equipo | Baldío Restaurante | Arca Tierra',
  description: 'Conoce al talentoso equipo detrás de Baldío, nuestro restaurante con estrella Michelin, y su filosofía de trabajo.',
  openGraph: {
    title: 'Equipo | Baldío Restaurante | Arca Tierra',
    description: 'Conoce al talentoso equipo detrás de Baldío, nuestro restaurante con estrella Michelin, y su filosofía de trabajo.',
    images: [
      {
        url: '/images/baldio/equipo_trabajando.jpg',
        width: 1200,
        height: 630,
        alt: 'Equipo de Baldío Restaurante',
      },
    ],
  },
}

export default function BaldioTeamPage() {
  return (
    <main className="min-h-screen">
      <div className="py-28 px-4 bg-[#3A4741] text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Nuestro Equipo</h1>
          <p className="text-xl text-[#E3DBCB] max-w-2xl mx-auto">
            Conoce a las personas apasionadas que hacen posible la experiencia Baldío cada día
          </p>
        </div>
      </div>
      <BaldioTeam />
      <BaldioCallToAction />
    </main>
  )
}
