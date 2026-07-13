import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.INTERNAL_API_URL || 'http://arca-api:8000'

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const backendPath = `/api/zonas-entrega/${path.join('/')}`
    const url = new URL(req.url)
    const qs = url.search

    const backendRes = await fetch(`${API_URL}${backendPath}${qs}`, {
      method: req.method,
    })

    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })
  } catch (error) {
    console.error('[zonas-entrega-proxy] Error:', error)
    return NextResponse.json(
      { detail: 'Error interno del proxy' },
      { status: 500 }
    )
  }
}

export const GET = handler
