import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();

    // Sobreescribir email con el de la sesión para evitar falsificación
    body.email = session.user.email;

    // CONS1 (R11): el log no lleva el cuerpo (trae el correo) ni la respuesta
    console.log('🛒 Recibiendo petición de carrito');

    // Llamar al backend interno
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if ((session as any).accessToken) {
      headers['Authorization'] = `Bearer ${(session as any).accessToken}`;
    }

    const response = await fetch('http://arca-api:8000/api/cart/add', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log('✅ Respuesta del backend:', response.status);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error en proxy cart/add:', error);
    return NextResponse.json(
      { error: 'Error al agregar al carrito' },
      { status: 500 }
    );
  }
}
