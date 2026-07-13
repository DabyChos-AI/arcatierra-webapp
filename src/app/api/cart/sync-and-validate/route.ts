import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://arca-api:8000';

async function getGuestToken(email: string, nombre?: string, apellidos?: string, telefono?: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/guest-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nombre, apellidos, telefono }),
    });
    if (!response.ok) {
      console.error('Guest token failed:', response.status, await response.text());
      return null;
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error obteniendo guest token:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    let bearerToken: string | null = null;
    let userEmail: string;

    if (session?.user?.email) {
      // Usuario logueado: usa su token de sesion
      bearerToken = (session as any).accessToken || null;
      userEmail = session.user.email;
      body.email = userEmail; // anti-IDOR
    } else {
      // Guest checkout: requiere email en body, obtiene token temporal
      if (!body.email || typeof body.email !== 'string') {
        return NextResponse.json(
          { error: 'Email requerido para checkout' },
          { status: 400 }
        );
      }
      userEmail = body.email;
      bearerToken = await getGuestToken(
        userEmail,
        body.nombre,
        body.apellidos,
        body.telefono
      );
      if (!bearerToken) {
        return NextResponse.json(
          { error: 'Este email tiene cuenta registrada. Inicia sesion para continuar.' },
          { status: 409 }
        );
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/cart/sync-and-validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend cart/sync-and-validate error:', response.status, data);
      return NextResponse.json(data, { status: response.status });
    }

    // Si fue guest checkout, retornar el token al frontend para reusarlo en crear-preferencia-pago
    if (!session) {
      data._guest_token = bearerToken;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy cart/sync-and-validate:', error);
    return NextResponse.json(
      { error: 'Error sincronizando carrito' },
      { status: 500 }
    );
  }
}
