import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    // Validar datos requeridos
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email y contraseña son requeridos' },
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

    // En un entorno de producción, aquí verificarías el token contra una base de datos
    // Por ahora, validamos que el token tenga el formato correcto
    if (!token.startsWith('ACC-') || token.length < 20) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Preparar datos para enviar a n8n (sistema de usuarios)
    const userData = {
      type: 'create_user_account',
      email,
      password_hash: hashedPassword,
      token,
      created_from: 'guest_checkout',
      timestamp: new Date().toISOString(),
    }

    // Enviar a n8n para crear usuario
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nUrl) {
      return NextResponse.json(
        { error: 'Configuración de sistema no disponible' },
        { status: 500 }
      )
    }

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!n8nResponse.ok) {
      // Si el usuario ya existe, retornar mensaje específico
      if (n8nResponse.status === 409) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 409 }
        )
      }
      throw new Error(`Error en sistema: ${n8nResponse.status}`)
    }

    const result = await n8nResponse.json()

    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente',
      user_id: result.user_id,
    })

  } catch (error) {
    console.error('Error creando cuenta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
