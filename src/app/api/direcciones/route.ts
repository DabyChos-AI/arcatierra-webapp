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
      // Si no hay token, devolver array vacío (sin direcciones)
      return NextResponse.json([])
    }

    const response = await fetch(`${API_URL}/api/direcciones/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      // Si no existen direcciones, devolver array vacío
      return NextResponse.json([])
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching direcciones:', error)
    // Fallback a array vacío en caso de error
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Obtener JWT token de la sesión
    const token = (session as any).accessToken
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no disponible' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/api/direcciones/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Error creando dirección')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating direccion:', error)
    return NextResponse.json(
      { error: 'Error creando dirección' },
      { status: 500 }
    )
  }
}
