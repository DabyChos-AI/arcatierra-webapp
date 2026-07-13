import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

const API_URL = process.env.INTERNAL_API_URL || 'http://arca-api:8000'

/**
 * Proxy genérico server-side para endpoints admin.
 * Extrae el JWT de la sesión NextAuth y lo reenvía al backend.
 */
export async function adminProxy(
  req: NextRequest,
  backendPath: string
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { detail: 'No autorizado — inicia sesión' },
        { status: 401 }
      )
    }

    // Preservar query string del request original
    const url = new URL(req.url)
    const qs = url.search // incluye el '?' si existe

    const backendUrl = `${API_URL}${backendPath}${qs}`

    // Construir headers para el backend
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.accessToken}`,
    }

    // Propagar Content-Type si existe (para POST/PUT/PATCH con body)
    const contentType = req.headers.get('content-type')
    if (contentType) {
      headers['Content-Type'] = contentType
    }

    // Leer body solo para métodos que lo usan
    let body: BodyInit | undefined
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      body = await req.arrayBuffer().then((buf) =>
        buf.byteLength > 0 ? Buffer.from(buf) : undefined
      )
    }

    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
    })

    // Si la respuesta es un archivo (CSV, PDF, etc.), retornar como blob
    const resContentType = backendRes.headers.get('content-type') || ''
    if (
      !resContentType.includes('application/json') &&
      backendRes.ok
    ) {
      const blob = await backendRes.arrayBuffer()
      return new NextResponse(blob, {
        status: backendRes.status,
        headers: {
          'Content-Type': resContentType,
          ...(backendRes.headers.get('content-disposition')
            ? { 'Content-Disposition': backendRes.headers.get('content-disposition')! }
            : {}),
        },
      })
    }

    // Respuesta JSON normal
    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })
  } catch (error) {
    console.error(`[admin-proxy] Error en ${backendPath}:`, error)
    return NextResponse.json(
      { detail: 'Error interno del proxy' },
      { status: 500 }
    )
  }
}
