import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { cabecerasDelCliente } from '@/lib/ip-cliente';

const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://arca-api:8000';

const ERROR_GENERICO = 'No pudimos crear tu pago. Intenta de nuevo.';

/** Token de invitado, o el status y el `detail` REALES de /auth/guest-token (429, 403 del equipo, 409 con cuenta…). */
type TokenInvitado = { token: string } | { status: number; detail: unknown };

async function getGuestToken(origen: Headers, email: string, nombre?: string, apellidos?: string, telefono?: string): Promise<TokenInvitado> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/guest-token`, {
      method: 'POST',
      // guest-token tiene límite de 5/min: debe contar por cliente, no por servidor (A13)
      headers: { 'Content-Type': 'application/json', ...cabecerasDelCliente(origen) },
      body: JSON.stringify({ email, nombre, apellidos, telefono }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.access_token) {
      console.error('Guest token failed:', response.status);
      return { status: response.ok ? 502 : response.status, detail: data?.detail ?? ERROR_GENERICO };
    }
    return { token: data.access_token };
  } catch (error) {
    console.error('Error obteniendo guest token:', error);
    return { status: 502, detail: ERROR_GENERICO };
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Mismo corte que en /api/cart/sync-and-validate: sesion viva sin token =
    // renovacion fallida. Aqui importa aun mas, porque es el paso del pago.
    if (session?.user?.email && !(session as any).accessToken) {
      return NextResponse.json(
        { detail: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.' },
        { status: 401 }
      );
    }

    let bearerToken: string | null = null;

    if (session?.user?.email) {
      // Usuario logueado: usa token de sesion
      bearerToken = (session as any).accessToken || null;
      body.email = session.user.email; // anti-IDOR
      delete body._guest_token;
    } else if (body._guest_token) {
      // Reuse del token guest emitido por sync-and-validate
      bearerToken = body._guest_token;
      delete body._guest_token;
    } else {
      // Guest checkout fresh (p. ej. al volver de MercadoPago con «atrás»): requiere email.
      // guest-token reusa al MISMO invitado por correo, así que su apartado sigue siendo suyo.
      if (!body.email || typeof body.email !== 'string') {
        return NextResponse.json({ detail: 'Escribe tu correo para continuar.' }, { status: 400 });
      }
      const invitado = await getGuestToken(
        request.headers,
        body.email,
        body.nombre,
        body.apellido || body.apellidos,
        body.telefono
      );
      if (!('token' in invitado)) {
        // Status y texto del backend tal cual (antes todo salía como 409 «tiene cuenta registrada»).
        // 409 (el correo tiene cuenta) y 403 (correo del equipo) se resuelven iniciando sesión: `code` le dice al
        // checkout que ofrezca el enlace, sin adivinar por el texto.
        const pideSesion = invitado.status === 409 || invitado.status === 403;
        return NextResponse.json(
          pideSesion ? { detail: invitado.detail, code: 'inicia_sesion' } : { detail: invitado.detail },
          { status: invitado.status }
        );
      }
      bearerToken = invitado.token;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/crear-preferencia-pago`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Status y JSON del backend TAL CUAL (F4): el 409 `{detail: {code: 'apartado_vencido', mensaje}}` no se aplana.
    const data = await response.json().catch(() => ({ detail: ERROR_GENERICO }));

    if (!response.ok) {
      console.error('Backend crear-preferencia-pago error:', response.status);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy crear-preferencia-pago:', error);
    return NextResponse.json({ detail: 'Error generando preferencia de pago' }, { status: 500 });
  }
}
