import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://arca-api:8000'

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Debes iniciar sesion para crear una suscripcion' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Sobreescribir email con el de la sesion para evitar IDOR
    body.email = session.user.email

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if ((session as any).accessToken) {
      headers['Authorization'] = `Bearer ${(session as any).accessToken}`
    }

    const response = await fetch(`${INTERNAL_API_URL}/api/subscriptions/crear`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || 'Error en el servidor' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en proxy de suscripciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
