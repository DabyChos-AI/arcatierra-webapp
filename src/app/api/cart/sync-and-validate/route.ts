import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { cabecerasDelCliente } from '@/lib/ip-cliente';
import { CABECERA_LLAVE_INVITADO, guardarLlaveInvitado, llaveDelNavegador } from '@/lib/llave-invitado';

const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://arca-api:8000';

const ERROR_GENERICO = 'No pudimos continuar con tu compra. Intenta de nuevo.';

/** Token de invitado, o el status y el `detail` REALES de /auth/guest-token (429, 403 del equipo, 409 con cuenta…). */
type TokenInvitado = { token: string } | { status: number; detail: unknown };

async function getGuestToken(origen: Headers, llave: string, email: string, nombre?: string, apellidos?: string, telefono?: string): Promise<TokenInvitado> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/guest-token`, {
      method: 'POST',
      // guest-token tiene límite de 5/min: debe contar por cliente, no por servidor (A13).
      // GST2 (S68): la llave de este navegador, para que el carrito y el apartado sean suyos (lib/llave-invitado.ts).
      headers: { 'Content-Type': 'application/json', ...cabecerasDelCliente(origen), [CABECERA_LLAVE_INVITADO]: llave },
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

    // Sesion viva pero sin token: la renovacion fallo y auth-config lo borro.
    // Se corta aqui, con un mensaje para el cliente. Mandar la peticion al
    // backend solo conseguiria un 401 con texto de desarrollador ("No se
    // pudieron validar las credenciales"), y dejarla caer a la rama de
    // invitado daria un 409 todavia mas confuso, porque el correo SI tiene
    // cuenta. Mismo patron que `adminProxy()` en src/lib/admin-api-helper.ts.
    if (session?.user?.email && !(session as any).accessToken) {
      return NextResponse.json(
        { detail: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.' },
        { status: 401 }
      );
    }

    let bearerToken: string | null = null;
    // GST2 (S68): la llave de este navegador, solo para el invitado; toda respuesta de esa rama renueva su cookie.
    let llave: string | null = null;
    const responder = (res: NextResponse) => (llave ? guardarLlaveInvitado(res, llave) : res);

    if (session?.user?.email) {
      // Usuario logueado: usa su token de sesion
      bearerToken = (session as any).accessToken || null;
      body.email = session.user.email; // anti-IDOR
    } else {
      // Guest checkout: requiere email en body, obtiene token temporal
      if (!body.email || typeof body.email !== 'string') {
        return NextResponse.json({ detail: 'Escribe tu correo para continuar.' }, { status: 400 });
      }
      llave = llaveDelNavegador(request);
      const invitado = await getGuestToken(
        request.headers,
        llave,
        body.email,
        body.nombre,
        body.apellidos,
        body.telefono
      );
      if (!('token' in invitado)) {
        // Status y texto del backend tal cual (antes todo salía como 409 «tiene cuenta registrada»).
        // 409 (el correo tiene cuenta) y 403 (correo del equipo) se resuelven iniciando sesión: `code` le dice al
        // checkout que ofrezca el enlace, sin adivinar por el texto. GST3 (S68): la API nueva ya no responde 409/403
        // por correo; esta rama queda para la API de antes mientras convivan (se quita en una ronda siguiente).
        const pideSesion = invitado.status === 409 || invitado.status === 403;
        return responder(NextResponse.json(
          pideSesion ? { detail: invitado.detail, code: 'inicia_sesion' } : { detail: invitado.detail },
          { status: invitado.status }
        ));
      }
      bearerToken = invitado.token;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // A6 (R2, C6): la IP real firmada, como en crear-preferencia-pago: si el sync gana un límite por IP, cada
      // cliente cuenta por separado y no todos como el servidor de Next.
      ...cabecerasDelCliente(request.headers),
    };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/cart/sync-and-validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Status y JSON del backend TAL CUAL (F4): un `detail` objeto (409 apartado_vencido, y desde GST2 el 409
    // compra_en_otro_navegador con su `mensaje`) no se aplana; el checkout pinta `detail.mensaje`.
    const data = await response.json().catch(() => ({ detail: ERROR_GENERICO }));

    if (!response.ok) {
      console.error('Backend cart/sync-and-validate error:', response.status);
      return responder(NextResponse.json(data, { status: response.status }));
    }

    // Si fue guest checkout, retornar el token al frontend para reusarlo en crear-preferencia-pago
    if (!session) {
      data._guest_token = bearerToken;
    }

    return responder(NextResponse.json(data));
  } catch (error) {
    console.error('Error en proxy cart/sync-and-validate:', error);
    return NextResponse.json({ detail: 'Error sincronizando carrito' }, { status: 500 });
  }
}
