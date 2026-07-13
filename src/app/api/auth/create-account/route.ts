import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/lib/api'

/**
 * Proxy a FastAPI para registro de usuarios
 * 
 * ACTUALIZADO: Ya no usa n8n, ahora guarda directo en BD via FastAPI
 */
export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    // Validar datos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Validar contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Enviar a FastAPI backend
    const backendUrl = API_URL
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        nombre: email.split('@')[0], // Nombre temporal del email
        apellidos: '',
        telefono: '',
        nombre_completo: email.split('@')[0]
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      // Si el usuario ya existe
      if (response.status === 400 && result.detail?.includes('ya está registrado')) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: result.detail || 'Error creando la cuenta' },
        { status: response.status }
      )
    }

    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente',
      user_id: result.user_id,
      access_token: result.access_token
    })

  } catch (error) {
    console.error('Error creando cuenta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
