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

    console.log('📦 Obteniendo carrito para:', email);

    // Llamar al backend interno
    const headers: Record<string, string> = {};
    if ((session as any).accessToken) {
      headers['Authorization'] = `Bearer ${(session as any).accessToken}`;
    }

    const response = await fetch(`http://arca-api:8000/api/cart/?email=${encodeURIComponent(email)}`, {
      headers,
    });
    const data = await response.json();

    console.log('✅ Carrito obtenido:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error obteniendo carrito:', error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
