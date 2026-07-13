import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET() {
  // Leer en runtime, no en build time
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://arca-api:8000'
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener JWT token de la sesión
    const token = (session as any).accessToken
    
    if (!token) {
      // Si no hay token, devolver datos básicos de la sesión
      return NextResponse.json({
        nombre: session.user?.name || '',
        email: session.user?.email || '',
        telefono: '',
        direccion_principal: ''
      })
    }

    // Llamar al backend para obtener datos completos del usuario
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    console.log('[GET /api/auth/me] Response backend status:', response.status)

    if (!response.ok) {
      console.error('Error obteniendo datos del usuario:', response.status)
      // Fallback a datos básicos de sesión
      return NextResponse.json({
        nombre: session.user?.name || '',
        email: session.user?.email || '',
        telefono: '',
        direccion_principal: ''
      })
    }

    const userData = await response.json()
    
    // Obtener dirección principal del usuario
    let direccionPrincipal = null
    try {
      const direccionResponse = await fetch(`${API_URL}/api/direcciones/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (direccionResponse.ok) {
        const direcciones = await direccionResponse.json()
        // Encontrar la dirección principal
        direccionPrincipal = direcciones.find((d: any) => d.es_principal) || direcciones[0] || null
      }
    } catch (err) {
      console.error('Error obteniendo dirección:', err)
    }
    
    return NextResponse.json({
      ...userData,
      direccion_estructurada: direccionPrincipal
    })
    
  } catch (error) {
    console.error('Error en /api/auth/me:', error)
    return NextResponse.json(
      { error: 'Error obteniendo datos del usuario' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  // Leer en runtime, no en build time
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://arca-api:8000'
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const token = (session as any).accessToken
    
    if (!token) {
      return NextResponse.json(
        { error: 'No hay token de autenticación' },
        { status: 401 }
      )
    }

    // Obtener body del request
    const body = await request.json()

    // Llamar al backend para actualizar perfil
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error actualizando perfil:', response.status, errorText)
      return NextResponse.json(
        { error: errorText || 'Error actualizando perfil' },
        { status: response.status }
      )
    }

    const userData = await response.json()
    return NextResponse.json(userData)
    
  } catch (error) {
    console.error('Error en PATCH /api/auth/me:', error)
    return NextResponse.json(
      { error: 'Error actualizando datos del usuario' },
      { status: 500 }
    )
  }
}
