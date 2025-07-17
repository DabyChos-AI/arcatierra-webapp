import { Metadata } from 'next'
import BaldioReservationForm from '@/components/baldio/BaldioReservationForm'

export const metadata: Metadata = {
  title: 'Reservas | Baldío Restaurante | Arca Tierra',
  description: 'Reserva tu mesa en Baldío, nuestro restaurante con estrella Michelin. Vive una experiencia gastronómica única.',
  openGraph: {
    title: 'Reservas | Baldío Restaurante | Arca Tierra',
    description: 'Reserva tu mesa en Baldío, nuestro restaurante con estrella Michelin. Vive una experiencia gastronómica única.',
    images: [
      {
        url: '/images/baldio/exterior_logo_baldio.jpg',
        width: 1200,
        height: 630,
        alt: 'Reservas en Baldío Restaurante',
      },
    ],
  },
}

export default function BaldioReservationsPage() {
  return (
    <main className="min-h-screen">
      <div className="py-28 px-4 bg-[#3A4741] text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Reservaciones</h1>
          <p className="text-xl text-[#E3DBCB] max-w-2xl mx-auto">
            Asegura tu lugar en Baldío y prepárate para una experiencia gastronómica única
          </p>
        </div>
      </div>
      <BaldioReservationForm />
    </main>
  )
}
