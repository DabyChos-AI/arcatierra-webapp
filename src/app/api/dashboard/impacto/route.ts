import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { API_URL } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener JWT token de la sesión si existe
    const token = (session as any).accessToken
    
    if (!token) {
      console.error('No hay token JWT en la sesión')
      return NextResponse.json(
        { error: 'Token no disponible' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/api/dashboard/usuario/impacto`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error del backend:', response.status, errorText)
      throw new Error('Error del backend')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching dashboard impacto:', error)
    return NextResponse.json(
      { error: 'Error cargando impacto' },
      { status: 500 }
    )
  }
}
