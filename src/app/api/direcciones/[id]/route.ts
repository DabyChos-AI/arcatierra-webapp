import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { API_URL } from '@/lib/api'

/**
 * C7 (R7): un 4xx del backend se reenvía con SU status y su `detail` cuando es texto para el cliente (p. ej. DIR2:
 * «No entregamos en el código postal …»); si el `detail` no es texto (422 de validación) va el genérico con ese status.
 * Un 5xx sigue genérico y en 500, sin detalles internos.
 */
async function respuestaDeErrorBackend(response: Response, generico: string): Promise<NextResponse> {
  if (response.status >= 400 && response.status < 500) {
    let detail: unknown = null
    try {
      const cuerpo: unknown = await response.json()
      if (cuerpo && typeof cuerpo === 'object' && 'detail' in cuerpo) detail = (cuerpo as { detail: unknown }).detail
    } catch {
      // cuerpo vacío o no JSON: va el genérico
    }
    const texto = typeof detail === 'string' && detail.trim() ? detail : generico
    return NextResponse.json({ detail: texto, error: texto }, { status: response.status })
  }
  console.error(`${generico}: backend respondió`, response.status)
  return NextResponse.json({ error: generico }, { status: 500 })
}

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
      return respuestaDeErrorBackend(response, 'Error actualizando dirección')
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
