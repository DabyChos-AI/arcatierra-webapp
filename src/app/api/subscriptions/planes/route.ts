import { NextResponse } from 'next/server'

export async function GET() {
  const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://arca-api:8000'
  
  try {
    const response = await fetch(`${INTERNAL_API_URL}/api/subscriptions/planes`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching planes:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo planes' },
      { status: 500 }
    )
  }
}
