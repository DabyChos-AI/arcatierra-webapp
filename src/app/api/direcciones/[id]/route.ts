import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { API_URL } from '@/lib/api'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const params = await context.params
    const body = await req.json()
    const token = (session as any).accessToken
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no disponible' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/api/direcciones/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error actualizando dirección:', response.status, errorText)
      throw new Error('Error actualizando dirección')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating direccion:', error)
    return NextResponse.json(
      { error: 'Error actualizando dirección' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const params = await context.params
    const token = (session as any).accessToken
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no disponible' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/api/direcciones/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error eliminando dirección:', response.status, errorText)
      throw new Error('Error eliminando dirección')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting direccion:', error)
    return NextResponse.json(
      { error: 'Error eliminando dirección' },
      { status: 500 }
    )
  }
}
