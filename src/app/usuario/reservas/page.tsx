'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * HDR2 (R7, decisión de David): sin cuenta demo ni reservas inventadas. Las reservas de experiencias le llegan al
 * cliente por correo; esta página lo dice y deja el contacto del equipo de Experiencias (el mismo de
 * `app/experiencias/[slug]/page.tsx`). Cuando exista el endpoint de «mis reservas», se pintan aquí.
 */
const CORREO_EXPERIENCIAS = 'info@arcatierra.com'

export default function ReservasPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verde-principal mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        </div>

        <div data-testid="reservas-por-correo" className="bg-white rounded-lg shadow p-8 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Tus reservas de experiencias te llegan por correo</h2>
          <p className="text-gray-600 mb-3">
            Cuando reservas una experiencia te mandamos la confirmación y todos los detalles a tu correo. Muy pronto
            también podrás verlas aquí.
          </p>
          <p className="text-gray-600 mb-6">
            ¿Dudas o cambios? Escríbele al equipo de Experiencias:{' '}
            <a
              href={`mailto:${CORREO_EXPERIENCIAS}`}
              data-testid="reservas-contacto"
              className="text-verde-principal underline"
            >
              {CORREO_EXPERIENCIAS}
            </a>
          </p>
          <Link href="/experiencias">
            <Button className="bg-verde-principal text-white hover:bg-verde-oscuro">Explorar Experiencias</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
