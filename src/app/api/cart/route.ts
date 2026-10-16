import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const email = session.user.email;

    // CONS1 (R11): el log no lleva el correo ni el carrito
    console.log('📦 Obteniendo carrito');

    // Llamar al backend interno
    const headers: Record<string, string> = {};
    if ((session as any).accessToken) {
      headers['Authorization'] = `Bearer ${(session as any).accessToken}`;
    }

    const response = await fetch(`http://arca-api:8000/api/cart/?email=${encodeURIComponent(email)}`, {
      headers,
    });
    const data = await response.json();

    console.log('✅ Carrito obtenido:', response.status);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error obteniendo carrito:', error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
