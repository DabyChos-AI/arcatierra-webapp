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
      // R11b (MANP1, §9 C10): también la caché y el «no indexar» del backend (manuales: private, max-age=300 · noindex).
      const reenviadas: Record<string, string> = {}
      for (const [cabecera, nombre] of [
        ['content-disposition', 'Content-Disposition'],
        ['cache-control', 'Cache-Control'],
        ['x-robots-tag', 'X-Robots-Tag'],
      ] as const) {
        const valor = backendRes.headers.get(cabecera)
        if (valor) reenviadas[nombre] = valor
      }
      return new NextResponse(blob, {
        status: backendRes.status,
        headers: { 'Content-Type': resContentType, ...reenviadas },
      })
    }

    // R11b (§9 C10): un error que no es JSON (p. ej. HTML o texto de un 404/502) sale con el status del backend y un
    // `{detail}` genérico; antes `json()` reventaba y la pantalla veía 500 «Error interno del proxy».
    if (!backendRes.ok && !resContentType.includes('application/json')) {
      return NextResponse.json(
        { detail: `El servidor respondió con error ${backendRes.status}.` },
        { status: backendRes.status }
      )
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
